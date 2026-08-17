import { apiRequest } from './api';

export interface GiftCardItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  region: string;
  currency: string;
  description: string;
  startingPrice: number;
  available: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export async function fetchGiftCards(
  category?: string,
  search?: string
): Promise<{ giftCards: GiftCardItem[]; categories: CategoryItem[] }> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<{ giftCards: GiftCardItem[]; categories: CategoryItem[] }>(`/gift-cards${query}`);
}

export async function fetchGiftCardBySlug(slug: string): Promise<{ giftCard: GiftCardItem }> {
  return apiRequest<{ giftCard: GiftCardItem }>(`/gift-cards/${slug}`);
}
