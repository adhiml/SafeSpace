const crypto = require('crypto');
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');
const Session = require('../models/Session');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../utils/password');
const { aliasProblem } = require('../utils/profileRules');
const { accountState } = require('../utils/accountState');
const { FACULTIES, YEARS_OF_STUDY, GENDERS, roleForEmail } = require('../utils/options');
const { hashToken } = require('../middleware/auth');
const { toProfile } = require('./userController');
const verification = require('../services/verification');
const { deleteUserData } = require('../services/accountDeletion');

// While this is off, new accounts count as verified when they sign up. When it is on, sign-ups
// start unverified and must enter the code emailed to them before they can use the app.
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
const SESSION_DAYS = 30;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const text = (v) => (typeof v === 'string' ? v.trim() : '');

const accountInfo = (user) => {
  const { state, verifiedUntil, daysLeft, renewSoon } = accountState(user);
  return { state, verified_until: verifiedUntil, days_left: daysLeft, renew_soon: renewSoon };
};

// Verification problems carry their own status (e.g. 429 for asking too often); pass it on.
const withStatus = async (res, work) => {
  try {
    return await work();
  } catch (e) {
    if (e.status) res.status(e.status);
    throw e;
  }
};

const maskEmail = (email) => `${email.slice(0, 2)}***${email.slice(email.indexOf('@'))}`;

const startSession = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  await Session.create({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  });
  return token;
};

const register = asyncHandler(async (req, res) => {
  const email = text(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const userName = text(req.body.user_name);
  const gender = text(req.body.gender);

  // 1. The email must be a university address, and must be on the list as the right kind of user.
  const role = roleForEmail(email);
  if (!role) fail(res, 400, 'Use your university email: @siswa.um.edu.my for students or @um.edu.my for counsellors.');

  const listed = await AllowedEmail.findOne({ email });
  if (!listed || listed.role !== role) {
    fail(res, 403, 'This email is not on the university list. Check the address, or contact the SafeSpace team.');
  }
  if (await User.exists({ email })) fail(res, 409, 'An account with this email already exists. Please log in.');

  // 2. Fields everyone fills in.
  if (password.length < MIN_PASSWORD) fail(res, 400, `Your password must be at least ${MIN_PASSWORD} characters`);
  if (password.length > MAX_PASSWORD) fail(res, 400, `Your password must be at most ${MAX_PASSWORD} characters`);
  if (!userName) fail(res, 400, 'Enter your display name');
  if (userName.length > 60) fail(res, 400, 'Your display name must be at most 60 characters');
  if (!GENDERS.includes(gender)) fail(res, 400, 'Choose your gender');

  // 3. Fields that depend on the kind of user.
  const profile = { user_name: userName, gender, email, role };
  if (role === 'student') {
    const anonymous = text(req.body.anonymous_name);
    const faculty = text(req.body.faculty);
    const year = text(req.body.year_of_study);

    if (anonymous.length > 30) fail(res, 400, 'Your anonymous name must be at most 30 characters');
    const problem = await aliasProblem(anonymous, userName);
    if (problem) fail(res, problem.status, problem.message);
    if (!FACULTIES.includes(faculty)) fail(res, 400, 'Choose your faculty');
    if (!YEARS_OF_STUDY.includes(year)) fail(res, 400, 'Choose your year of study');

    Object.assign(profile, { anonymous_name: anonymous, faculty, year_of_study: year });
  } else {
    const specialization = text(req.body.specialization);
    if (!specialization) fail(res, 400, 'Enter your specialization');
    if (specialization.length > 100) fail(res, 400, 'Your specialization must be at most 100 characters');

    Object.assign(profile, { specialization, display_title: 'Dr.' });
  }

  // 4. Create the account.
  const user = await User.create({
    _id: `usr_${crypto.randomBytes(8).toString('hex')}`,
    ...profile,
    password_hash: await hashPassword(password),
    email_verified_at: REQUIRE_EMAIL_VERIFICATION ? undefined : new Date(),
  });

  // Either way they are signed in. When verification is required they land on the "enter your
  // code" screen, and the first code is emailed now.
  const token = await startSession(user._id);
  if (REQUIRE_EMAIL_VERIFICATION) {
    await verification.issueCode(user).catch((e) => console.warn('[verify] could not send the first code:', e.message));
  }
  res.status(201).json({ token, user: toProfile(user), account: accountInfo(user) });
});

// Wrong-password attempts per email, kept in memory: 5 misses lock that email for 15 minutes.
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const attempts = new Map();

const login = asyncHandler(async (req, res) => {
  const email = text(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) fail(res, 400, 'Enter your email and password');

  const state = attempts.get(email);
  if (state && state.lockedUntil > Date.now()) {
    const minutes = Math.ceil((state.lockedUntil - Date.now()) / 60000);
    fail(res, 429, `Too many incorrect attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const user = await User.findOne({ email }).select('+password_hash');
  const ok = !!user?.password_hash && (await verifyPassword(password, user.password_hash));

  if (!ok) {
    const count = (state?.count ?? 0) + 1;
    attempts.set(email, count >= MAX_ATTEMPTS ? { count: 0, lockedUntil: Date.now() + LOCK_MS } : { count, lockedUntil: 0 });
    // Same message whether the email or the password was wrong, so emails can't be probed.
    fail(res, 401, 'Incorrect email or password');
  }

  attempts.delete(email);
  const token = await startSession(user._id);
  res.json({ token, user: toProfile(user), account: accountInfo(user) });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: toProfile(req.user), account: accountInfo(req.user) });
});

const logout = asyncHandler(async (req, res) => {
  const token = (req.headers.authorization || '').match(/^Bearer (.+)$/i)?.[1];
  if (token) await Session.deleteOne({ token_hash: hashToken(token) });
  res.json({ message: 'Signed out' });
});

// Email a verification code. For accounts that are unverified or expired, and for active ones
// that are within two weeks of expiring (renewing early).
const sendCode = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.is_demo) fail(res, 400, 'Demo accounts do not need verification');

  const { state, renewSoon } = accountState(user);
  if (state === 'active' && !renewSoon) fail(res, 400, 'Your email is already verified.');

  const sent = await withStatus(res, () => verification.issueCode(user));
  res.json({
    message: `We sent a code to ${maskEmail(user.email)}.`,
    expires_in_minutes: sent.expiresInMinutes,
    resend_after_seconds: sent.resendAfterSeconds,
  });
});

// Check the code. If it is right the email counts as verified for another year.
const verify = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user.is_demo) fail(res, 400, 'Demo accounts do not need verification');

  await withStatus(res, () => verification.checkCode(user, req.body.code));

  user.email_verified_at = new Date();
  await user.save();
  res.json({ user: toProfile(user), account: accountInfo(user) });
});

// Wrong-password attempts when deleting an account: 5 misses lock it for 15 minutes (kept in memory).
const deleteAttempts = new Map();

// Permanently deletes the signed-in user's account and all their data. The password is required so a
// borrowed or lost phone can't wipe an account. Works for frozen accounts too: someone whose
// verification lapsed may well want to delete and register again.
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (req.user.is_demo) fail(res, 400, "Demo accounts can't be deleted.");

  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!password) fail(res, 400, 'Enter your password to delete your account.');

  const state = deleteAttempts.get(userId);
  if (state && state.lockedUntil > Date.now()) {
    const minutes = Math.ceil((state.lockedUntil - Date.now()) / 60000);
    fail(res, 429, `Too many incorrect attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const withHash = await User.findById(userId).select('+password_hash');
  if (!withHash?.password_hash || !(await verifyPassword(password, withHash.password_hash))) {
    const count = (state?.count ?? 0) + 1;
    deleteAttempts.set(userId, count >= 5 ? { count: 0, lockedUntil: Date.now() + 15 * 60 * 1000 } : { count, lockedUntil: 0 });
    fail(res, 403, 'Your password is incorrect.');
  }

  deleteAttempts.delete(userId);
  await deleteUserData(userId);
  res.json({ message: 'Your account has been deleted.' });
});

module.exports = { register, login, me, logout, sendCode, verify, deleteAccount };
