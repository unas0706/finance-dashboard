const { body, param, query } = require('express-validator');
const { RECORD_TYPES, CATEGORIES } = require('../models/FinancialRecord');

const createRecordValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('type')
    .notEmpty().withMessage('Type is required.')
    .isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}.`),
  body('category')
    .notEmpty().withMessage('Category is required.')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}.`),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (e.g. 2024-01-15).'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];

const updateRecordValidator = [
  param('id').isMongoId().withMessage('Invalid record ID.'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number.'),
  body('type')
    .optional()
    .isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}.`),
  body('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}.`),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];

const listRecordsValidator = [
  query('type').optional().isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}.`),
  query('category').optional().isIn(CATEGORIES).withMessage(`Invalid category.`),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date.'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('sortBy').optional().isIn(['date', 'amount', 'createdAt']).withMessage('sortBy must be date, amount, or createdAt.'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc.'),
];

module.exports = { createRecordValidator, updateRecordValidator, listRecordsValidator };
