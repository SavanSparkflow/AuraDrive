const Folder = require('../models/Folder');
const File = require('../models/File');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { logActivity } = require('../utils/activityLogger');

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

    logActivity({
      owner: req.user._id,
      action: 'create_folder',
      itemType: 'folder',
      itemName: folder.name,
      itemId: folder._id
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
    const isAll = req.query.all === 'true';

    let filter = {
      owner: req.user._id,
      isTrashed
    };

    if (!isTrashed && !isAll) {
      filter.parentFolder = parentId;
    }

    const folders = await Folder.find(filter).sort({ name: 1, createdAt: -1 });

    // If viewing inside a folder, also get the folder info and breadcrumbs
    let currentFolder = null;
    if (parentId && !isTrashed && !isAll) {
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

    const oldName = folder.name;
    folder.name = name.trim();
    await folder.save();

    // Update path names in child folders if any
    await Folder.updateMany(
      { 'path._id': folder._id, owner: req.user._id },
      { $set: { 'path.$.name': name.trim() } }
    );

    logActivity({
      owner: req.user._id,
      action: 'rename',
      itemType: 'folder',
      itemName: folder.name,
      itemId: folder._id,
      details: { oldName, newName: folder.name }
    });

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

    logActivity({
      owner: req.user._id,
      action: folder.isStarred ? 'star' : 'unstar',
      itemType: 'folder',
      itemName: folder.name,
      itemId: folder._id
    });

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

    logActivity({
      owner: req.user._id,
      action: isTrashed ? 'trash' : 'restore',
      itemType: 'folder',
      itemName: folder.name,
      itemId: folder._id
    });

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

// @desc    Update tags on a folder
// @route   PUT /api/folders/:id/tags
// @access  Private
const updateFolderTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    folder.tags = Array.isArray(tags) ? tags : [];
    await folder.save();

    res.json({
      success: true,
      message: 'Folder tags updated successfully',
      folder
    });
  } catch (error) {
    console.error('Update folder tags error:', error);
    res.status(500).json({ success: false, message: 'Server error updating folder tags' });
  }
};

// @desc    Move a folder to another parent folder (or root)
// @route   PUT /api/folders/:id/move
// @access  Private
const moveFolder = async (req, res) => {
  try {
    const { targetParentId } = req.body;
    const folderId = req.params.id;

    if (targetParentId && targetParentId.toString() === folderId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot move folder into itself' });
    }

    const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }

    const cleanParentId = targetParentId && targetParentId !== 'root' && targetParentId !== 'null' && targetParentId !== 'undefined'
      ? targetParentId
      : null;

    let newPath = [];
    if (cleanParentId) {
      const parent = await Folder.findOne({ _id: cleanParentId, owner: req.user._id, isTrashed: false });
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Target parent folder not found' });
      }

      // Check if target is inside the folder itself
      const isDescendant = parent.path && parent.path.some((p) => p._id.toString() === folderId.toString());
      if (isDescendant) {
        return res.status(400).json({ success: false, message: 'Cannot move folder into one of its own subfolders' });
      }

      newPath = [...(parent.path || []), { _id: parent._id, name: parent.name }];
    }

    folder.parentFolder = cleanParentId;
    folder.path = newPath;
    await folder.save();

    // Update child subfolder paths
    const children = await Folder.find({ 'path._id': folder._id, owner: req.user._id });
    for (const child of children) {
      const idx = child.path.findIndex((p) => p._id.toString() === folder._id.toString());
      if (idx !== -1) {
        const tail = child.path.slice(idx);
        child.path = [...newPath, ...tail];
        await child.save();
      }
    }

    logActivity({
      owner: req.user._id,
      action: 'move',
      itemType: 'folder',
      itemName: folder.name,
      itemId: folder._id,
      details: { targetParentId: cleanParentId }
    });

    res.json({
      success: true,
      message: 'Folder moved successfully',
      folder
    });
  } catch (error) {
    console.error('Move folder error:', error);
    res.status(500).json({ success: false, message: 'Server error moving folder' });
  }
};

// @desc    Copy / Duplicate a folder recursively
// @route   POST /api/folders/copy
// @access  Private
const copyFolder = async (req, res) => {
  try {
    const { folderId, targetFolderId, newName } = req.body;
    if (!folderId) {
      return res.status(400).json({ success: false, message: 'folderId is required' });
    }

    const sourceFolder = await Folder.findOne({ _id: folderId, owner: req.user._id, isTrashed: false });
    if (!sourceFolder) {
      return res.status(404).json({ success: false, message: 'Source folder not found' });
    }

    const cleanParentId = targetFolderId && targetFolderId !== 'root' ? targetFolderId : null;
    let targetParentPath = [];
    if (cleanParentId) {
      const parent = await Folder.findOne({ _id: cleanParentId, owner: req.user._id, isTrashed: false });
      if (!parent) {
        return res.status(404).json({ success: false, message: 'Target parent folder not found' });
      }
      targetParentPath = [...(parent.path || []), { _id: parent._id, name: parent.name }];
    }

    const rootFolderName = newName || `${sourceFolder.name} (Copy)`;

    // Recursive helper to duplicate folder and all children
    const duplicateFolderRecursive = async (srcFolder, newParentId, newParentPath, isRoot = false) => {
      const folderDoc = await Folder.create({
        name: isRoot ? rootFolderName : srcFolder.name,
        owner: req.user._id,
        parentFolder: newParentId,
        path: newParentPath,
        color: srcFolder.color || '#7C3AED',
        tags: srcFolder.tags || []
      });

      const currentPath = [...newParentPath, { _id: folderDoc._id, name: folderDoc.name }];

      // Duplicate files inside srcFolder
      const filesInFolder = await File.find({ folderId: srcFolder._id, owner: req.user._id, isTrashed: false });
      let addedStorage = 0;
      for (const file of filesInFolder) {
        await File.create({
          name: file.name,
          url: file.url,
          publicId: file.publicId,
          resourceType: file.resourceType,
          format: file.format,
          size: file.size,
          mimetype: file.mimetype,
          folderId: folderDoc._id,
          owner: req.user._id,
          tags: file.tags || []
        });
        addedStorage += file.size;
      }

      if (addedStorage > 0) {
        await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: addedStorage } });
      }

      // Duplicate subfolders
      const subFolders = await Folder.find({ parentFolder: srcFolder._id, owner: req.user._id, isTrashed: false });
      for (const sub of subFolders) {
        await duplicateFolderRecursive(sub, folderDoc._id, currentPath, false);
      }

      return folderDoc;
    };

    const newRootFolder = await duplicateFolderRecursive(sourceFolder, cleanParentId, targetParentPath, true);

    logActivity({
      owner: req.user._id,
      action: 'copy',
      itemType: 'folder',
      itemName: newRootFolder.name,
      itemId: newRootFolder._id,
      details: { originalName: sourceFolder.name }
    });

    res.status(201).json({
      success: true,
      message: `Folder copied as "${newRootFolder.name}"`,
      folder: newRootFolder
    });
  } catch (error) {
    console.error('Copy folder error:', error);
    res.status(500).json({ success: false, message: 'Server error copying folder' });
  }
};

module.exports = {
  createFolder,
  getFolders,
  getFolderById,
  renameFolder,
  toggleStarFolder,
  trashFolder,
  deleteFolderPermanently,
  updateFolderTags,
  moveFolder,
  copyFolder
};
