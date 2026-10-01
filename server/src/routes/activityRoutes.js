const express = require('express');
const router = express.Router();
const { getActivities, clearActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getActivities);
router.delete('/', clearActivities);

module.exports = router;
