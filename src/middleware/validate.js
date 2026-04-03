const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after express-validator chains.
 * Collects all errors and returns a 422 if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return sendError(res, 422, 'Validation failed. Please check your input.', formatted);
  }
  next();
};

module.exports = validate;
