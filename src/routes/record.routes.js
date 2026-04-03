const express = require('express');
const router = express.Router();

const recordController = require('../controllers/record.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createRecordValidator, updateRecordValidator, listRecordsValidator } = require('../validators/record.validator');
const { param } = require('express-validator');

// All record routes require a valid token
router.use(authenticate);

// POST /api/records  — admin only
router.post('/', authorize('record:create'), createRecordValidator, validate, recordController.createRecord);

// GET /api/records  — admin + analyst
router.get('/', authorize('record:read'), listRecordsValidator, validate, recordController.getRecords);

// GET /api/records/:id  — admin + analyst
router.get(
  '/:id',
  authorize('record:read'),
  [param('id').isMongoId().withMessage('Invalid record ID.')],
  validate,
  recordController.getRecordById
);

// PATCH /api/records/:id  — admin only
router.patch('/:id', authorize('record:update'), updateRecordValidator, validate, recordController.updateRecord);

// DELETE /api/records/:id  — admin only (soft delete)
router.delete(
  '/:id',
  authorize('record:delete'),
  [param('id').isMongoId().withMessage('Invalid record ID.')],
  validate,
  recordController.deleteRecord
);

module.exports = router;
