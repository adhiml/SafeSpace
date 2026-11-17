/**
 * Sets an account's email verification date by hand. For development, testing the frozen states,
 * and as a safety net if a real code email ever fails to arrive.
 *
 *   npm run set:verified -- someone@siswa.um.edu.my          verified just now
 *   npm run set:verified -- someone@siswa.um.edu.my 400      verified 400 days ago (so: expired)
 *   npm run set:verified -- someone@siswa.um.edu.my 355      verified 355 days ago (renewal due soon)
 *   npm run set:verified -- someone@siswa.um.edu.my none     never verified (blocked)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { accountState } = require('../utils/accountState');

const [emailArg, whenArg = 'now'] = process.argv.slice(2);

const main = async () => {
  if (!emailArg) throw new Error('Usage: npm run set:verified -- <email> [now | none | <days ago>]');
  const when = whenArg.toLowerCase();
  if (when !== 'now' && when !== 'none' && !(Number.isInteger(Number(when)) && Number(when) >= 0)) {
    throw new Error('The second value must be "now", "none" or a number of days ago');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: emailArg.trim().toLowerCase() });
  if (!user) throw new Error(`No account with the email ${emailArg}`);

  if (when === 'none') {
    user.email_verified_at = undefined;
  } else {
    user.email_verified_at = new Date(Date.now() - (when === 'now' ? 0 : Number(when)) * 24 * 60 * 60 * 1000);
  }
  user.expiry_reminder_sent_at = undefined; // a new verification date starts a new reminder cycle
  await user.save();

  const { state, verifiedUntil, daysLeft } = accountState(user);
  console.log(`${user.email}: ${state}${verifiedUntil ? ` (verified until ${verifiedUntil.toISOString().slice(0, 10)}, ${daysLeft} days left)` : ''}`);
};

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
