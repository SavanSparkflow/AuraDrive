const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { summarizeDocument, chatWithDocument, ocrImage } = require('../controllers/aiController');

// All AI routes require authentication
router.use(protect);

router.post('/summarize', summarizeDocument);
router.post('/chat', chatWithDocument);
router.post('/ocr', ocrImage);

module.exports = router;
