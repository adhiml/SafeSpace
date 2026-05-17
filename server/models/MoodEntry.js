const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    user_id: { type: String, ref: 'User', required: true },
    mood_level: { type: Number, required: true, min: 1, max: 5 },
    stress_level: { type: Number, required: true, min: 1, max: 5 },
    stress_causes: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
