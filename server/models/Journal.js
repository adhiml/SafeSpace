const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    user_id: { type: String, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    is_sentiment_enabled: { type: Boolean, default: false },
    sentiment_score: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Journal', journalSchema);
