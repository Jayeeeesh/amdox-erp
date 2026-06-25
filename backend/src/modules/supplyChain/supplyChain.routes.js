const express = require('express');
const router = express.Router();
const supplyChainController = require('./supplyChain.controller');
const validate = require('../../middleware/validate.middleware');
const {
  protect,
  adminOnly,
  managerOnly,
} = require('../../middleware/auth.middleware');
const {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
} = require('./supplyChain.validation');

// All routes protected
router.use(protect);

/**
 * @swagger
 * /supplychain/orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Supply Chain]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, ordered, received, cancelled]
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
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
 *         description: Purchase orders fetched
 */
router.get('/orders', managerOnly, supplyChainController.getPurchaseOrders);

/**
 * @swagger
 * /supplychain/orders/{id}:
 *   get:
 *     summary: Get single purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order fetched
 *       404:
 *         description: Purchase order not found
 */
router.get('/orders/:id', managerOnly, supplyChainController.getPurchaseOrder);

/**
 * @swagger
 * /supplychain/orders:
 *   post:
 *     summary: Create purchase order
 *     tags: [Supply Chain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendor, items, expectedDelivery]
 *             properties:
 *               vendor:
 *                 type: string
 *                 example: ABC Supplies
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Laptop
 *                     quantity:
 *                       type: integer
 *                       example: 5
 *                     unitPrice:
 *                       type: number
 *                       example: 50000
 *               expectedDelivery:
 *                 type: string
 *                 format: date
 *                 example: "01-06-2026"
 *               notes:
 *                 type: string
 *                 example: Urgent order
 *     responses:
 *       201:
 *         description: Purchase order created
 */
router.post(
  '/orders',
  managerOnly,
  validate(createPurchaseOrderSchema),
  supplyChainController.createPurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}:
 *   patch:
 *     summary: Update purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order updated
 */
router.patch(
  '/orders/:id',
  adminOnly,
  validate(updatePurchaseOrderSchema),
  supplyChainController.updatePurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}/approve:
 *   patch:
 *     summary: Approve purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order approved
 */
router.patch(
  '/orders/:id/approve',
  adminOnly,
  supplyChainController.approvePurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}/receive:
 *   patch:
 *     summary: Mark order as received
 *     tags: [Supply Chain]
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
 *         description: Purchase order received
 */
router.patch(
  '/orders/:id/receive',
  managerOnly,
  supplyChainController.receivePurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order cancelled
 */
router.patch(
  '/orders/:id/cancel',
  adminOnly,
  supplyChainController.cancelPurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}:
 *   delete:
 *     summary: Delete purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order deleted
 */
router.delete(
  '/orders/:id',
  adminOnly,
  supplyChainController.deletePurchaseOrder
);

/**
 * @swagger
 * /supplychain/orders/{id}/restore:
 *   patch:
 *     summary: Restore purchase order
 *     tags: [Supply Chain]
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
 *         description: Purchase order restored
 */
router.patch(
  '/orders/:id/restore',
  adminOnly,
  supplyChainController.restorePurchaseOrder
);

module.exports = router;