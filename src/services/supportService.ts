import { apiRequest } from './api';

export interface SupportMessage {
  id: string;
  conversationId: string;
  senderType: 'CUSTOMER' | 'SUPPORT_AGENT' | 'AI_ASSISTANT';
  message: string;
  createdAt: string;
}

export interface SupportConversation {
  id: string;
  userId?: string | null;
  visitorId: string;
  status: 'OPEN' | 'WAITING' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
}

const VISITOR_ID_KEY = 'allcardstation_visitor_id';

export function getVisitorId(): string {
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export async function getOrCreateConversation(visitorId?: string): Promise<{ conversation: SupportConversation }> {
  const vid = visitorId || getVisitorId();
  return apiRequest<{ conversation: SupportConversation }>('/support/conversations', {
    method: 'POST',
    body: JSON.stringify({ visitorId: vid }),
  });
}

export async function sendSupportMessage(
  conversationId: string,
  message: string
): Promise<{ message: SupportMessage }> {
  return apiRequest<{ message: SupportMessage }>('/support/messages', {
    method: 'POST',
    body: JSON.stringify({ conversationId, message }),
  });
}


export async function listAdminConversations(
  status?: string
): Promise<{ conversations: (SupportConversation & { user?: any; lastMessage?: SupportMessage })[] }> {
  const query = status && status !== 'ALL' ? `?status=${status}` : '';
  return apiRequest<{ conversations: (SupportConversation & { user?: any; lastMessage?: SupportMessage })[] }>(
    `/support/admin/conversations${query}`
  );
}

export async function getAdminConversation(
  id: string
): Promise<{ conversation: SupportConversation }> {
  return apiRequest<{ conversation: SupportConversation }>(`/support/admin/conversations/${id}`);
}

export async function sendAdminReply(
  id: string,
  message: string
): Promise<{ message: SupportMessage }> {
  return apiRequest<{ message: SupportMessage }>(`/support/admin/conversations/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function updateAdminConversationStatus(
  id: string,
  status: 'OPEN' | 'WAITING' | 'CLOSED'
): Promise<{ conversation: SupportConversation }> {
  return apiRequest<{ conversation: SupportConversation }>(`/support/admin/conversations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getAdminStats(): Promise<{
  stats: {
    usersCount: number;
    cardsCount: number;
    recipientsCount: number;
    favoritesCount: number;
    conversationsCount: number;
    messagesCount: number;
  };
}> {
  return apiRequest<{
    stats: {
      usersCount: number;
      cardsCount: number;
      recipientsCount: number;
      favoritesCount: number;
      conversationsCount: number;
      messagesCount: number;
    };
  }>('/support/admin/stats');
}


