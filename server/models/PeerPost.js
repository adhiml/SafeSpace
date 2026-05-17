const mongoose = require('mongoose');

const peerPostSchema = new mongoose.Schema(
  {
    user_id: { type: String, ref: 'User', required: true },
    content: { type: String, required: true },
    sentiment_score: { type: Number, default: 0 },
    tags: [{ type: String }],
    me_too_count: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('PeerPost', peerPostSchema);
