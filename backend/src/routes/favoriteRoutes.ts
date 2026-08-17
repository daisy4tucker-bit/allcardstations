import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/favorites
router.get('/', authenticateUser, favoriteController.getFavorites);

// POST /api/favorites
router.post('/', authenticateUser, favoriteController.addFavorite);

// DELETE /api/favorites/:id
router.delete('/:id', authenticateUser, favoriteController.removeFavorite);

export default router;
