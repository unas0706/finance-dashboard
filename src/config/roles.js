const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
};

// What each role is allowed to do
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'record:create', 'record:read', 'record:update', 'record:delete',
    'dashboard:read',
  ],
  [ROLES.ANALYST]: [
    'record:read',
    'dashboard:read',
  ],
  [ROLES.VIEWER]: [
    'dashboard:read',
  ],
};

module.exports = { ROLES, ROLE_PERMISSIONS };
