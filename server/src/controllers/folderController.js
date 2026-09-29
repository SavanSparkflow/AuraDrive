const Folder = require('../models/Folder');
const File = require('../models/File');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name, parentFolderId, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Folder name is required' });
    }

    let folderPath = [];

    if (parentFolderId) {
      const parent = await Folder.findOne({ _id: parentFolderId, owner: req.user._id, isTrashed: false });
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Parent folder not found' });
      }

      // Inherit path and append parent
      folderPath = [...(parent.path || []), { _id: parent._id, name: parent.name }];
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentFolderId || null,
      path: folderPath,
      color: color || '#7C3AED'
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating folder' });
  }
};

// @desc    Get subfolders in a folder (or root if no parentId)
// @route   GET /api/folders?parentId=...
// @access  Private
const getFolders = async (req, res) => {
  try {
    const parentId = req.query.parentId && req.query.parentId !== 'root' ? req.query.parentId : null;
    const isTrashed = req.query.trashed === 'true';

    let filter = {
      owner: req.user._id,
      isTrashed
    };

    if (!isTrashed) {
      filter.parentFolder = parentId;
    }

    const folders = await Folder.find(filter).sort({ createdAt: -1 });

    // If viewing inside a folder, also get the folder info and breadcrumbs
    let currentFolder = null;
    if (parentId && !isTrashed) {
      currentFolder = await Folder.findOne({ _id: parentId, owner: req.user._id });
    }

    res.json({
      success: true,
      folders,
      currentFolder
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving folders' });
  }
};

// @desc    Get single folder details with full breadcrumb
// @route   GET /api/folders/:id
// @access  Private
const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    res.json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Get folder by id error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving folder' });
  }
};

// @desc    Rename a folder
// @route   PUT /api/folders/:id/rename
// @access  Private
const renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'New folder name is required' });
    }

    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    folder.name = name.trim();
    await folder.save();

    // Update path names in child folders if any
    await Folder.updateMany(
      { 'path._id': folder._id, owner: req.user._id },
      { $set: { 'path.$.name': name.trim() } }
    );

    res.json({
      success: true,
      message: 'Folder renamed successfully',
      folder
    });
  } catch (error) {
    console.error('Rename folder error:', error);
    res.status(500).json({ success: false, message: 'Server error renaming folder' });
  }
};

// @desc    Toggle Star on folder
// @route   PUT /api/folders/:id/star
// @access  Private
const toggleStarFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    folder.isStarred = !folder.isStarred;
    await folder.save();

    res.json({
      success: true,
      message: folder.isStarred ? 'Added folder to starred' : 'Removed folder from starred',
      folder
    });
  } catch (error) {
    console.error('Star folder error:', error);
    res.status(500).json({ success: false, message: 'Server error updating star status' });
  }
};

// @desc    Move folder to Trash or Restore
// @route   PUT /api/folders/:id/trash
// @access  Private
const trashFolder = async (req, res) => {
  try {
    const { trash } = req.body; // true to trash, false to restore
    const isTrashed = trash !== undefined ? Boolean(trash) : true;

    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    folder.isTrashed = isTrashed;
    folder.trashedAt = isTrashed ? new Date() : null;
    await folder.save();

    // Also trash or restore subfolders and child files
    await Folder.updateMany(
      { 'path._id': folder._id, owner: req.user._id },
      { $set: { isTrashed, trashedAt: isTrashed ? new Date() : null } }
    );

    await File.updateMany(
      { folderId: folder._id, owner: req.user._id },
      { $set: { isTrashed, trashedAt: isTrashed ? new Date() : null } }
    );

    res.json({
      success: true,
      message: isTrashed ? 'Folder moved to Trash' : 'Folder restored from Trash',
      folder
    });
  } catch (error) {
    console.error('Trash folder error:', error);
    res.status(500).json({ success: false, message: 'Server error trashing folder' });
  }
};

// @desc    Permanently delete a folder and all contents
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolderPermanently = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    // Find all subfolder IDs
    const childFolders = await Folder.find({ 'path._id': folder._id, owner: req.user._id });
    const allFolderIds = [folder._id, ...childFolders.map(f => f._id)];

    // Find all files within these folders to remove from Cloudinary
    const filesToDelete = await File.find({ folderId: { $in: allFolderIds }, owner: req.user._id });

    for (const file of filesToDelete) {
      try {
        if (file.publicId && !file.publicId.startsWith('auradrive_demo_')) {
          await cloudinary.uploader.destroy(file.publicId, {
            resource_type: file.resourceType || 'raw'
          });
        }
      } catch (err) {
        console.warn('Could not delete file from Cloudinary:', file.publicId, err.message);
      }
    }

    // Delete DB records
    await File.deleteMany({ folderId: { $in: allFolderIds }, owner: req.user._id });
    await Folder.deleteMany({ _id: { $in: allFolderIds }, owner: req.user._id });

    res.json({
      success: true,
      message: 'Folder and all its contents permanently deleted'
    });
  } catch (error) {
    console.error('Permanent delete folder error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting folder' });
  }
};

module.exports = {
  createFolder,
  getFolders,
  getFolderById,
  renameFolder,
  toggleStarFolder,
  trashFolder,
  deleteFolderPermanently
};
