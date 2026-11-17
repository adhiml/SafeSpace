const crypto = require('crypto');
const VerificationCode = require('../models/VerificationCode');
const mailer = require('./mailer');

// The rules agreed for email codes.
const CODE_MINUTES = 10; // how long a code works
const MAX_WRONG_TRIES = 5; // after this the code is cancelled and a new one is needed
const RESEND_COOLDOWN_SECONDS = 60; // minimum gap between two codes
const MAX_SENDS_PER_HOUR = 5;

const HOUR_MS = 60 * 60 * 1000;

// Errors carry the HTTP status the caller should reply with.
const problem = (status, message) => Object.assign(new Error(message), { status });

// A 6-digit code can only be guessed by trying, so the real protection is the limits above.
const hashCode = (userId, code) => crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex');

/** Creates a fresh code for the user and emails it. Throws if they are asking too often. */
const issueCode = async (user) => {
  const now = Date.now();
  const existing = await VerificationCode.findOne({ user_id: user._id });
  const recent = (existing?.sent_at || []).map((d) => d.getTime()).filter((t) => now - t < HOUR_MS);

  const waitSeconds = recent.length ? Math.ceil((Math.max(...recent) + RESEND_COOLDOWN_SECONDS * 1000 - now) / 1000) : 0;
  if (waitSeconds > 0) throw problem(429, `Please wait ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before asking for another code.`);

  if (recent.length >= MAX_SENDS_PER_HOUR) {
    const minutes = Math.ceil((Math.min(...recent) + HOUR_MS - now) / 60000);
    throw problem(429, `You've asked for too many codes. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await VerificationCode.updateOne(
    { user_id: user._id },
    {
      $set: {
        code_hash: hashCode(user._id, code),
        expires_at: new Date(now + CODE_MINUTES * 60 * 1000),
        attempts: 0,
        sent_at: [...recent, now].map((t) => new Date(t)),
      },
    },
    { upsert: true }
  );

  await mailer.sendVerificationCode(user.email, code);
  return { expiresInMinutes: CODE_MINUTES, resendAfterSeconds: RESEND_COOLDOWN_SECONDS };
};

/** Returns normally if the code is right (and uses it up); throws with a helpful message if not. */
const checkCode = async (user, rawCode) => {
  const code = String(rawCode ?? '').trim();
  if (!/^\d{6}$/.test(code)) throw problem(400, 'Enter the 6-digit code.');

  const doc = await VerificationCode.findOne({ user_id: user._id });
  if (!doc || !doc.code_hash) throw problem(400, 'Request a new code first.');
  if (!doc.expires_at || doc.expires_at.getTime() < Date.now()) throw problem(400, 'That code has expired. Request a new one.');

  const given = Buffer.from(hashCode(user._id, code), 'hex');
  const stored = Buffer.from(doc.code_hash, 'hex');
  if (!crypto.timingSafeEqual(given, stored)) {
    doc.attempts += 1;
    if (doc.attempts >= MAX_WRONG_TRIES) {
      doc.code_hash = ''; // too many guesses: cancel this code
      await doc.save();
      throw problem(400, 'Too many wrong tries. Request a new code.');
    }
    await doc.save();
    const left = MAX_WRONG_TRIES - doc.attempts;
    throw problem(400, `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.`);
  }

  doc.code_hash = ''; // a code works once
  await doc.save();
};

module.exports = { issueCode, checkCode, CODE_MINUTES, RESEND_COOLDOWN_SECONDS };
