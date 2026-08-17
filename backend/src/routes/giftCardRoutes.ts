import { Router } from 'express';
import * as giftCardController from '../controllers/giftCardController.js';

const router = Router();

// GET /api/gift-cards
router.get('/', giftCardController.getAllGiftCards);

// GET /api/gift-cards/categories
router.get('/categories', giftCardController.getAllCategories);

// GET /api/gift-cards/:slug
router.get('/:slug', giftCardController.getGiftCardBySlug);

export default router;
