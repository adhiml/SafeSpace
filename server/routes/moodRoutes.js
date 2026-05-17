const express = require('express');
const { createMood, getMoods, getMoodAnalytics } = require('../controllers/moodController');

const router = express.Router();

router.post('/', createMood);
router.get('/', getMoods);
router.get('/analytics', getMoodAnalytics);

module.exports = router;
