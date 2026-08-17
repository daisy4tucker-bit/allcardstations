import { Response, NextFunction } from 'express';
import * as supportService from '../services/supportService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SenderType } from '../models/types.js';

export async function getOrCreateConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const visitorId = req.body.visitorId || req.query.visitorId || req.headers['x-visitor-id'] || `vis_${Date.now()}`;
    const userId = req.user ? req.user.userId : null;
    const conversation = await supportService.getOrCreateSupportConversation(visitorId as string, userId);
    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId, message, senderType } = req.body;
    const type = senderType || (req.user && (req.user.role === 'SUPPORT_AGENT' || req.user.role === 'ADMIN') ? SenderType.SUPPORT_AGENT : SenderType.CUSTOMER);
    const newMessage = await supportService.sendSupportMessage({
      conversationId,
      senderType: type,
      message,
    });
    res.status(201).json({
      success: true,
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
}

export async function listConversations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;
    const conversations = await supportService.listAllConversations(status as string | undefined);
    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const conversation = await supportService.getConversationDetails(id);
    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

export async function replyToConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const newMessage = await supportService.sendSupportMessage({
      conversationId: id,
      senderType: SenderType.SUPPORT_AGENT,
      message,
    });
    res.status(201).json({
      success: true,
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await supportService.updateConversationStatus(id, status);
    res.status(200).json({
      success: true,
      data: { conversation: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await supportService.getAdminSupportStats();
    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitContactInquiry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fullName, email, phone, category, subject, orderNumber, message, consent } = req.body;
    const errors: Record<string, string> = {};

    // 1. Full name validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    } else if (fullName.trim().length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters.';
    }

    // 2. Email RFC validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid, deliverable email address.';
    }

    // 3. Phone validation (optional, but if provided must match valid format)
    if (phone && typeof phone === 'string' && phone.trim()) {
      const phoneClean = phone.replace(/[\s\-\(\)\.]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(phoneClean)) {
        errors.phone = 'Please enter a valid international or local phone number.';
      }
    }

    // 4. Subject validation
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      errors.subject = 'Subject line must be at least 3 characters.';
    } else if (subject.trim().length > 120) {
      errors.subject = 'Subject line must not exceed 120 characters.';
    }

    // 5. Message validation
    if (!message || typeof message !== 'string' || message.trim().length < 15) {
      errors.message = 'Please provide at least 15 characters describing your inquiry in detail.';
    } else if (message.trim().length > 3000) {
      errors.message = 'Message must not exceed 3,000 characters.';
    }

    // 6. Consent check
    if (consent !== true && consent !== 'true') {
      errors.consent = 'You must agree to the processing of your contact inquiry details.';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed on one or more fields.',
        validationErrors: errors,
      });
      return;
    }

    // Generate unique tracking ticket ID
    const ticketId = `ACS-TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const receivedAt = new Date().toISOString();

    res.status(200).json({
      success: true,
      message: 'Inquiry received and queued successfully.',
      data: {
        ticketId,
        receivedAt,
        estimatedResponseTime: 'Under 15 minutes',
        inquiry: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          category: category || 'General Support',
          orderNumber: orderNumber ? orderNumber.trim() : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}


