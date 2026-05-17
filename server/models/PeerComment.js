const mongoose = require('mongoose');

const peerCommentSchema = new mongoose.Schema(
  {
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PeerPost', required: true },
    user_id: { type: String, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('PeerComment', peerCommentSchema);
