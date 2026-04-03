const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed.', errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `A record with this ${field} already exists.`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ID format: '${err.value}'.`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token.');
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'An internal server error occurred.' : err.message;
  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
