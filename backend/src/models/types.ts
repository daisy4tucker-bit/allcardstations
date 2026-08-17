export enum Role {
  CUSTOMER = 'CUSTOMER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  ADMIN = 'ADMIN',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  CONFIRMING = 'CONFIRMING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum ConversationStatus {
  OPEN = 'OPEN',
  WAITING = 'WAITING',
  CLOSED = 'CLOSED',
}

export enum SenderType {
  CUSTOMER = 'CUSTOMER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  phone?: string | null;
  country?: string | null;
  avatar?: string | null;
  preferences?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile extends Omit<User, 'passwordHash'> {
  profile: Profile | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface GiftCard {
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

export interface FavoriteGiftCard {
  id: string;
  userId: string;
  giftCardId: string;
  createdAt: string;
  giftCard?: GiftCard;
}

export interface Recipient {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  relationship?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  giftCardId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cryptoCurrency?: string | null;
  blockchainNetwork?: string | null;
  walletAddress?: string | null;
  transactionHash?: string | null;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId?: string | null;
  visitorId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  message: string;
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}
