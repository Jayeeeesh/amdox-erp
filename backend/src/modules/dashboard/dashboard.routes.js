const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const {
  protect,
  managerOnly,
} = require('../../middleware/auth.middleware');

// All routes protected
router.use(protect);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard fetched
 */
router.get('/', managerOnly, dashboardController.getDashboard);

/**
 * @swagger
 * /dashboard/finance-chart:
 *   get:
 *     summary: Get finance chart data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           example: 6
 *     responses:
 *       200:
 *         description: Finance chart data
 */
router.get('/finance-chart', managerOnly, dashboardController.getFinanceChart);

/**
 * @swagger
 * /dashboard/order-chart:
 *   get:
 *     summary: Get order chart data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order chart data
 */
router.get('/order-chart', managerOnly, dashboardController.getOrderChart);

module.exports = router;