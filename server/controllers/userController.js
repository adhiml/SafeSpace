const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../utils/password');
const { aliasProblem } = require('../utils/profileRules');
const { FACULTIES, YEARS_OF_STUDY, GENDERS } = require('../utils/options');

// Fields each role may edit, and their maximum lengths. Email is read-only.
const EDITABLE = {
  student: ['user_name', 'anonymous_name', 'gender', 'faculty', 'year_of_study'],
  counsellor: ['user_name', 'display_title', 'specialization', 'gender'],
};
const MAX_LENGTH = {
  user_name: 60,
  anonymous_name: 30,
  gender: 30,
  faculty: 80,
  year_of_study: 12,
  specialization: 100,
  display_title: 20,
};
// Fields that must be one of a fixed list (checked only when the value actually changes,
// so older accounts with free-text values can still save their other fields).
const CHOICES = { gender: GENDERS, faculty: FACULTIES, year_of_study: YEARS_OF_STUDY };

const toProfile = (u) => ({
  _id: u._id,
  user_name: u.user_name,
  anonymous_name: u.anonymous_name,
  email: u.email,
  role: u.role,
  gender: u.gender,
  faculty: u.faculty,
  year_of_study: u.year_of_study,
  specialization: u.specialization,
  display_title: u.display_title,
});

const fail = (res, status, message) => {
  res.status(status);
  throw new Error(message);
};

const getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.demoUserId);
  if (!me) fail(res, 404, 'User not found');
  res.json(toProfile(me));
});

const updateMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.demoUserId);
  if (!me) fail(res, 404, 'User not found');

  const isCounsellor = me.role === 'counsellor';
  const updates = {};

  for (const field of EDITABLE[isCounsellor ? 'counsellor' : 'student']) {
    const raw = req.body[field];
    if (raw === undefined) continue;
    if (typeof raw !== 'string') fail(res, 400, `${field} must be text`);
    const value = raw.trim();
    if (value.length > MAX_LENGTH[field]) fail(res, 400, `${field} must be at most ${MAX_LENGTH[field]} characters`);
    if (CHOICES[field] && value && value !== me[field] && !CHOICES[field].includes(value)) {
      fail(res, 400, `Choose a valid option for ${field.replace(/_/g, ' ')}`);
    }
    updates[field] = value;
  }

  if ('user_name' in updates && !updates.user_name) fail(res, 400, 'Your name cannot be empty');

  if (!isCounsellor && ('anonymous_name' in updates || 'user_name' in updates)) {
    const problem = await aliasProblem(
      updates.anonymous_name ?? me.anonymous_name,
      updates.user_name ?? me.user_name,
      me._id
    );
    if (problem) fail(res, problem.status, problem.message);
  }

  Object.assign(me, updates);
  await me.save();
  res.json(toProfile(me));
});

// Wrong-password attempts per user, kept in memory: 5 misses lock the endpoint for 15 minutes.
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const attempts = new Map();
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

const changePassword = asyncHandler(async (req, res) => {
  const { current_password: current, new_password: next } = req.body;

  if (typeof current !== 'string' || typeof next !== 'string' || !current || !next) {
    fail(res, 400, 'Enter your current password and a new password');
  }
  if (next.length < MIN_PASSWORD) fail(res, 400, `The new password must be at least ${MIN_PASSWORD} characters`);
  if (next.length > MAX_PASSWORD) fail(res, 400, `The new password must be at most ${MAX_PASSWORD} characters`);
  if (next === current) fail(res, 400, 'The new password must be different from the current one');

  const state = attempts.get(req.demoUserId);
  if (state && state.lockedUntil > Date.now()) {
    const minutes = Math.ceil((state.lockedUntil - Date.now()) / 60000);
    fail(res, 429, `Too many incorrect attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const me = await User.findById(req.demoUserId).select('+password_hash');
  if (!me) fail(res, 404, 'User not found');
  if (!me.password_hash) fail(res, 409, 'This account has no password set yet');

  if (!(await verifyPassword(current, me.password_hash))) {
    const count = (state?.count ?? 0) + 1;
    attempts.set(req.demoUserId, count >= MAX_ATTEMPTS ? { count: 0, lockedUntil: Date.now() + LOCK_MS } : { count, lockedUntil: 0 });
    fail(res, 403, 'Your current password is incorrect');
  }

  attempts.delete(req.demoUserId);
  me.password_hash = await hashPassword(next);
  me.password_changed_at = new Date();
  await me.save();
  res.json({ message: 'Password changed' });
});

const NOTIFICATION_KEYS = ['mood_checkin', 'approval', 'messages', 'appointment_reminder', 'recommendation_feedback', 'new_requests'];

const pickPrefs = (user) => Object.fromEntries(NOTIFICATION_KEYS.map((k) => [k, user.notification_prefs?.[k] !== false]));

const getNotificationSettings = asyncHandler(async (req, res) => {
  const me = await User.findById(req.demoUserId);
  if (!me) fail(res, 404, 'User not found');
  res.json(pickPrefs(me));
});

const updateNotificationSettings = asyncHandler(async (req, res) => {
  const me = await User.findById(req.demoUserId);
  if (!me) fail(res, 404, 'User not found');

  for (const [key, value] of Object.entries(req.body || {})) {
    if (!NOTIFICATION_KEYS.includes(key)) fail(res, 400, `Unknown notification setting: ${key}`);
    if (typeof value !== 'boolean') fail(res, 400, `${key} must be true or false`);
    me.set(`notification_prefs.${key}`, value);
  }
  await me.save();
  res.json(pickPrefs(me));
});

module.exports = { getMe, updateMe, changePassword, toProfile, getNotificationSettings, updateNotificationSettings };
