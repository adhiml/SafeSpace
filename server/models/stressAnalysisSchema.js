const mongoose = require('mongoose');

// Small embedded result of the text analysis. ai_score is never overwritten (kept for audit);
// the effective score is user_score when review === 'corrected', else ai_score.
const stressAnalysisSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['success', 'unavailable'], default: 'unavailable' },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    ai_score: { type: Number, min: 1, max: 5 },
    confidence: { type: String, enum: ['low', 'medium', 'high'] },
    review: { type: String, enum: ['pending', 'affirmed', 'corrected'], default: 'pending' },
    user_score: { type: Number, min: 1, max: 5 },
    reviewed_at: Date,
  },
  { _id: false }
);

module.exports = stressAnalysisSchema;
