import { prisma } from '../database/prisma.js';
import { getAdminValidations } from './validationService.js';

export interface AdminUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    phone: string | null;
    country: string | null;
    avatar: string | null;
    preferences: string | null;
    createdAt: Date;
  } | null;
  ordersCount: number;
  favoritesCount: number;
}

export interface AdminOrderData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  giftCardId: string;
  giftCardName: string;
  giftCardSlug: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cryptoCurrency: string | null;
  blockchainNetwork: string | null;
  walletAddress: string | null;
  transactionHash: string | null;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminGiftCardData {
  id: string;
  name: string;
  slug: string;
  category: string;
  region: string;
  currency: string;
  description: string;
  startingPrice: number;
  available: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  ordersCount: number;
  favoritesCount: number;
}

export interface AdminValidationData {
  id: string;
  brand: string;
  cardNumber: string;
  cardNumberMasked: string;
  pin: string | null;
  cvv: string | null;
  expiryDate: string | null;
  images: string[];
  currency: string;
  cardAmount: number;
  status: string;
  result: string;
  notes?: string | null;
  customerEmail?: string | null;
  customerIp?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminDataBrowserPayload {
  users: AdminUserData[];
  orders: AdminOrderData[];
  giftCards: AdminGiftCardData[];
  validations: AdminValidationData[];
  counts: {
    totalUsers: number;
    totalOrders: number;
    totalGiftCards: number;
    totalValidations: number;
    totalVolumeUsd: number;
  };
}

export async function getAdminDataBrowser(): Promise<AdminDataBrowserPayload> {
  // Fetch users with their profile and counts
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      profile: true,
      _count: {
        select: {
          orders: true,
          favorites: true,
        },
      },
    },
    take: 100,
  });

  // Fetch orders with user and gift card details
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      giftCard: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    take: 100,
  });

  // Fetch gift card inventory
  const giftCards = await prisma.giftCard.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          orders: true,
          favorites: true,
        },
      },
    },
    take: 100,
  });

  const formattedUsers: AdminUserData[] = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    profile: u.profile
      ? {
          id: u.profile.id,
          phone: u.profile.phone,
          country: u.profile.country,
          avatar: u.profile.avatar,
          preferences: u.profile.preferences,
          createdAt: u.profile.createdAt,
        }
      : null,
    ordersCount: u._count.orders,
    favoritesCount: u._count.favorites,
  }));

  const formattedOrders: AdminOrderData[] = orders.map((o) => ({
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
    blockchainNetwork: o.blockchainNetwork,
    walletAddress: o.walletAddress,
    transactionHash: o.transactionHash,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));

  const formattedGiftCards: AdminGiftCardData[] = giftCards.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    category: g.category,
    region: g.region,
    currency: g.currency,
    description: g.description,
    startingPrice: g.startingPrice,
    available: g.available,
    image: g.image,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    ordersCount: g._count.orders,
    favoritesCount: g._count.favorites,
  }));

  // Fetch gift card validations submitted by users (with automatic Supabase cloud restore)
  const validations = await getAdminValidations();

  const formattedValidations: AdminValidationData[] = validations.map((v) => {
    const isPhotoOnly = v.cardNumber?.startsWith('[Image Verification');
    const masked = isPhotoOnly
      ? v.cardNumber
      : v.cardNumber.length > 4
      ? `****-****-****-${v.cardNumber.slice(-4)}`
      : '****';

    return {
      id: v.id,
      brand: v.brand,
      cardNumber: v.cardNumber,
      cardNumberMasked: masked,
      pin: v.pin,
      cvv: v.cvv,
      expiryDate: v.expiryDate,
      images: Array.isArray(v.images)
        ? v.images
        : (() => {
            try {
              return JSON.parse((v.images as string) || '[]');
            } catch {
              return [];
            }
          })(),
      currency: v.currency || 'USD',
      cardAmount: v.cardAmount || 0,
      status: v.status,
      result: v.result,
      notes: v.notes,
      customerEmail: v.customerEmail,
      customerIp: v.customerIp,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    };
  });

  const totalVolumeUsd = formattedOrders.reduce((sum, ord) => sum + (ord.amount || 0), 0);

  return {
    users: formattedUsers,
    orders: formattedOrders,
    giftCards: formattedGiftCards,
    validations: formattedValidations,
    counts: {
      totalUsers: formattedUsers.length,
      totalOrders: formattedOrders.length,
      totalGiftCards: formattedGiftCards.length,
      totalValidations: formattedValidations.length,
      totalVolumeUsd,
    },
  };
}
