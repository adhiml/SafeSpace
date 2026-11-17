// Email verification must be renewed every year. The state is worked out from one date on each
// request, so nothing has to run on a schedule.
const VALID_DAYS = 365;
const RENEW_WINDOW_DAYS = 14; // from this many days before it ends, the user is nudged to renew
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 *  active     verified within the last year: everything works
 *  expired    verification is over a year old: read-only, and only data from before it expired
 *  unverified never verified: blocked, only the verify screen is available
 */
const accountState = (user) => {
  if (user.is_demo) return { state: 'active', verifiedUntil: null, daysLeft: null, renewSoon: false };
  if (!user.email_verified_at) return { state: 'unverified', verifiedUntil: null, daysLeft: null, renewSoon: false };

  const verifiedUntil = new Date(user.email_verified_at.getTime() + VALID_DAYS * DAY_MS);
  const msLeft = verifiedUntil.getTime() - Date.now();
  const active = msLeft > 0;
  return {
    state: active ? 'active' : 'expired',
    verifiedUntil,
    daysLeft: active ? Math.ceil(msLeft / DAY_MS) : 0,
    renewSoon: active && msLeft <= RENEW_WINDOW_DAYS * DAY_MS,
  };
};

module.exports = { accountState, VALID_DAYS, RENEW_WINDOW_DAYS, DAY_MS };
