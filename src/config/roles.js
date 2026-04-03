const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

const ROLE_PERMISSIONS = {
  admin: [
    "user:create",
    "user:read",
    "user:update",
    "user:delete",
    "record:create",
    "record:read",
    "record:update",
    "record:delete",
    "dashboard:read",
  ],
  analyst: ["record:read", "dashboard:read"],
  viewer: ["dashboard:read"],
};

module.exports = { ROLES, ROLE_PERMISSIONS };
