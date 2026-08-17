import { Router } from 'express';
import * as recipientController from '../controllers/recipientController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateRecipient } from '../middleware/validationMiddleware.js';

const router = Router();

// GET /api/recipients
router.get('/', authenticateUser, recipientController.getRecipients);

// POST /api/recipients
router.post('/', authenticateUser, validateRecipient, recipientController.createRecipient);

// PUT /api/recipients/:id
router.put('/:id', authenticateUser, recipientController.updateRecipient);

// DELETE /api/recipients/:id
router.delete('/:id', authenticateUser, recipientController.deleteRecipient);

export default router;
