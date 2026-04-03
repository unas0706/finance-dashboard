const FinancialRecord = require('../models/FinancialRecord');

/**
 * Returns total income, total expenses, and net balance.
 */
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };
  result.forEach(({ _id, total, count }) => {
    if (_id === 'income') {
      summary.totalIncome = total;
      summary.incomeCount = count;
    } else if (_id === 'expense') {
      summary.totalExpenses = total;
      summary.expenseCount = count;
    }
  });
  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  return summary;
};

/**
 * Returns totals grouped by category for income and expense separately.
 */
const getCategoryBreakdown = async () => {
  const results = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const breakdown = { income: [], expense: [] };
  results.forEach(({ _id, total, count }) => {
    breakdown[_id.type].push({ category: _id.category, total, count });
  });
  return breakdown;
};

/**
 * Returns monthly aggregated income and expense for the given year.
 * Defaults to the current year.
 */
const getMonthlyTrends = async (year) => {
  const targetYear = Number(year) || new Date().getFullYear();

  const results = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  // Build a full 12-month structure
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(targetYear, i, 1).toLocaleString('default', { month: 'long' }),
    income: 0,
    expense: 0,
    net: 0,
  }));

  results.forEach(({ _id, total }) => {
    const entry = months[_id.month - 1];
    if (_id.type === 'income') entry.income = total;
    else if (_id.type === 'expense') entry.expense = total;
  });

  months.forEach((m) => (m.net = m.income - m.expense));
  return { year: targetYear, months };
};

/**
 * Returns the N most recent financial records.
 */
const getRecentActivity = async (limit = 10) => {
  return FinancialRecord.find()
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(Number(limit));
};

/**
 * Returns weekly totals for income and expense for the last N weeks.
 */
const getWeeklyTrends = async (weeks = 8) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const results = await FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: '$date' },
          year: { $isoWeekYear: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  // Merge income and expense into one entry per week
  const weekMap = {};
  results.forEach(({ _id, total, count }) => {
    const key = `${_id.year}-W${String(_id.week).padStart(2, '0')}`;
    if (!weekMap[key]) weekMap[key] = { week: key, income: 0, expense: 0, net: 0 };
    if (_id.type === 'income') weekMap[key].income = total;
    else if (_id.type === 'expense') weekMap[key].expense = total;
  });

  const weeklyData = Object.values(weekMap);
  weeklyData.forEach((w) => (w.net = w.income - w.expense));
  return weeklyData;
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity, getWeeklyTrends };
