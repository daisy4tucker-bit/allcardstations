import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as diagnosticService from '../services/diagnosticService.js';
import * as adminDataService from '../services/adminDataService.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

function getClientIp(req: AuthenticatedRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export async function getDiagnosticHealth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';

  // Strict role check
  if (!req.user) {
    diagnosticService.logAdminAccess({
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_VIEW_ATTEMPT',
      status: 'UNAUTHORIZED',
      details: 'Unauthenticated guest attempted to access system diagnostics.',
    });
    return next(new UnauthorizedError('Authentication required.'));
  }

  if (req.user.role !== 'ADMIN') {
    diagnosticService.logAdminAccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_VIEW_ATTEMPT',
      status: 'FORBIDDEN',
      details: `Non-admin user (${req.user.email}, role: ${req.user.role}) was blocked from diagnostic endpoint.`,
    });
    return next(new ForbiddenError('Access restricted. Admin privileges are required.'));
  }

  try {
    const diagnostics = await diagnosticService.getSystemDiagnostics();

    // Log successful admin access
    diagnosticService.logAdminAccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_VIEW',
      status: 'SUCCESS',
      details: `Admin viewed system diagnostic metrics (DB Status: ${diagnostics.status}).`,
    });

    res.status(200).json({
      success: true,
      data: { diagnostics },
    });
  } catch (error) {
    next(error);
  }
}

export async function runDiagnosticProbes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';

  if (!req.user) {
    diagnosticService.logAdminAccess({
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_PROBE_TRIGGER',
      status: 'UNAUTHORIZED',
      details: 'Unauthenticated guest attempted to trigger diagnostic probes.',
    });
    return next(new UnauthorizedError('Authentication required.'));
  }

  if (req.user.role !== 'ADMIN') {
    diagnosticService.logAdminAccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_PROBE_TRIGGER',
      status: 'FORBIDDEN',
      details: `Non-admin user (${req.user.email}) attempted to run diagnostic probes.`,
    });
    return next(new ForbiddenError('Access restricted. Admin privileges are required.'));
  }

  try {
    const results = await diagnosticService.runDiagnosticProbes();

    diagnosticService.logAdminAccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ip,
      userAgent,
      action: 'SYSTEM_DIAGNOSTIC_PROBES_EXECUTED',
      status: 'SUCCESS',
      details: `Admin executed 5 live diagnostic probes (Result: ${results.overallPassed ? 'ALL PASSED' : 'SOME FAILED'}, ${results.totalDurationMs}ms).`,
      durationMs: results.totalDurationMs,
    });

    res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAccessAuditLogs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';

  if (!req.user || req.user.role !== 'ADMIN') {
    diagnosticService.logAdminAccess({
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
      ip,
      userAgent,
      action: 'SYSTEM_AUDIT_LOG_VIEW_ATTEMPT',
      status: req.user ? 'FORBIDDEN' : 'UNAUTHORIZED',
    });
    return next(new ForbiddenError('Access restricted to administrators.'));
  }

  try {
    const logs = diagnosticService.getAuditLogs();
    res.status(200).json({
      success: true,
      data: { logs },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDataBrowser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';

  if (!req.user || req.user.role !== 'ADMIN') {
    diagnosticService.logAdminAccess({
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role,
      ip,
      userAgent,
      action: 'DATA_BROWSER_VIEW_ATTEMPT',
      status: req.user ? 'FORBIDDEN' : 'UNAUTHORIZED',
      details: 'Non-admin user attempted to access Admin Data Browser audit tables.',
    });
    return next(new ForbiddenError('Access restricted to administrators.'));
  }

  try {
    const data = await adminDataService.getAdminDataBrowser();

    diagnosticService.logAdminAccess({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ip,
      userAgent,
      action: 'DATA_BROWSER_VIEW',
      status: 'SUCCESS',
      details: `Admin audited system data browser (${data.counts.totalUsers} users, ${data.counts.totalOrders} transactions, ${data.counts.totalGiftCards} gift cards).`,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
