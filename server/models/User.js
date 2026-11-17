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
    year_of_study: { type: String, default: '' }, // students: "1".."5" or "Postgraduate"
    // Set when the email is verified; the account must be re-verified every year.
    email_verified_at: { type: Date },
    // When the "your verification is about to expire" email was last sent (once per verification).
    expiry_reminder_sent_at: { type: Date },
    // Seeded development accounts: usable through the demo header, never frozen.
    is_demo: { type: Boolean, default: false },
    // Which in-app notifications the user wants. Everything is on until they switch it off.
    notification_prefs: { 
      mood_checkin: { type: Boolean, default: true },
      approval: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      appointment_reminder: { type: Boolean, default: true },
      recommendation_feedback: { type: Boolean, default: true },
      new_requests: { type: Boolean, default: true }, // counsellors: new booking requests
    },
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
