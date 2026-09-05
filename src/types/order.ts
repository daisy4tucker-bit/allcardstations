export type OrderStatus = 'COMPLETED' | 'DELIVERED' | 'PENDING' | 'PROCESSING' | 'CONFIRMING' | 'FAILED' | 'CANCELLED';

export interface TimelineEvent {
  step: number;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
}

export interface PurchaseTransaction {
  id: string;
  cardName: string;
  cardSlug?: string;
  cardImage?: string;
  category?: string;
  amount: number;
  currency: string;
  customerEmail: string;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
  cryptoCurrency: string;
  cryptoAmount: string | number;
  walletAddress?: string;
  txHash?: string;
  receiptImage?: string | null;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt?: string;
  eCode?: string;
  pin?: string;
  barcode?: string;
  expiresAt?: string;
  timeline: TimelineEvent[];
}
