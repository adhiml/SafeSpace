const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    user_name: { type: String, required: true, trim: true },
    anonymous_name: { type: String, trim: true, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    role: { type: String, enum: ['student', 'counsellor'], default: 'student' },
    profile_picture: { type: String, default: '' },
    gender: { type: String, default: '' },
    faculty: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('User', userSchema);
