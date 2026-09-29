const express = require('express');
const router = express.Router();
const {
  createFolder,
  getFolders,
  getFolderById,
  renameFolder,
  toggleStarFolder,
  trashFolder,
  deleteFolderPermanently,
  updateFolderTags
} = require('../controllers/folderController');
const { downloadFolderZip } = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All folder operations require auth

router.route('/')
  .post(createFolder)
  .get(getFolders);

router.get('/:id/download-zip', downloadFolderZip);
router.put('/:id/tags', updateFolderTags);

router.route('/:id')
  .get(getFolderById)
  .delete(deleteFolderPermanently);

router.put('/:id/rename', renameFolder);
router.put('/:id/star', toggleStarFolder);
router.put('/:id/trash', trashFolder);

module.exports = router;
