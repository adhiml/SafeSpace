const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: String, ref: 'User', required: true },
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    // What kind of notification this is; the user's notification settings are applied per type.
    type: {
      type: String,
      enum: [
        'new_request', // counsellor: a student asked for a session
        'approval', // student: the counsellor approved or declined
        'appointment_update', // anything else about an appointment (always delivered)
        'message',
        'appointment_reminder',
        'mood_checkin',
        'recommendation_feedback',
        'general',
      ],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Notification', notificationSchema);
