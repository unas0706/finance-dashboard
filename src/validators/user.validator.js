const { body, param } = require('express-validator');

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }),
  body('role').optional().isIn(['admin', 'analyst', 'viewer']).withMessage('Role must be admin, analyst, or viewer.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
];

module.exports = { updateUserValidator };
