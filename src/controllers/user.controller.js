const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers({ page, limit });
    return sendSuccess(res, 200, 'Users fetched.', result.users, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User fetched.', user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 200, 'User updated successfully.', user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id.toString());
    return sendSuccess(res, 200, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
