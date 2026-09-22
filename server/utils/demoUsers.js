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
    specialization: 'Academic stress & anxiety',
  },
  counsellor_002: {
    _id: 'counsellor_002',
    user_name: 'Alex Johnson',
    anonymous_name: 'CounsellorAJ',
    role: 'counsellor',
    specialization: 'Mental health & wellbeing',
  },
};

const DEFAULT_DEMO_USER_ID = 'user_001';

module.exports = { DEMO_USERS, DEFAULT_DEMO_USER_ID };
