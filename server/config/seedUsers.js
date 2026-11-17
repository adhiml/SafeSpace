const User = require('../models/User');
const { DEMO_USERS } = require('../utils/demoUsers');
const { hashPassword } = require('../utils/password');

// Development only: the demo accounts have no sign-up, so they start with this password.
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'safespace123';

// Creates the demo users if they don't exist. Existing users are left alone, so profile
// edits made in the app (names, alias, faculty...) survive a server restart.
const seedUsers = async () => {
  for (const user of Object.values(DEMO_USERS)) {
    await User.updateOne(
      { _id: user._id },
      {
        $setOnInsert: {
          user_name: user.user_name,
          anonymous_name: user.anonymous_name,
          email: `${user._id}@safespace.app`,
          role: user.role,
          faculty: user.faculty || '',
          specialization: user.specialization || '',
          gender: '',
        },
      },
      { upsert: true }
    );

    await User.updateOne({ _id: user._id }, { $set: { is_demo: true } });

    // Counsellors written before display_title existed get the default once.
    if (user.role === 'counsellor') {
      await User.updateOne(
        { _id: user._id, display_title: { $exists: false } },
        { $set: { display_title: 'Dr.' } }
      );
    }
    if (process.env.NODE_ENV !== 'production') {
      await User.updateOne(
        { _id: user._id, password_hash: { $exists: false } },
        { $set: { password_hash: await hashPassword(DEMO_PASSWORD) } }
      );
    }
  }
  console.log('Demo users ready:', Object.keys(DEMO_USERS).join(', '));
  if (process.env.NODE_ENV !== 'production') console.log('Demo accounts start with the development password:', DEMO_PASSWORD);
};

module.exports = seedUsers;
