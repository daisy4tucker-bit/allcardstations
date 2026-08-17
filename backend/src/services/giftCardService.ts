import { db } from '../database/store.js';
import { NotFoundError } from '../utils/errors.js';
import { GiftCard, Category } from '../models/types.js';

export async function listCategories(): Promise<Category[]> {
  return db.getAllCategories();
}

export async function listGiftCards(category?: string, search?: string): Promise<{ giftCards: GiftCard[]; categories: Category[] }> {
  const giftCards = await db.getAllGiftCards(category, search);
  const categories = await db.getAllCategories();
  return { giftCards, categories };
}

export async function getGiftCard(slug: string): Promise<GiftCard> {
  const card = await db.getGiftCardBySlug(slug);
  if (!card) {
    throw new NotFoundError(`Gift card '${slug}' not found.`);
  }
  return card;
}
