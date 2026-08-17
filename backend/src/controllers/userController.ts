import { Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await userService.getUserProfile(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, phone, country, avatar, preferences } = req.body;
    const result = await userService.updateUserProfile(userId, {
      firstName,
      lastName,
      phone,
      country,
      avatar,
      preferences,
    });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
