
import { Router } from "express";
const AuthController = require("../controllers/auth/authController");

/**
 * @swagger
 * tags:
 *   name: Github Integrated Auth
 *   description: Authentication endpoints that use Github OAuth (beta testing)
 */

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Github Integrated Auth]
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
 *               full_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered
 *       400:
 *         description: Missing fields or error
 */
router.post("/signup", AuthController.signUp);
/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Github Integrated Auth]
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
 *         description: User signed in
 *       401:
 *         description: Invalid credentials
 */
router.post("/signin", AuthController.signIn);
/**
 * @swagger
 * /api/auth/session/accept:
 *   post:
 *     summary: Accept a session token and return user
 *     tags: [Github Integrated Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session accepted
 *       400:
 *         description: access_token required
 *       401:
 *         description: Invalid or expired token
 */
router.post("/session/accept", AuthController.acceptSession);

export default router;
