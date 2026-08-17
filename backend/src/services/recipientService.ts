import { db } from '../database/store.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { Recipient } from '../models/types.js';

export async function getUserRecipients(userId: string): Promise<Recipient[]> {
  return db.getRecipientsByUserId(userId);
}

export async function createRecipient(
  userId: string,
  data: { name: string; email?: string | null; phone?: string | null; relationship?: string | null }
): Promise<Recipient> {
  if (!data.name || !data.name.trim()) {
    throw new BadRequestError('Recipient name is required.');
  }
  return db.addRecipient(userId, {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    relationship: data.relationship?.trim() || null,
  });
}

export async function updateRecipient(
  userId: string,
  id: string,
  data: { name?: string; email?: string | null; phone?: string | null; relationship?: string | null }
): Promise<Recipient> {
  const updated = await db.updateRecipient(userId, id, {
    name: data.name?.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    relationship: data.relationship?.trim() || null,
  });

  if (!updated) {
    throw new NotFoundError('Recipient not found or unauthorized.');
  }

  return updated;
}

export async function deleteRecipient(userId: string, id: string): Promise<boolean> {
  const deleted = await db.deleteRecipient(userId, id);
  if (!deleted) {
    throw new NotFoundError('Recipient not found or unauthorized.');
  }
  return true;
}
