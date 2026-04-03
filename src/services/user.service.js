const User = require('../models/User');

/**
 * Get all users with optional pagination.
 */
const getAllUsers = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);
  return { users, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

/**
 * Get a single user by ID.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Update a user's name, role, or active status.
 */
const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'role', 'isActive'];
  const filtered = {};
  allowedFields.forEach((f) => {
    if (updates[f] !== undefined) filtered[f] = updates[f];
  });

  const user = await User.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Permanently delete a user. Admins cannot delete themselves.
 */
const deleteUser = async (targetId, requesterId) => {
  if (targetId === requesterId) {
    const err = new Error('You cannot delete your own account.');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndDelete(targetId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
