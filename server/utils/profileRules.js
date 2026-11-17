const User = require('../models/User');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The anonymous name is what other students see instead of the real name, so it must be present,
 * different from the real name, and unique. Returns a message if something is wrong, else null.
 * (Used when signing up and when editing the profile.)
 */
const aliasProblem = async (alias, realName, ownId) => {
  if (!alias) return { status: 400, message: 'Your anonymous name cannot be empty' };
  if (alias.toLowerCase() === realName.toLowerCase()) {
    return { status: 400, message: 'Your anonymous name must be different from your real name' };
  }
  const taken = await User.exists({
    ...(ownId ? { _id: { $ne: ownId } } : {}),
    anonymous_name: new RegExp(`^${escapeRegExp(alias)}$`, 'i'),
  });
  return taken ? { status: 409, message: 'That anonymous name is already taken' } : null;
};

module.exports = { aliasProblem };
