const { ROLE_PERMISSIONS } = require('../config/roles');
const { sendError } = require('../utils/response');

/**
 * Middleware factory — checks if the user's role has the required permission.
 * Usage: authorize('record:create')
 */
const authorize = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return sendError(
        res,
        403,
        `Access denied. Your role '${req.user.role}' does not have permission to perform this action.`
      );
    }

    next();
  };
};

module.exports = authorize;
