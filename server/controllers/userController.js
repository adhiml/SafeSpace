const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../utils/password');

// Fields each role may edit, and their maximum lengths. Email is read-only.
const EDITABLE = {
  student: ['user_name', 'anonymous_name', 'gender', 'faculty'],
  counsellor: ['user_name', 'display_title', 'specialization'],
};
const MAX_LENGTH = {
  user_name: 60,
  anonymous_name: 30,
  gender: 30,
  faculty: 80,
  specialization: 100,
  display_title: 20,
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toProfile = (u) => ({
  _id: u._id,
  user_name: u.user_name,
  anonymous_name: u.anonymous_name,
  email: u.email,
  role: u.role,
  gender: u.gender,
  faculty: u.faculty,
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
    updates[field] = value;
  }

  if ('user_name' in updates && !updates.user_name) fail(res, 400, 'Your name cannot be empty');

  // The alias is what other students see instead of the real name, so it must be
  // present, unique, and different from the real name.
  if (!isCounsellor && ('anonymous_name' in updates || 'user_name' in updates)) {
    const alias = updates.anonymous_name ?? me.anonymous_name;
    const realName = updates.user_name ?? me.user_name;
    if (!alias) fail(res, 400, 'Your anonymous name cannot be empty');
    if (alias.toLowerCase() === realName.toLowerCase()) {
      fail(res, 400, 'Your anonymous name must be different from your real name');
    }
    if ('anonymous_name' in updates) {
      const taken = await User.exists({
        _id: { $ne: me._id },
        anonymous_name: new RegExp(`^${escapeRegExp(alias)}$`, 'i'),
      });
      if (taken) fail(res, 409, 'That anonymous name is already taken');
    }
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

module.exports = { getMe, updateMe, changePassword };
