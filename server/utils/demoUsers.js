/** Demo users for development role switching (no auth) */
const DEMO_USERS = {
  user_001: {
    _id: 'user_001',
    user_name: 'Jamie Chen',
    anonymous_name: 'Anonymous2048',
    role: 'student',
    faculty: 'Computer Science',
  },
  user_002: {
    _id: 'user_002',
    user_name: 'Sam Rivera',
    anonymous_name: 'Anonymous7312',
    role: 'student',
    faculty: 'Psychology',
  },
  counsellor_001: {
    _id: 'counsellor_001',
    user_name: 'Morgan Lee',
    anonymous_name: 'CounsellorML',
    role: 'counsellor',
    faculty: 'Student Wellness Centre',
    specialization: 'Academic stress & anxiety',
  },
};

const DEFAULT_DEMO_USER_ID = 'user_001';

module.exports = { DEMO_USERS, DEFAULT_DEMO_USER_ID };
