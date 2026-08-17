import { Request, Response, NextFunction } from 'express';
import * as giftCardService from '../services/giftCardService.js';

export async function getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await giftCardService.listCategories();
    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllGiftCards(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search } = req.query;
    const result = await giftCardService.listGiftCards(
      category as string | undefined,
      search as string | undefined
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGiftCardBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const giftCard = await giftCardService.getGiftCard(slug);
    res.status(200).json({
      success: true,
      data: { giftCard },
    });
  } catch (error) {
    next(error);
  }
}
