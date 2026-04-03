const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// POST /api/auth/register  — public (role assignment restricted inside controller)
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login  — public
router.post('/login', loginValidator, validate, authController.login);

// GET  /api/auth/me  — requires valid token
router.get('/me', authenticate, authController.getMe);

module.exports = router;
