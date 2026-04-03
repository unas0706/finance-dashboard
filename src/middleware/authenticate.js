const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('+isActive');
    if (!user) {
      return sendError(res, 401, 'Token is invalid or user no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Contact an admin.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid token.');
  }
};

module.exports = authenticate;
