const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Enter a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Role must be admin, analyst, or viewer.'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Enter a valid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidator, loginValidator };
