/** Single demo user — all API writes use this id until real auth is added */
const currentUser = {
  _id: 'user_001',
  user_name: 'Demo Student',
  role: 'student',
};

const DUMMY_COUNSELLOR_ID = 'counsellor_001';

module.exports = { currentUser, CURRENT_USER_ID: currentUser._id, DUMMY_COUNSELLOR_ID };
