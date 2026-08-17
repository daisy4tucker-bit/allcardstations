import { apiRequest } from './api';
import { GiftCardItem } from './giftCardService';

export interface FavoriteItem {
  id: string;
  userId: string;
  giftCardId: string;
  createdAt: string;
  giftCard?: GiftCardItem;
}

export async function fetchFavorites(): Promise<{ favorites: FavoriteItem[] }> {
  return apiRequest<{ favorites: FavoriteItem[] }>('/favorites');
}

export async function addFavorite(giftCardId: string): Promise<{ favorite: FavoriteItem }> {
  return apiRequest<{ favorite: FavoriteItem }>('/favorites', {
    method: 'POST',
    body: JSON.stringify({ giftCardId }),
  });
}

export async function removeFavorite(idOrGiftCardId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/favorites/${idOrGiftCardId}`, {
    method: 'DELETE',
  });
}
