const { DEFAULT_DEMO_USER_ID } = require('../utils/demoUsers');

/** Reads X-Demo-User-Id header for dev role simulation (not authentication) */
const resolveDemoUser = (req, res, next) => {
  const headerId = req.headers['x-demo-user-id'];
  req.demoUserId = typeof headerId === 'string' && headerId.trim() ? headerId.trim() : DEFAULT_DEMO_USER_ID;
  next();
};

module.exports = { resolveDemoUser };
