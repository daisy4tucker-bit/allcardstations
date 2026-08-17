import { Router } from 'express';
import {
  checkCardValidation,
  getAdminValidationRequests,
  createAdminValidationRecord,
  updateAdminValidationRecord,
  deleteAdminValidationRecord,
  bulkDeleteAdminValidationRecords,
  clearAllAdminValidationRecords,
  syncValidationsToSupabase,
  getSupabaseStatus,
} from '../controllers/validationController.js';
import { authenticateUser, optionalAuth, requireRole } from '../middleware/authMiddleware.js';
import { Role } from '../models/types.js';

const router = Router();

// Public / Customer validation submission
router.post('/check', optionalAuth, checkCardValidation);

// Admin-only endpoints for Gift Card Validation Table Editor
router.get('/admin', authenticateUser, requireRole(Role.ADMIN), getAdminValidationRequests);
router.post('/admin', authenticateUser, requireRole(Role.ADMIN), createAdminValidationRecord);
router.put('/admin/:id', authenticateUser, requireRole(Role.ADMIN), updateAdminValidationRecord);
router.delete('/admin/:id', authenticateUser, requireRole(Role.ADMIN), deleteAdminValidationRecord);
router.post('/admin/bulk-delete', authenticateUser, requireRole(Role.ADMIN), bulkDeleteAdminValidationRecords);
router.post('/admin/clear-all', authenticateUser, requireRole(Role.ADMIN), clearAllAdminValidationRecords);

// Supabase cloud database sync endpoints
router.post('/admin/sync-supabase', authenticateUser, requireRole(Role.ADMIN), syncValidationsToSupabase);
router.get('/admin/supabase-status', authenticateUser, requireRole(Role.ADMIN), getSupabaseStatus);

export default router;

