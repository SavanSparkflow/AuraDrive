const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  getStarredItems,
  getRecentFiles,
  getTrashItems,
  searchItems,
  toggleStarFile,
  renameFile,
  trashFile,
  shareFile,
  getPublicFile,
  deleteFilePermanently,
  emptyTrash,
  getStorageStats,
  getFileVersions,
  restoreFileVersion,
  deleteFileVersion,
  updateFileTags,
  bulkTag,
  bulkStar,
  bulkTrash,
  bulkDelete,
  downloadZip,
  uploadChunk
} = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

// Public route for shared file access
router.get('/public/:shareToken', getPublicFile);

// All subsequent file routes require authentication
router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.post('/chunk-upload', upload.single('chunk'), uploadChunk);
router.post('/download-zip', downloadZip);

// Bulk operations
router.post('/bulk-star', bulkStar);
router.post('/bulk-trash', bulkTrash);
router.post('/bulk-delete', bulkDelete);
router.post('/bulk-tag', bulkTag);

router.get('/', getFiles);
router.get('/starred', getStarredItems);
router.get('/recent', getRecentFiles);
router.get('/trash', getTrashItems);
router.get('/search', searchItems);
router.get('/storage-stats', getStorageStats);
router.delete('/trash/empty', emptyTrash);

// File Versions
router.get('/:id/versions', getFileVersions);
router.put('/:id/restore-version/:versionNumber', restoreFileVersion);
router.delete('/:id/versions/:versionNumber', deleteFileVersion);

// Tags
router.put('/:id/tags', updateFileTags);

router.route('/:id')
  .delete(deleteFilePermanently);

router.put('/:id/rename', renameFile);
router.put('/:id/star', toggleStarFile);
router.put('/:id/trash', trashFile);
router.put('/:id/share', shareFile);

module.exports = router;
