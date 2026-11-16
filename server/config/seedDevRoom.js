const Appointment = require('../models/Appointment');

// One always-open chatroom for development: Jamie Chen (student) <-> Morgan Lee (counsellor).
// Dated long ago so it never shows up in schedules, stats or slot availability.
const STUDENT_ID = 'user_001';
const COUNSELLOR_ID = 'counsellor_001';

const seedDevRoom = async () => {
  await Appointment.findOneAndUpdate(
    { is_dev_room: true },
    {
      student_user_id: STUDENT_ID,
      counsellor_user_id: COUNSELLOR_ID,
      appointment_datetime: new Date('2000-01-03T01:00:00.000Z'),
      session_details: 'Developer test chatroom (always open)',
      status: 'approved',
      is_anonymous: false,
      is_dev_room: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Dev chatroom ready: Jamie Chen <-> Morgan Lee');
};

module.exports = seedDevRoom;
