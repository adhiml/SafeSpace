const mongoose = require('mongoose');

// The university's email list. Only a developer fills this (npm run import:emails);
// registration is rejected unless the email is here with the matching role.
const allowedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, required: true, enum: ['student', 'counsellor'] },
});

module.exports = mongoose.model('AllowedEmail', allowedEmailSchema);
