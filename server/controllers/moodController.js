const MoodEntry = require('../models/MoodEntry');
const asyncHandler = require('../utils/asyncHandler');

const {
  buildDailyStats,
  buildWeeklyStats,
  buildMonthlyStats,
  generateWeeklyInsights,
  generateMonthlyInsights,
} = require('../services/moodAnalyticsService');

const createMood = asyncHandler(async (req, res) => {
  const { mood_level, stress_level, stress_causes } = req.body;
  if (!mood_level || !stress_level) {
    res.status(400);
    throw new Error('mood_level and stress_level are required');
  }
  const entry = await MoodEntry.create({
    user_id: req.demoUserId,
    mood_level,
    stress_level,
    stress_causes: stress_causes || [],
  });
  res.status(201).json(entry);
});

const getMoods = asyncHandler(async (req, res) => {
  const entries = await MoodEntry.find({ user_id: req.demoUserId })
    .sort({ created_at: -1 })
    .limit(30);
  res.json(entries);
});

const getMoodAnalytics = asyncHandler(async (req, res) => {
  const entries = await MoodEntry.find({ user_id: req.demoUserId })
    .sort({ created_at: -1 })
    .limit(60);

  // STEP 1: normalize
  const daily = buildDailyStats(entries);

  // STEP 2: aggregate
  const weekly = buildWeeklyStats(daily);
  const monthly = buildMonthlyStats(daily);

  // // STEP 3: insights
  // const weeklyInsights = generateWeeklyInsights(weekly);
  // const monthlyInsights = generateMonthlyInsights(monthly);

  res.json({
    trend: daily,
    weekly,
    monthly,
    // insights: {
    //   weekly: weeklyInsights,
    //   monthly: monthlyInsights,
    // },
  });
});

const getCounsellorAnalytics = asyncHandler(async (req, res) => {
  const entries = await MoodEntry.find()
    .sort({ created_at: -1 })
    .limit(500);

  const daily = buildDailyStats(entries);
  const weekly = buildWeeklyStats(daily);
  const monthly = buildMonthlyStats(daily);

  const studentIds = [...new Set(entries.map((e) => String(e.user_id)))];

  res.json({
    studentCount: studentIds.length,
    totalEntries: entries.length,
    daily,
    weekly,
    monthly,
    // insights: {
    //   weekly: generateWeeklyInsights(weekly),
    //   monthly: generateMonthlyInsights(monthly),
    // },
  });
});

module.exports = { createMood, getMoods, getMoodAnalytics, getCounsellorAnalytics };
