import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticateUser, userController.getProfile);

// PUT /api/users/profile
router.put('/profile', authenticateUser, userController.updateProfile);

export default router;
