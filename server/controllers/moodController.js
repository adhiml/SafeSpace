const MoodEntry = require('../models/MoodEntry');
const asyncHandler = require('../utils/asyncHandler');
const { CURRENT_USER_ID } = require('../utils/currentUser');

// POST /api/moods
const createMood = asyncHandler(async (req, res) => {
  const { mood_level, stress_level, stress_causes } = req.body;

  if (!mood_level || !stress_level) {
    res.status(400);
    throw new Error('mood_level and stress_level are required');
  }

  const entry = await MoodEntry.create({
    user_id: CURRENT_USER_ID,
    mood_level,
    stress_level,
    stress_causes: stress_causes || [],
  });

  res.status(201).json(entry);
});

// GET /api/moods
const getMoods = asyncHandler(async (req, res) => {
  const entries = await MoodEntry.find({ user_id: CURRENT_USER_ID })
    .sort({ created_at: -1 })
    .limit(30);
  res.json(entries);
});

// GET /api/moods/analytics
const getMoodAnalytics = asyncHandler(async (req, res) => {
  const entries = await MoodEntry.find({ user_id: CURRENT_USER_ID })
    .sort({ created_at: -1 })
    .limit(14);

  const avgMood =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.mood_level, 0) / entries.length
      : 0;
  const avgStress =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.stress_level, 0) / entries.length
      : 0;

  const causeMap = {};
  entries.forEach((e) => {
    (e.stress_causes || []).forEach((c) => {
      causeMap[c] = (causeMap[c] || 0) + 1;
    });
  });

  const topCauses = Object.entries(causeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cause, count]) => ({ cause, count }));

  res.json({
    entries,
    averages: { mood: avgMood, stress: avgStress },
    topStressCauses: topCauses,
    trend: entries.map((e) => ({
      date: e.created_at,
      mood_level: e.mood_level,
      stress_level: e.stress_level,
    })),
  });
});

module.exports = { createMood, getMoods, getMoodAnalytics };
