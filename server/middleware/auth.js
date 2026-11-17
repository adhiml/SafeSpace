const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { accountState } = require('../utils/accountState');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// The old X-Demo-User-Id header still works for the seeded demo accounts while developing,
// and only for them: a real account can never be reached through it.
const demoHeaderAllowed = () => process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEMO_HEADER !== 'false';

const reject = (res, status, code, message) => res.status(status).json({ code, message });

/**
 * Works out who is calling and what state their account is in.
 * Later code keeps reading req.demoUserId (the signed-in user's id, whatever the name suggests).
 *
 * `allowFrozen` is for the auth routes (me, logout): they must keep working so a user whose
 * verification lapsed can still see why and sign out.
 */
const authenticate = ({ allowFrozen = false } = {}) => async (req, res, next) => {
  try {
    const bearer = (req.headers.authorization || '').match(/^Bearer (.+)$/i)?.[1];
    const demoId = req.headers['x-demo-user-id'];
    let user = null;

    if (bearer) {
      const session = await Session.findOne({ token_hash: hashToken(bearer), expires_at: { $gt: new Date() } });
      if (session) user = await User.findById(session.user_id);
    } else if (demoHeaderAllowed() && typeof demoId === 'string' && demoId.trim()) {
      user = await User.findOne({ _id: demoId.trim(), is_demo: true });
    }

    if (!user) return reject(res, 401, 'NOT_SIGNED_IN', 'Please log in to continue.');

    const { state, verifiedUntil } = accountState(user);
    req.user = user;
    req.demoUserId = user._id;
    req.accountState = state;
    // Expired accounts may only see what existed before their verification ran out.
    req.readCutoff = state === 'expired' ? verifiedUntil : null;

    if (!allowFrozen) {
      if (state === 'unverified') {
        return reject(res, 403, 'EMAIL_UNVERIFIED', 'Verify your email address to use tenang.');
      }
      if (state === 'expired' && req.method !== 'GET') {
        return reject(res, 403, 'EMAIL_VERIFICATION_EXPIRED', 'Your email verification has expired, so your account is read-only until you verify again.');
      }
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = { authenticate, hashToken };
