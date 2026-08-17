import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateUser, requireRole } from '../middleware/authMiddleware.js';
import { Role } from '../models/types.js';

const router = Router();

// All admin routes strictly require authentication AND ADMIN role
router.use(authenticateUser);
router.use(requireRole(Role.ADMIN));

// GET /api/admin/diagnostic
router.get('/diagnostic', adminController.getDiagnosticHealth);

// POST /api/admin/diagnostic/probes
router.post('/diagnostic/probes', adminController.runDiagnosticProbes);

// GET /api/admin/diagnostic/logs
router.get('/diagnostic/logs', adminController.getAccessAuditLogs);

// GET /api/admin/data-browser
router.get('/data-browser', adminController.getDataBrowser);

export default router;
