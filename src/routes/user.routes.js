const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { param } = require("express-validator");

// All user management routes require authentication + admin permission
router.use(authenticate, authorize("user:read"));

// GET /api/users
router.get("/", authorize("user:read"), userController.getAllUsers);

// GET /api/users/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID.")],
  userController.getUserById,
);

// PATCH /api/users/:id
router.patch("/:id", authorize("user:update"), userController.updateUser);

// DELETE /api/users/:id
router.delete(
  "/:id",
  authorize("user:delete"),
  [param("id").isMongoId().withMessage("Invalid user ID.")],
  userController.deleteUser,
);

module.exports = router;
