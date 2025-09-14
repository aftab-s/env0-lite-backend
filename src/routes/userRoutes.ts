import { Router } from "express";
import ManualAuthController from '../controllers/auth/manualAuthController';
import { verifyToken } from '../middleware/tokenManagement';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Manual Users and Auth
 *   description: User management for Maual Signups and authentication
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Signup a new user
 *     tags: [Manual Users and Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Email already exists
 */
router.post('/signup', ManualAuthController.signup);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Manual Users and Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token returned
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', ManualAuthController.login);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Manual Users and Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get('/users', verifyToken, ManualAuthController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Manual Users and Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/users/:id', verifyToken, ManualAuthController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user info
 *     tags: [Manual Users and Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/users/:id', verifyToken, ManualAuthController.updateUser);

export default router;

/**
 * @swagger
 * /users/{id}/soft:
 *   delete:
 *     summary: Soft delete a user (set status to INACTIVE)
 *     tags: [Manual Users and Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User soft deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/users/:id/soft', verifyToken, ManualAuthController.softDeleteUser);

/**
 * @swagger
 * /users/{id}/hard:
 *   delete:
 *     summary: Hard delete a user (remove from DB)
 *     tags: [Manual Users and Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User hard deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/users/:id/hard', verifyToken, ManualAuthController.hardDeleteUser);