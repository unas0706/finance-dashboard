const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    // Only admins can assign roles other than viewer — enforced here
    const role = req.user?.role === 'admin' ? req.body.role : 'viewer';
    const { user, token } = await authService.register({ ...req.body, role });
    return sendSuccess(res, 201, 'Account created successfully.', { user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return sendSuccess(res, 200, 'Login successful.', { user, token });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched.', { user: req.user });
};

module.exports = { register, login, getMe };
