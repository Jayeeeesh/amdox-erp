const express = require('express');
const router = express.Router();
const financeController = require('./finance.controller');
const validate = require('../../middleware/validate.middleware');
const {
  protect,
  adminOnly,
  managerOnly,
} = require('../../middleware/auth.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
} = require('./finance.validation');

// All finance routes protected
router.use(protect);

/**
 * @swagger
 * /finance/summary:
 *   get:
 *     summary: Get finance summary
 *     tags: [Finance]
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
 *         description: Finance summary
 */
router.get('/summary', managerOnly, financeController.getSummary);

/**
 * @swagger
 * /finance/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, transfer]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [salary, vendor, operations, tax, other]
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
 *         description: Transactions fetched
 */
router.get('/transactions', managerOnly, financeController.getTransactions);

/**
 * @swagger
 * /finance/transactions/{id}:
 *   get:
 *     summary: Get single transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction fetched
 *       404:
 *         description: Transaction not found
 */
router.get('/transactions/:id', managerOnly, financeController.getTransaction);

/**
 * @swagger
 * /finance/transactions:
 *   post:
 *     summary: Create transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, amount, type, category]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Office Rent
 *               amount:
 *                 type: number
 *                 example: 50000
 *               type:
 *                 type: string
 *                 enum: [income, expense, transfer]
 *                 example: expense
 *               category:
 *                 type: string
 *                 enum: [salary, vendor, operations, tax, other]
 *                 example: operations
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-24"
 *               description:
 *                 type: string
 *                 example: Monthly office rent
 *               reference:
 *                 type: string
 *                 example: INV-001
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post(
  '/transactions',
  managerOnly,
  validate(createTransactionSchema),
  financeController.createTransaction
);

/**
 * @swagger
 * /finance/transactions/{id}:
 *   patch:
 *     summary: Update transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.patch(
  '/transactions/:id',
  adminOnly,
  validate(updateTransactionSchema),
  financeController.updateTransaction
);

/**
 * @swagger
 * /finance/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
router.delete(
  '/transactions/:id',
  adminOnly,
  financeController.deleteTransaction
);

/**
 * @swagger
 * /finance/transactions/{id}/restore:
 *   patch:
 *     summary: Restore transaction
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction restored
 */
router.patch(
  '/transactions/:id/restore',
  adminOnly,
  financeController.restoreTransaction
);

module.exports = router;