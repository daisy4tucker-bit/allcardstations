import { Router } from 'express';
import * as supportController from '../controllers/supportController.js';
import { optionalAuth, authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Customer Support Endpoints
// POST /api/support/conversations (get or create conversation)
router.post('/conversations', optionalAuth, supportController.getOrCreateConversation);

// GET /api/support/conversations (alias to retrieve conversation)
router.get('/conversations', optionalAuth, supportController.getOrCreateConversation);

// POST /api/support/messages
router.post('/messages', optionalAuth, supportController.sendMessage);

// POST /api/support/contact (validated contact inquiry)
router.post('/contact', optionalAuth, supportController.submitContactInquiry);

// Admin / Agent Support Console Endpoints
// GET /api/support/admin/conversations
router.get('/admin/conversations', optionalAuth, supportController.listConversations);

// GET /api/support/admin/conversations/:id
router.get('/admin/conversations/:id', optionalAuth, supportController.getConversationById);

// POST /api/support/admin/conversations/:id/reply
router.post('/admin/conversations/:id/reply', optionalAuth, supportController.replyToConversation);

// PATCH /api/support/admin/conversations/:id/status
router.patch('/admin/conversations/:id/status', optionalAuth, supportController.updateStatus);

// GET /api/support/admin/stats
router.get('/admin/stats', optionalAuth, supportController.getStats);

export default router;

