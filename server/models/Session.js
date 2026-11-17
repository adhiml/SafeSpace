const mongoose = require('mongoose');

// One row per logged-in device. Only a hash of the token is stored, so a leaked database
// can't be used to sign in. MongoDB deletes expired rows by itself (the TTL index).
const sessionSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  token_hash: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true, index: { expires: 0 } },
});

module.exports = mongoose.model('Session', sessionSchema);
