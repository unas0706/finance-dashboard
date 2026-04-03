const FinancialRecord = require('../models/FinancialRecord');

/**
 * Build a Mongoose filter object from query params.
 */
const buildFilter = ({ type, category, startDate, endDate }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  return filter;
};

/**
 * Create a new financial record.
 */
const createRecord = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

/**
 * List records with filtering, sorting, and pagination.
 */
const getRecords = async ({ type, category, startDate, endDate, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' }) => {
  const filter = buildFilter({ type, category, startDate, endDate });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get a single record by ID.
 */
const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email role');
  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Update an existing record (admin only).
 */
const updateRecord = async (id, updates) => {
  const allowedFields = ['amount', 'type', 'category', 'date', 'notes'];
  const filtered = {};
  allowedFields.forEach((f) => {
    if (updates[f] !== undefined) filtered[f] = updates[f];
  });

  const record = await FinancialRecord.findByIdAndUpdate(id, filtered, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email role');

  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

/**
 * Soft-delete a record by setting isDeleted = true.
 */
const deleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!record) {
    const err = new Error('Financial record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
