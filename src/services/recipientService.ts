import { apiRequest } from './api';

export interface RecipientItem {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  relationship?: string | null;
  createdAt: string;
}

export async function fetchRecipients(): Promise<{ recipients: RecipientItem[] }> {
  return apiRequest<{ recipients: RecipientItem[] }>('/recipients');
}

export async function createRecipient(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  relationship?: string | null;
}): Promise<{ recipient: RecipientItem }> {
  return apiRequest<{ recipient: RecipientItem }>('/recipients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRecipient(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    relationship?: string | null;
  }
): Promise<{ recipient: RecipientItem }> {
  return apiRequest<{ recipient: RecipientItem }>(`/recipients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRecipient(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/recipients/${id}`, {
    method: 'DELETE',
  });
}
