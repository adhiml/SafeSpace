const User = require('../models/User');
const { currentUser, DUMMY_COUNSELLOR_ID } = require('../utils/currentUser');

/** Ensures demo student + counsellor exist in MongoDB */
const seedUsers = async () => {
  await User.findByIdAndUpdate(
    currentUser._id,
    {
      _id: currentUser._id,
      user_name: currentUser.user_name,
      anonymous_name: 'AnonymousDemo',
      email: 'demo@safespace.app',
      role: 'student',
      faculty: 'General Studies',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await User.findByIdAndUpdate(
    DUMMY_COUNSELLOR_ID,
    {
      _id: DUMMY_COUNSELLOR_ID,
      user_name: 'Dr. Morgan Lee',
      anonymous_name: 'CounsellorML',
      email: 'counsellor@safespace.app',
      role: 'counsellor',
      faculty: 'Student Wellness Centre',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Demo users ready:', currentUser._id, DUMMY_COUNSELLOR_ID);
};

module.exports = seedUsers;
