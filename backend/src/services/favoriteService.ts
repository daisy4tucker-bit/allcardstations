import { db } from '../database/store.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { FavoriteGiftCard } from '../models/types.js';

export async function getUserFavorites(userId: string): Promise<FavoriteGiftCard[]> {
  return db.getFavoritesByUserId(userId);
}

export async function addUserFavorite(userId: string, giftCardId: string): Promise<FavoriteGiftCard> {
  if (!giftCardId) {
    throw new BadRequestError('giftCardId is required.');
  }
  const giftCard = await db.getGiftCardById(giftCardId);
  if (!giftCard) {
    // Check if it's a slug
    const cardBySlug = await db.getGiftCardBySlug(giftCardId);
    if (!cardBySlug) {
      throw new NotFoundError('Gift card not found.');
    }
    return db.addFavorite(userId, cardBySlug.id);
  }
  return db.addFavorite(userId, giftCardId);
}

export async function removeUserFavorite(userId: string, identifier: string): Promise<boolean> {
  if (!identifier) {
    throw new BadRequestError('Identifier is required.');
  }
  return db.removeFavorite(userId, identifier);
}
