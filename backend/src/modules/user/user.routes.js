const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const validate = require('../../middleware/validate.middleware');
const {
  protect,
  adminOnly,
} = require('../../middleware/auth.middleware');
const {
  updateUserSchema,
  changePasswordSchema,
} = require('./user.validation');

// All routes protected
router.use(protect);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get('/me', userController.getMe);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jayesh Updated
 *               email:
 *                 type: string
 *                 example: updated@example.com
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch(
  '/me',
  validate(updateUserSchema),
  userController.updateMe
);

/**
 * @swagger
 * /users/me/change-password:
 *   patch:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Admin@123
 *               newPassword:
 *                 type: string
 *                 example: NewAdmin@123
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
router.patch(
  '/me/change-password',
  validate(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, employee]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users fetched
 */
router.get('/', adminOnly, userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get single user
 *     tags: [Users]
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
 *         description: User fetched
 *       404:
 *         description: User not found
 */
router.get('/:id', adminOnly, userController.getUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user (Admin)
 *     tags: [Users]
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
 *         description: User updated
 */
router.patch(
  '/:id',
  adminOnly,
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Users]
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
 *         description: User deleted
 */
router.delete('/:id', adminOnly, userController.deleteUser);

/**
 * @swagger
 * /users/{id}/restore:
 *   patch:
 *     summary: Restore user (Admin)
 *     tags: [Users]
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
 *         description: User restored
 */
router.patch(
  '/:id/restore',
  adminOnly,
  userController.restoreUser
);

module.exports = router;