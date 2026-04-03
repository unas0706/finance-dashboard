const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// All dashboard routes require authentication + dashboard:read permission
// This covers admin, analyst, and viewer roles
router.use(authenticate, authorize('dashboard:read'));

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getSummary);

// GET /api/dashboard/categories
router.get('/categories', dashboardController.getCategoryBreakdown);

// GET /api/dashboard/trends/monthly?year=2024
router.get('/trends/monthly', dashboardController.getMonthlyTrends);

// GET /api/dashboard/trends/weekly?weeks=8
router.get('/trends/weekly', dashboardController.getWeeklyTrends);

// GET /api/dashboard/recent?limit=10
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;
