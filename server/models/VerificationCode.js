const mongoose = require('mongoose');

// One row per user: the current email-verification code (stored hashed) and a short history of
// when codes were sent, which is what the resend limits are checked against.
const verificationCodeSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  code_hash: { type: String, default: '' }, // empty = no usable code (used up or cancelled)
  expires_at: { type: Date },
  attempts: { type: Number, default: 0 }, // wrong guesses against the current code
  sent_at: [{ type: Date }], // sends during the last hour
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
