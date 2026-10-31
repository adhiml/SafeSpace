const express = require('express');
const {
  createMood,
  getMoods,
  getMoodAnalytics,
  getCounsellorAnalytics,
  getDailyStressSummary,
} = require('../controllers/moodController');

const router = express.Router();

router.post('/', createMood);
router.get('/', getMoods);
router.get('/daily-stress', getDailyStressSummary);
router.get('/analytics', getMoodAnalytics);
router.get('/analytics/counsellor', getCounsellorAnalytics);

module.exports = router;
