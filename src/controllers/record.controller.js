const recordService = require('../services/record.service');
const { sendSuccess } = require('../utils/response');

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    return sendSuccess(res, 201, 'Record created successfully.', record);
  } catch (err) {
    next(err);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    return sendSuccess(res, 200, 'Records fetched.', result.records, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return sendSuccess(res, 200, 'Record fetched.', record);
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    return sendSuccess(res, 200, 'Record updated successfully.', record);
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    return sendSuccess(res, 200, 'Record deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
