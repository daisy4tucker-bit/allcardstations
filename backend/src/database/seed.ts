import 'dotenv/config';
import { prisma } from './prisma.js';
import { hashPassword } from '../utils/password.js';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding via Prisma Client...');

  try {
    // 1. Seed Categories
    const categories = [
      { id: 'cat-gaming', name: 'Gaming', slug: 'gaming' },
      { id: 'cat-shopping', name: 'Shopping', slug: 'shopping' },
      { id: 'cat-entertainment', name: 'Entertainment', slug: 'entertainment' },
      { id: 'cat-food', name: 'Food & Dining', slug: 'food' },
      { id: 'cat-travel', name: 'Travel & Airlines', slug: 'travel' },
      { id: 'cat-technology', name: 'Technology & Software', slug: 'technology' },
      { id: 'cat-fashion', name: 'Fashion & Apparel', slug: 'fashion' },
      { id: 'cat-prepaid', name: 'Prepaid & Banking', slug: 'prepaid' },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name, slug: cat.slug },
        create: cat,
      });
    }
    console.log(`✅ Seeded ${categories.length} categories.`);

    // 2. Seed Gift Cards
    const giftCards = [
      {
        id: 'gc-apple',
        name: 'Apple Gift Card',
        slug: 'apple',
        category: 'Technology',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'For everything Apple: iPad, AirPods, Apple Watch, iPhone, MacBook, iCloud+, App Store and subscriptions.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-steam',
        name: 'Steam Wallet Card',
        slug: 'steam',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Instant access to thousands of games from Action to Indie and everything in between on Steam.',
        startingPrice: 5.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-amazon',
        name: 'Amazon eGift Card',
        slug: 'amazon',
        category: 'Shopping',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Shop millions of items storewide with no expiration dates and no added maintenance fees.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1523474253246-73be6cb4215c?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-razer',
        name: 'Razer Gold PIN',
        slug: 'razer-gold',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Unified virtual credits for gamers worldwide to spend on over 42,000 games and in-game content.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-playstation',
        name: 'PlayStation Store Card',
        slug: 'playstation',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Download the latest games, add-ons, PlayStation Plus subscriptions, and entertainment on PS5 & PS4.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-xbox',
        name: 'Xbox Game Pass & Gift Card',
        slug: 'xbox',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Get games and entertainment on Xbox and Windows with freedom to choose the gift you want.',
        startingPrice: 15.0,
        available: true,
        image: 'https://www.giftlycard.com/_next/image?url=%2Fimages%2Fxbox.webp&w=640&q=75&dpl=dpl_2yRJNX2mkHQg7ZSv9wTZaivCyjJR',
      },
      {
        id: 'gc-netflix',
        name: 'Netflix Subscription Card',
        slug: 'netflix',
        category: 'Entertainment',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Watch TV shows and movies anytime, anywhere, on any screen with seamless voucher redemption.',
        startingPrice: 15.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-spotify',
        name: 'Spotify Premium Card',
        slug: 'spotify',
        category: 'Entertainment',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Enjoy ad-free music, offline listening, and unlimited skips with prepaid Spotify Premium.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-roblox',
        name: 'Roblox Robux & Card',
        slug: 'roblox',
        category: 'Gaming',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Get Robux to purchase additional upgrades in-game or buy items for your custom avatar.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-googleplay',
        name: 'Google Play Gift Card',
        slug: 'google-play',
        category: 'Technology',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Power up in your favorite games, rent top movies, buy books, and pay for Android apps.',
        startingPrice: 10.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-airbnb',
        name: 'Airbnb Gift Card',
        slug: 'airbnb',
        category: 'Travel',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Give the gift of unforgettable trips, unique stays, and one-of-a-kind local experiences worldwide.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-uber',
        name: 'Uber & Uber Eats Card',
        slug: 'uber',
        category: 'Food & Dining',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'One card for reliable rides across town or favorite meals delivered straight to your doorstep.',
        startingPrice: 15.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-nike',
        name: 'Nike Gift Card',
        slug: 'nike',
        category: 'Fashion',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Redeemable on Nike.com, Nike App, and Nike retail stores for premier footwear and sportswear.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'gc-vanilla-visa',
        name: 'Vanilla Visa Prepaid',
        slug: 'vanilla-visa',
        category: 'Prepaid',
        region: 'GLOBAL',
        currency: 'USD',
        description: 'Universal prepaid Visa card accepted everywhere Visa debit cards are honored online or in-store.',
        startingPrice: 25.0,
        available: true,
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      },
    ];

    for (const gc of giftCards) {
      await prisma.giftCard.upsert({
        where: { id: gc.id },
        update: {
          name: gc.name,
          slug: gc.slug,
          category: gc.category,
          description: gc.description,
          startingPrice: gc.startingPrice,
          available: gc.available,
          image: gc.image,
          updatedAt: new Date(),
        },
        create: gc,
      });
    }
    console.log(`✅ Seeded ${giftCards.length} gift cards.`);

    // 3. Seed Users
    const adminPassHash = await hashPassword('Electadmin100!');
    const agentPassHash = await hashPassword('SupportSecure123!');
    const customerPassHash = await hashPassword('Password123!');

    const usersToSeed = [
      {
        id: 'usr-admin-01',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@allcardvault.com',
        passwordHash: adminPassHash,
        role: 'ADMIN' as const,
        phone: '+1 (555) 019-2831',
        country: 'United States',
        preferences: JSON.stringify({ theme: 'dark', notifications: true, roleAccess: 'full' }),
      },
      {
        id: 'usr-agent-01',
        firstName: 'Sarah',
        lastName: 'Connor (Support Lead)',
        email: 'support@allcardvault.com',
        passwordHash: agentPassHash,
        role: 'SUPPORT_AGENT' as const,
        phone: '+1 (555) 302-8921',
        country: 'United Kingdom',
        preferences: JSON.stringify({ theme: 'system', autoAssign: true }),
      },
      {
        id: 'usr-customer-01',
        firstName: 'Daisy',
        lastName: 'Tucker',
        email: 'daisy4tucker@gmail.com',
        passwordHash: customerPassHash,
        role: 'ADMIN' as const,
        phone: '+1 (555) 849-1029',
        country: 'United States',
        preferences: JSON.stringify({ newsletter: true, currency: 'USD', securityAlerts: true, roleAccess: 'full_admin' }),
      },
      {
        id: 'usr-customer-02',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        passwordHash: customerPassHash,
        role: 'CUSTOMER' as const,
        phone: '+1 (555) 439-0182',
        country: 'Canada',
        preferences: JSON.stringify({ newsletter: false, currency: 'USD' }),
      },
    ];

    for (const u of usersToSeed) {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          firstName: u.firstName,
          lastName: u.lastName,
          passwordHash: u.passwordHash,
          role: u.role,
          updatedAt: new Date(),
        },
        create: {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
        },
      });

      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {
          phone: u.phone,
          country: u.country,
          preferences: u.preferences,
          updatedAt: new Date(),
        },
        create: {
          id: `prof-${user.id}`,
          userId: user.id,
          phone: u.phone,
          country: u.country,
          preferences: u.preferences,
        },
      });
    }
    console.log(`✅ Seeded ${usersToSeed.length} user accounts with profiles.`);

    // 4. Seed Favorites
    const favorites = [
      { id: 'fav-01', userId: 'usr-customer-01', giftCardId: 'gc-apple' },
      { id: 'fav-02', userId: 'usr-customer-01', giftCardId: 'gc-steam' },
      { id: 'fav-03', userId: 'usr-customer-01', giftCardId: 'gc-amazon' },
      { id: 'fav-04', userId: 'usr-customer-02', giftCardId: 'gc-razer' },
    ];

    for (const f of favorites) {
      await prisma.favoriteGiftCard.upsert({
        where: {
          userId_giftCardId: {
            userId: f.userId,
            giftCardId: f.giftCardId,
          },
        },
        update: {},
        create: {
          id: f.id,
          userId: f.userId,
          giftCardId: f.giftCardId,
        },
      });
    }
    console.log(`✅ Seeded ${favorites.length} user favorites.`);

    // 5. Seed Recipients
    const recipients = [
      {
        id: 'rec-01',
        userId: 'usr-customer-01',
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 789-2341',
        relationship: 'Colleague',
      },
      {
        id: 'rec-02',
        userId: 'usr-customer-01',
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 902-3847',
        relationship: 'Sister',
      },
      {
        id: 'rec-03',
        userId: 'usr-customer-02',
        name: 'Liam Zhang',
        email: 'liam.zhang@example.com',
        phone: '+1 (555) 438-1920',
        relationship: 'Friend',
      },
    ];

    for (const r of recipients) {
      await prisma.recipient.upsert({
        where: { id: r.id },
        update: {
          name: r.name,
          email: r.email,
          phone: r.phone,
          relationship: r.relationship,
          updatedAt: new Date(),
        },
        create: r,
      });
    }
    console.log(`✅ Seeded ${recipients.length} saved recipients.`);

    // 6. Seed Support Conversation & Messages
    const convId = 'conv-sample-01';
    await prisma.conversation.upsert({
      where: { visitorId: 'vis_daisy_session_01' },
      update: { status: 'OPEN', updatedAt: new Date() },
      create: {
        id: convId,
        userId: 'usr-customer-01',
        visitorId: 'vis_daisy_session_01',
        status: 'OPEN',
      },
    });

    const messages = [
      {
        id: 'msg-01',
        conversationId: convId,
        senderType: 'CUSTOMER' as const,
        message: 'Hello! I wanted to check what cryptocurrency options will be accepted for Steam and Apple gift cards?',
      },
      {
        id: 'msg-02',
        conversationId: convId,
        senderType: 'AI_ASSISTANT' as const,
        message: 'Welcome to AllCardVault Support! We support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Solana (SOL), and Stablecoins (USDT & USDC). Payments are processed without traditional card processing fees.',
      },
      {
        id: 'msg-03',
        conversationId: convId,
        senderType: 'SUPPORT_AGENT' as const,
        message: 'Hi Daisy! Sarah here from Support. All payments will be processed via decentralized smart contracts and verified on-chain in Phase 3. Let us know if you need any balance validation in the meantime!',
      },
    ];

    for (const m of messages) {
      const existing = await prisma.message.findUnique({ where: { id: m.id } });
      if (!existing) {
        await prisma.message.create({
          data: m,
        });
      }
    }
    console.log(`✅ Seeded support conversation with ${messages.length} messages.`);

    console.log('🎉 Database seeding completed successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
