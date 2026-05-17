const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    student_user_id: { type: String, ref: 'User', required: true },
    counsellor_user_id: { type: String, ref: 'User', required: true },
    appointment_datetime: { type: Date, required: true },
    session_details: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
    is_anonymous: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
