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
  getStorageStats
} = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

// Public route for shared file access
router.get('/public/:shareToken', getPublicFile);

// All subsequent file routes require authentication
router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/starred', getStarredItems);
router.get('/recent', getRecentFiles);
router.get('/trash', getTrashItems);
router.get('/search', searchItems);
router.get('/storage-stats', getStorageStats);
router.delete('/trash/empty', emptyTrash);

router.route('/:id')
  .delete(deleteFilePermanently);

router.put('/:id/rename', renameFile);
router.put('/:id/star', toggleStarFile);
router.put('/:id/trash', trashFile);
router.put('/:id/share', shareFile);

module.exports = router;
