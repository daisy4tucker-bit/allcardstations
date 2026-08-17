import { Response, NextFunction } from 'express';
import * as favoriteService from '../services/favoriteService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const favorites = await favoriteService.getUserFavorites(userId);
    res.status(200).json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
}

export async function addFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { giftCardId } = req.body;
    const favorite = await favoriteService.addUserFavorite(userId, giftCardId);
    res.status(201).json({
      success: true,
      message: 'Gift card added to favorites.',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await favoriteService.removeUserFavorite(userId, id);
    res.status(200).json({
      success: true,
      message: 'Gift card removed from favorites.',
    });
  } catch (error) {
    next(error);
  }
}
