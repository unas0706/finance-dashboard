const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    return sendSuccess(res, 200, 'Dashboard summary fetched.', summary);
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    return sendSuccess(res, 200, 'Category breakdown fetched.', breakdown);
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.query.year);
    return sendSuccess(res, 200, 'Monthly trends fetched.', data);
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const records = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, 200, 'Recent activity fetched.', records);
  } catch (err) {
    next(err);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeks = req.query.weeks || 8;
    const data = await dashboardService.getWeeklyTrends(weeks);
    return sendSuccess(res, 200, 'Weekly trends fetched.', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity, getWeeklyTrends };
