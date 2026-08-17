import { Response, NextFunction } from 'express';
import * as recipientService from '../services/recipientService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getRecipients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const recipients = await recipientService.getUserRecipients(userId);
    res.status(200).json({
      success: true,
      data: { recipients },
    });
  } catch (error) {
    next(error);
  }
}

export async function createRecipient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, email, phone, relationship } = req.body;
    const recipient = await recipientService.createRecipient(userId, { name, email, phone, relationship });
    res.status(201).json({
      success: true,
      message: 'Recipient saved successfully.',
      data: { recipient },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRecipient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, email, phone, relationship } = req.body;
    const recipient = await recipientService.updateRecipient(userId, id, { name, email, phone, relationship });
    res.status(200).json({
      success: true,
      message: 'Recipient updated successfully.',
      data: { recipient },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteRecipient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await recipientService.deleteRecipient(userId, id);
    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
