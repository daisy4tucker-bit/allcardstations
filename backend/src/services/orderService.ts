import fs from 'fs';
import path from 'path';
import { prisma } from '../database/prisma.js';
import { sendTelegramPaymentProofAlert } from './telegramService.js';
import { sendPaymentProofEmailNotification } from './emailService.js';
import { createValidationRequest } from './validationService.js';

export interface PaymentProofPayload {
  orderId?: string;
  cardName: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  cryptoCurrency?: string;
  cryptoAmount?: string | number;
  walletAddress?: string;
  txHash?: string;
  receiptImage?: string;
}

export interface OrderRecord {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  giftCardId?: string;
  giftCardName: string;
  giftCardSlug?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cryptoCurrency: string | null;
  cryptoAmount: string | null;
  blockchainNetwork: string | null;
  walletAddress: string | null;
  transactionHash: string | null;
  receiptImage: string | null;
  paymentStatus: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const ORDERS_FILE_PATH = path.join(process.cwd(), 'backend', 'data', 'orders.json');

function ensureDataDir(): void {
  const dir = path.dirname(ORDERS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadOrdersFromFile(): OrderRecord[] {
  try {
    ensureDataDir();
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[Order Service] Could not read orders.json file:', err);
  }
  return [];
}

function saveOrdersToFile(orders: OrderRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Order Service] Could not write orders.json file:', err);
  }
}

/**
 * Creates and persists a payment proof order submission.
 * Sends Telegram alerts (with photo) and Admin Email alerts.
 */
export async function submitPaymentProof(payload: PaymentProofPayload): Promise<OrderRecord> {
  const orderId = payload.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();

  const record: OrderRecord = {
    id: orderId,
    userEmail: payload.customerEmail || 'customer@example.com',
    userName: (payload.customerEmail || 'Guest Customer').split('@')[0],
    giftCardName: payload.cardName,
    amount: payload.amount,
    currency: payload.currency || 'USD',
    paymentMethod: 'CRYPTO',
    cryptoCurrency: payload.cryptoCurrency || 'USDT',
    cryptoAmount: payload.cryptoAmount ? String(payload.cryptoAmount) : null,
    blockchainNetwork: payload.cryptoCurrency ? `${payload.cryptoCurrency} Network` : 'Crypto Network',
    walletAddress: payload.walletAddress || null,
    transactionHash: payload.txHash || null,
    receiptImage: payload.receiptImage || null,
    paymentStatus: 'PENDING',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  // 1. Try persisting to Prisma SQLite database if available
  try {
    let dummyUser = await prisma.user.findFirst({ where: { email: record.userEmail.toLowerCase() } });
    if (!dummyUser) {
      dummyUser = await prisma.user.findFirst();
    }
    let dummyCard = await prisma.giftCard.findFirst();

    if (dummyUser && dummyCard) {
      await prisma.order.create({
        data: {
          id: record.id,
          userId: dummyUser.id,
          giftCardId: dummyCard.id,
          amount: record.amount,
          currency: record.currency,
          paymentMethod: record.paymentMethod,
          cryptoCurrency: record.cryptoCurrency,
          blockchainNetwork: record.blockchainNetwork,
          walletAddress: record.walletAddress,
          transactionHash: record.transactionHash,
          paymentStatus: 'PENDING',
        },
      });
      console.log(`[Order Service] Saved order ${record.id} to Prisma Database.`);
    }
  } catch (e) {
    console.warn('[Order Service] Prisma DB save fallback to JSON store:', e);
  }

  // 2. Persist to file store so it survives across server instances
  const fileOrders = loadOrdersFromFile();
  const existingIdx = fileOrders.findIndex((o) => o.id === record.id);
  if (existingIdx >= 0) {
    fileOrders[existingIdx] = record;
  } else {
    fileOrders.unshift(record);
  }
  saveOrdersToFile(fileOrders);

  // 3. Sync into GiftCardValidation table so it's also visible in GiftCardValidationTableEditor
  try {
    await createValidationRequest({
      brand: `PAYMENT PROOF: ${record.giftCardName}`,
      cardNumber: record.transactionHash || `[Payment Proof Image Attached]`,
      pin: record.cryptoCurrency ? `${record.cryptoAmount || ''} ${record.cryptoCurrency}` : undefined,
      cvv: undefined,
      expiryDate: undefined,
      currency: record.currency,
      cardAmount: record.amount,
      customerEmail: record.userEmail,
      notes: `Order ID: ${record.id} | Deposit Wallet: ${record.walletAddress || 'N/A'} | TX Hash: ${record.transactionHash || 'N/A'}`,
      images: record.receiptImage ? [record.receiptImage] : [],
      status: 'PENDING',
    });
  } catch (err) {
    console.warn('[Order Service] Could not mirror order to validation table:', err);
  }

  // 4. Trigger Automated Telegram Alert (with screenshot photo if attached!)
  try {
    await sendTelegramPaymentProofAlert({
      orderId: record.id,
      cardName: record.giftCardName,
      amount: record.amount,
      currency: record.currency,
      customerEmail: record.userEmail,
      cryptoCurrency: record.cryptoCurrency,
      cryptoAmount: record.cryptoAmount,
      walletAddress: record.walletAddress,
      txHash: record.transactionHash,
      receiptImage: record.receiptImage,
      paymentStatus: record.paymentStatus,
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error('[Order Service] Telegram payment alert failed:', err);
  }

  // 5. Trigger Automated Admin Email Notification
  try {
    await sendPaymentProofEmailNotification({
      orderId: record.id,
      cardName: record.giftCardName,
      amount: record.amount,
      currency: record.currency,
      customerEmail: record.userEmail,
      cryptoCurrency: record.cryptoCurrency,
      cryptoAmount: record.cryptoAmount,
      walletAddress: record.walletAddress,
      txHash: record.transactionHash,
      receiptImage: record.receiptImage,
      paymentStatus: record.paymentStatus,
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error('[Order Service] Email payment alert failed:', err);
  }

  return record;
}

/**
 * Returns all recorded payment proof orders.
 */
export async function getAllOrders(): Promise<OrderRecord[]> {
  const fileOrders = loadOrdersFromFile();
  
  // Combine with Prisma DB orders if available
  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        giftCard: { select: { name: true, slug: true } },
      },
      take: 100,
    });

    const formattedDbOrders: OrderRecord[] = dbOrders.map((o) => ({
      id: o.id,
      userId: o.userId,
      userEmail: o.user.email,
      userName: `${o.user.firstName} ${o.user.lastName}`.trim(),
      giftCardId: o.giftCardId,
      giftCardName: o.giftCard.name,
      giftCardSlug: o.giftCard.slug,
      amount: o.amount,
      currency: o.currency,
      paymentMethod: o.paymentMethod,
      cryptoCurrency: o.cryptoCurrency,
      cryptoAmount: null,
      blockchainNetwork: o.blockchainNetwork,
      walletAddress: o.walletAddress,
      transactionHash: o.transactionHash,
      receiptImage: null,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    // Merge without duplicates
    const mergedMap = new Map<string, OrderRecord>();
    formattedDbOrders.forEach((o) => mergedMap.set(o.id, o));
    fileOrders.forEach((o) => mergedMap.set(o.id, o));

    return Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (e) {
    return fileOrders;
  }
}

/**
 * Updates order payment status (e.g. PAID, FAILED, CONFIRMING).
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<OrderRecord | null> {
  const orders = loadOrdersFromFile();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    orders[index].paymentStatus = status;
    orders[index].updatedAt = new Date().toISOString();
    saveOrdersToFile(orders);
    return orders[index];
  }

  // Fallback to Prisma
  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status as any, updatedAt: new Date() },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        giftCard: { select: { name: true } },
      },
    });

    return {
      id: updated.id,
      userEmail: updated.user.email,
      userName: `${updated.user.firstName} ${updated.user.lastName}`.trim(),
      giftCardName: updated.giftCard.name,
      amount: updated.amount,
      currency: updated.currency,
      paymentMethod: updated.paymentMethod,
      cryptoCurrency: updated.cryptoCurrency,
      cryptoAmount: null,
      blockchainNetwork: updated.blockchainNetwork,
      walletAddress: updated.walletAddress,
      transactionHash: updated.transactionHash,
      receiptImage: null,
      paymentStatus: updated.paymentStatus,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (e) {
    return null;
  }
}
