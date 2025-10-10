
import { Router } from "express";
import ManualAuthController from '../controllers/auth/manualAuthController';
import { authenticateToken } from '../middleware/tokenManagement';

const router = Router();

// Register a new user
router.post('/signup', ManualAuthController.signup);

// Login a user and return JWT
router.post('/login', ManualAuthController.login);


// Get all users (protected)
router.get('/users', authenticateToken, ManualAuthController.getAllUsers);

// Get user by ID (protected)
router.get('/users/:id', authenticateToken, ManualAuthController.getUserById);

// Get user by Email (protected)
router.post('/users/email', authenticateToken, ManualAuthController.getUserByEmail);

// Update user by ID (protected)
router.put('/users/:id', authenticateToken, ManualAuthController.updateUser);

// Soft delete user by ID (protected)
router.delete('/users/:id/soft', authenticateToken, ManualAuthController.softDeleteUser);

// Hard delete user by ID (protected)
router.delete('/:id/hard', authenticateToken, ManualAuthController.hardDeleteUser);

export default router;
