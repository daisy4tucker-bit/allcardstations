import { prisma } from './prisma.js';
import {
  User,
  Profile,
  GiftCard,
  Category,
  FavoriteGiftCard,
  Recipient,
  Order,
  Conversation,
  Message,
  Role,
  ConversationStatus,
  SenderType,
} from '../models/types.js';

class DatabaseStore {
  // --- USER METHODS ---
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role as any,
        profile: {
          create: {
            phone: null,
            country: null,
            avatar: null,
            preferences: null,
          },
        },
      },
    });

    return {
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      passwordHash: createdUser.passwordHash,
      role: createdUser.role as Role,
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  // --- PROFILE METHODS ---
  async findProfileByUserId(userId: string): Promise<Profile | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      phone: profile.phone,
      country: profile.country,
      avatar: profile.avatar,
      preferences: profile.preferences,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        phone: data.phone !== undefined ? data.phone : undefined,
        country: data.country !== undefined ? data.country : undefined,
        avatar: data.avatar !== undefined ? data.avatar : undefined,
        preferences: data.preferences !== undefined ? data.preferences : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        phone: data.phone ?? null,
        country: data.country ?? null,
        avatar: data.avatar ?? null,
        preferences: data.preferences ?? null,
      },
    });

    return {
      id: profile.id,
      userId: profile.userId,
      phone: profile.phone,
      country: profile.country,
      avatar: profile.avatar,
      preferences: profile.preferences,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  // --- GIFT CARDS & CATEGORIES ---
  async getAllCategories(): Promise<Category[]> {
    const cats = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  }

  async getAllGiftCards(category?: string, search?: string): Promise<GiftCard[]> {
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const cards = await prisma.giftCard.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return cards.map((gc) => ({
      id: gc.id,
      name: gc.name,
      slug: gc.slug,
      category: gc.category,
      region: gc.region,
      currency: gc.currency,
      description: gc.description,
      startingPrice: gc.startingPrice,
      available: gc.available,
      image: gc.image || undefined,
      createdAt: gc.createdAt.toISOString(),
      updatedAt: gc.updatedAt.toISOString(),
    }));
  }

  async getGiftCardBySlug(slug: string): Promise<GiftCard | null> {
    const gc = await prisma.giftCard.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
    });
    if (!gc) return null;
    return {
      id: gc.id,
      name: gc.name,
      slug: gc.slug,
      category: gc.category,
      region: gc.region,
      currency: gc.currency,
      description: gc.description,
      startingPrice: gc.startingPrice,
      available: gc.available,
      image: gc.image || undefined,
      createdAt: gc.createdAt.toISOString(),
      updatedAt: gc.updatedAt.toISOString(),
    };
  }

  async getGiftCardById(id: string): Promise<GiftCard | null> {
    const gc = await prisma.giftCard.findUnique({
      where: { id },
    });
    if (!gc) return null;
    return {
      id: gc.id,
      name: gc.name,
      slug: gc.slug,
      category: gc.category,
      region: gc.region,
      currency: gc.currency,
      description: gc.description,
      startingPrice: gc.startingPrice,
      available: gc.available,
      image: gc.image || undefined,
      createdAt: gc.createdAt.toISOString(),
      updatedAt: gc.updatedAt.toISOString(),
    };
  }

  // --- FAVORITES ---
  async getFavoritesByUserId(userId: string): Promise<FavoriteGiftCard[]> {
    const favs = await prisma.favoriteGiftCard.findMany({
      where: { userId },
      include: { giftCard: true },
      orderBy: { createdAt: 'desc' },
    });

    return favs.map((f) => ({
      id: f.id,
      userId: f.userId,
      giftCardId: f.giftCardId,
      createdAt: f.createdAt.toISOString(),
      giftCard: f.giftCard
        ? {
            id: f.giftCard.id,
            name: f.giftCard.name,
            slug: f.giftCard.slug,
            category: f.giftCard.category,
            region: f.giftCard.region,
            currency: f.giftCard.currency,
            description: f.giftCard.description,
            startingPrice: f.giftCard.startingPrice,
            available: f.giftCard.available,
            image: f.giftCard.image || undefined,
            createdAt: f.giftCard.createdAt.toISOString(),
            updatedAt: f.giftCard.updatedAt.toISOString(),
          }
        : undefined,
    }));
  }

  async addFavorite(userId: string, giftCardId: string): Promise<FavoriteGiftCard> {
    let resolvedCardId = giftCardId;
    // Check if giftCardId is a slug
    const card = await prisma.giftCard.findFirst({
      where: {
        OR: [{ id: giftCardId }, { slug: giftCardId }],
      },
    });
    if (card) {
      resolvedCardId = card.id;
    }

    const fav = await prisma.favoriteGiftCard.upsert({
      where: {
        userId_giftCardId: {
          userId,
          giftCardId: resolvedCardId,
        },
      },
      update: {},
      create: {
        userId,
        giftCardId: resolvedCardId,
      },
      include: { giftCard: true },
    });

    return {
      id: fav.id,
      userId: fav.userId,
      giftCardId: fav.giftCardId,
      createdAt: fav.createdAt.toISOString(),
      giftCard: fav.giftCard
        ? {
            id: fav.giftCard.id,
            name: fav.giftCard.name,
            slug: fav.giftCard.slug,
            category: fav.giftCard.category,
            region: fav.giftCard.region,
            currency: fav.giftCard.currency,
            description: fav.giftCard.description,
            startingPrice: fav.giftCard.startingPrice,
            available: fav.giftCard.available,
            image: fav.giftCard.image || undefined,
            createdAt: fav.giftCard.createdAt.toISOString(),
            updatedAt: fav.giftCard.updatedAt.toISOString(),
          }
        : undefined,
    };
  }

  async removeFavorite(userId: string, identifier: string): Promise<boolean> {
    // identifier can be id, giftCardId, or gift card slug
    let cardId = identifier;
    const card = await prisma.giftCard.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });
    if (card) {
      cardId = card.id;
    }

    const deleteRes = await prisma.favoriteGiftCard.deleteMany({
      where: {
        userId,
        OR: [{ id: identifier }, { giftCardId: cardId }],
      },
    });

    return deleteRes.count > 0;
  }

  // --- RECIPIENTS ---
  async getRecipientsByUserId(userId: string): Promise<Recipient[]> {
    const recipients = await prisma.recipient.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return recipients.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      email: r.email,
      phone: r.phone,
      relationship: r.relationship,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addRecipient(
    userId: string,
    data: { name: string; email?: string | null; phone?: string | null; relationship?: string | null }
  ): Promise<Recipient> {
    const r = await prisma.recipient.create({
      data: {
        userId,
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        relationship: data.relationship?.trim() || null,
      },
    });

    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      email: r.email,
      phone: r.phone,
      relationship: r.relationship,
      createdAt: r.createdAt.toISOString(),
    };
  }

  async updateRecipient(
    userId: string,
    id: string,
    data: { name?: string; email?: string | null; phone?: string | null; relationship?: string | null }
  ): Promise<Recipient | null> {
    const existing = await prisma.recipient.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const r = await prisma.recipient.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        email: data.email !== undefined ? data.email?.trim() || null : undefined,
        phone: data.phone !== undefined ? data.phone?.trim() || null : undefined,
        relationship: data.relationship !== undefined ? data.relationship?.trim() || null : undefined,
        updatedAt: new Date(),
      },
    });

    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      email: r.email,
      phone: r.phone,
      relationship: r.relationship,
      createdAt: r.createdAt.toISOString(),
    };
  }

  async deleteRecipient(userId: string, id: string): Promise<boolean> {
    const deleteRes = await prisma.recipient.deleteMany({
      where: { id, userId },
    });
    return deleteRes.count > 0;
  }

  // --- SUPPORT CONVERSATIONS & MESSAGES ---
  async getOrCreateConversation(visitorId: string, userId?: string | null): Promise<Conversation> {
    let conv = await prisma.conversation.findFirst({
      where: {
        OR: [
          { visitorId },
          ...(userId ? [{ userId }] : []),
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          visitorId,
          userId: userId || null,
          status: 'OPEN',
          messages: {
            create: {
              senderType: 'SUPPORT_AGENT',
              message: 'Hello! 👋 Welcome to AllCardStation Live Support. How can we help you today?',
            },
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    } else if (userId && !conv.userId) {
      // Link anonymous conversation to authenticated user
      conv = await prisma.conversation.update({
        where: { id: conv.id },
        data: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return {
      id: conv.id,
      userId: conv.userId,
      visitorId: conv.visitorId,
      status: conv.status as ConversationStatus,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderType: m.senderType as SenderType,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!conv) return null;

    return {
      id: conv.id,
      userId: conv.userId,
      visitorId: conv.visitorId,
      status: conv.status as ConversationStatus,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderType: m.senderType as SenderType,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async getAllConversations(status?: ConversationStatus): Promise<any[]> {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => ({
      id: c.id,
      userId: c.userId,
      visitorId: c.visitorId,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      user: c.user,
      lastMessage: c.messages[0]
        ? {
            id: c.messages[0].id,
            senderType: c.messages[0].senderType,
            message: c.messages[0].message,
            createdAt: c.messages[0].createdAt.toISOString(),
          }
        : null,
    }));
  }

  async updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<Conversation | null> {
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      visitorId: updated.visitorId,
      status: updated.status as ConversationStatus,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      messages: updated.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderType: m.senderType as SenderType,
        message: m.message,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async addMessage(
    conversationId: string,
    senderType: SenderType,
    messageText: string
  ): Promise<Message | null> {
    const msg = await prisma.message.create({
      data: {
        conversationId,
        senderType: senderType as any,
        message: messageText,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderType: msg.senderType as SenderType,
      message: msg.message,
      createdAt: msg.createdAt.toISOString(),
    };
  }

  // --- SYSTEM STATS FOR ADMIN ---
  async getSystemStats(): Promise<{
    usersCount: number;
    cardsCount: number;
    recipientsCount: number;
    favoritesCount: number;
    conversationsCount: number;
    messagesCount: number;
  }> {
    const [usersCount, cardsCount, recipientsCount, favoritesCount, conversationsCount, messagesCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.giftCard.count(),
        prisma.recipient.count(),
        prisma.favoriteGiftCard.count(),
        prisma.conversation.count(),
        prisma.message.count(),
      ]);

    return {
      usersCount,
      cardsCount,
      recipientsCount,
      favoritesCount,
      conversationsCount,
      messagesCount,
    };
  }
}

export const db = new DatabaseStore();
export default db;
