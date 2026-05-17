const User = require('../models/User');
const { DEMO_USERS } = require('../utils/demoUsers');

const seedUsers = async () => {
  for (const user of Object.values(DEMO_USERS)) {
    await User.findByIdAndUpdate(
      user._id,
      {
        _id: user._id,
        user_name: user.user_name,
        anonymous_name: user.anonymous_name,
        email: `${user._id}@safespace.app`,
        role: user.role,
        faculty: user.faculty || '',
        gender: '',
        profile_picture: '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('Demo users ready:', Object.keys(DEMO_USERS).join(', '));
};

module.exports = seedUsers;
