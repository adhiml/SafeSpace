const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    user_name: { type: String, required: true, trim: true },
    anonymous_name: { type: String, trim: true, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    role: { type: String, enum: ['student', 'counsellor'], default: 'student' },
    gender: { type: String, default: '' },
    faculty: { type: String, default: '' },
    specialization: { type: String, default: '' },
    // Counsellors only (e.g. "Dr."). No default, so a missing value can be told apart from a blank one.
    display_title: { type: String, trim: true },
    // "<salt>:<scrypt key>". select:false keeps it out of every normal query and response.
    password_hash: { type: String, select: false },
    password_changed_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('User', userSchema);
