const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    sender_id: { type: String, ref: 'User', required: true },
    message: { type: String, required: true },
    sent_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
