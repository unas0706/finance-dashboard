const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user.
 * Only admins can assign non-viewer roles — enforced at the route level.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role: role || 'viewer' });
  const token = generateToken({ id: user._id, role: user.role });

  return { user, token };
};

/**
 * Log in an existing user and return a JWT.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Contact an admin.');
    err.statusCode = 403;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user._id, role: user.role });
  return { user, token };
};

module.exports = { register, login };
