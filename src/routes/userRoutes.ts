import { Router } from "express";
import ManualAuthController from '../controllers/auth/manualAuthController';
import { verifyToken } from '../middleware/tokenManagement';

const router = Router();

// Register a new user
router.post('/signup', ManualAuthController.signup);

// Login a user and return JWT
router.post('/login', ManualAuthController.login);

// Get all users (protected)
router.get('/users', verifyToken, ManualAuthController.getAllUsers);

// Get user by ID (protected)
router.get('/users/:id', verifyToken, ManualAuthController.getUserById);

// Get user by Email (protected)
router.post('/users/email', verifyToken, ManualAuthController.getUserByEmail);

// Update user by ID (protected)
router.put('/users/:id', verifyToken, ManualAuthController.updateUser);

// Soft delete user by ID (protected)
router.delete('/users/:id/soft', verifyToken, ManualAuthController.softDeleteUser);

// Hard delete user by ID (protected)
router.delete('/users/:id/hard', verifyToken, ManualAuthController.hardDeleteUser);

export default router;
