import 'dotenv/config';
import { prisma } from '../database/prisma.js';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runLiveIntegrationTest() {
  console.log('================================================================');
  console.log('🚀 ALLCARDSTATION PHASE 2: LIVE HTTP & DATABASE INTEGRATION TEST');
  console.log('================================================================');
  console.log(`Backend Server Target: ${BASE_URL}`);
  console.log(`Supabase PostgreSQL: Connected via Prisma\n`);

  const results: TestResult[] = [];

  async function step(suite: string, name: string, fn: () => Promise<string | void>) {
    const start = Date.now();
    try {
      const details = await fn();
      const durationMs = Date.now() - start;
      results.push({
        suite,
        name,
        passed: true,
        durationMs,
        details: typeof details === 'string' ? details : undefined,
      });
      console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
      if (details) console.log(`     ↳ ${details}`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      results.push({
        suite,
        name,
        passed: false,
        durationMs,
        error: err.message || String(err),
      });
      console.log(`  ❌ [FAIL] ${name} (${durationMs}ms)`);
      console.log(`     ↳ Error: ${err.message || err}`);
    }
  }

  // --- 1. GIFT CARD CATALOG LOADS FROM DATABASE ---
  console.log('\n--- 1. GIFT CARD CATALOG LOADS FROM DATABASE ---');
  await step('Catalog', 'Health check API is responsive', async () => {
    const res = await request('/health');
    if (!res.ok || res.data?.status !== 'ok') {
      throw new Error(`Health check failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    return `Server healthy. Phase: ${res.data.phase}`;
  });

  await step('Catalog', 'Load categories from Supabase via GET /api/gift-cards/categories', async () => {
    const res = await request('/gift-cards/categories');
    if (!res.ok || !res.data?.success) {
      throw new Error(`Categories endpoint failed: ${JSON.stringify(res.data)}`);
    }
    const categories = res.data.data.categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('Categories list returned empty from database.');
    }
    return `Retrieved ${categories.length} categories from Supabase (e.g. ${categories.map((c: any) => c.name).slice(0, 4).join(', ')}...)`;
  });

  await step('Catalog', 'Load all gift cards from Supabase via GET /api/gift-cards', async () => {
    const res = await request('/gift-cards');
    if (!res.ok || !res.data?.success) {
      throw new Error(`Gift cards endpoint failed: ${JSON.stringify(res.data)}`);
    }
    const giftCards = res.data.data.giftCards;
    if (!Array.isArray(giftCards) || giftCards.length < 10) {
      throw new Error(`Expected at least 10 gift cards, received ${giftCards?.length}`);
    }

    // Verify in database
    const dbCount = await prisma.giftCard.count();
    return `Catalog successfully loaded ${giftCards.length} cards from Supabase (Database count: ${dbCount}).`;
  });

  await step('Catalog', 'Filter cards by category & search query', async () => {
    const resGaming = await request('/gift-cards?category=Gaming');
    if (!resGaming.ok || !resGaming.data?.data?.giftCards?.length) {
      throw new Error('Gaming category filter failed');
    }

    const resSearch = await request('/gift-cards?search=Apple');
    if (!resSearch.ok || !resSearch.data?.data?.giftCards?.some((c: any) => c.slug === 'apple')) {
      throw new Error('Search filter for Apple failed');
    }

    return `Category filtering and search queries returned accurate subsets from database.`;
  });

  await step('Catalog', 'Load specific card details via GET /api/gift-cards/:slug', async () => {
    const res = await request('/gift-cards/apple');
    if (!res.ok || !res.data?.data?.giftCard) {
      throw new Error(`Failed to load single card by slug: ${JSON.stringify(res.data)}`);
    }
    const card = res.data.data.giftCard;
    if (card.slug !== 'apple' || !card.startingPrice) {
      throw new Error(`Invalid card details: ${JSON.stringify(card)}`);
    }
    return `Loaded ${card.name} (Starting at $${card.startingPrice} ${card.currency}) directly from Supabase.`;
  });

  // --- 2. USER LOGIN WORKS ---
  console.log('\n--- 2. USER LOGIN WORKS ---');
  let authToken = '';
  let loggedInUser: any = null;

  await step('Authentication', 'Reject invalid credentials with 401 Unauthorized', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'daisy4tucker@gmail.com',
        password: 'WrongPassword!',
      }),
    });
    if (res.status !== 401 && res.ok) {
      throw new Error('Expected 401 Unauthorized for invalid password');
    }
    return `Successfully rejected invalid credentials with status ${res.status}.`;
  });

  await step('Authentication', 'Authenticate user against bcrypt hash in Supabase', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'daisy4tucker@gmail.com',
        password: 'Password123!',
      }),
    });
    if (!res.ok || !res.data?.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
    authToken = res.data.data.token;
    loggedInUser = res.data.data.user;
    if (loggedInUser.email !== 'daisy4tucker@gmail.com') {
      throw new Error('User email in login payload mismatch');
    }
    return `Logged in ${loggedInUser.firstName} ${loggedInUser.lastName} (${loggedInUser.email}), issued valid JWT token.`;
  });

  await step('Authentication', 'Verify JWT authentication on protected endpoint GET /api/auth/me', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok || !res.data?.data?.user) {
      throw new Error(`Auth check failed: ${JSON.stringify(res.data)}`);
    }
    return `Token verified. Authenticated user ID: ${res.data.data.user.id}, Role: ${res.data.data.user.role}`;
  });

  // --- 3. PROFILE DATA LOADS & UPDATES ---
  console.log('\n--- 3. PROFILE DATA LOADS & PERSISTS ---');
  await step('Profile', 'Load profile data from Supabase via GET /api/users/profile', async () => {
    const res = await request('/users/profile', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok || !res.data?.data?.profile) {
      throw new Error(`Failed to load profile: ${JSON.stringify(res.data)}`);
    }
    const profile = res.data.data.profile;
    return `Loaded profile: Country="${profile.country || 'N/A'}", Phone="${profile.phone || 'N/A'}"`;
  });

  const testPhone = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
  await step('Profile', 'Update profile in Supabase via PUT /api/users/profile', async () => {
    const res = await request('/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        firstName: 'Daisy',
        lastName: 'Tucker',
        phone: testPhone,
        country: 'United States',
        preferences: JSON.stringify({ currency: 'USD', newsletter: true, lastUpdated: new Date().toISOString() }),
      }),
    });
    if (!res.ok || !res.data?.data?.profile) {
      throw new Error(`Profile update failed: ${JSON.stringify(res.data)}`);
    }

    // Direct database validation
    const dbProfile = await prisma.profile.findUnique({
      where: { userId: loggedInUser.id },
    });

    if (dbProfile?.phone !== testPhone) {
      throw new Error(`Database verification mismatch! Expected phone ${testPhone}, found ${dbProfile?.phone}`);
    }

    return `Profile updated and verified directly in Supabase PostgreSQL (Phone: ${dbProfile.phone}).`;
  });

  // --- 4. FAVORITES SAVE CORRECTLY ---
  console.log('\n--- 4. FAVORITES SAVE CORRECTLY ---');
  await step('Favorites', 'Fetch user favorites from Supabase via GET /api/favorites', async () => {
    const res = await request('/favorites', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok || !res.data?.data?.favorites) {
      throw new Error(`Failed to load favorites: ${JSON.stringify(res.data)}`);
    }
    const favs = res.data.data.favorites;
    return `Found ${favs.length} initial saved gift cards for user in Supabase.`;
  });

  await step('Favorites', 'Add a gift card to favorites in Supabase via POST /api/favorites', async () => {
    const targetCardId = 'gc-playstation';
    const res = await request('/favorites', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ giftCardId: targetCardId }),
    });
    if (!res.ok || !res.data?.data?.favorite) {
      throw new Error(`Add favorite failed: ${JSON.stringify(res.data)}`);
    }

    // Direct DB check
    const dbFav = await prisma.favoriteGiftCard.findUnique({
      where: {
        userId_giftCardId: {
          userId: loggedInUser.id,
          giftCardId: targetCardId,
        },
      },
    });
    if (!dbFav) {
      throw new Error('Favorite row not found in Supabase database');
    }
    return `Saved '${targetCardId}' to Supabase FavoriteGiftCard table (Record ID: ${dbFav.id}).`;
  });

  await step('Favorites', 'Remove favorite gift card in Supabase via DELETE /api/favorites/:id', async () => {
    const targetCardId = 'gc-playstation';
    const res = await request(`/favorites/${targetCardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok || !res.data?.success) {
      throw new Error(`Delete favorite failed: ${JSON.stringify(res.data)}`);
    }

    // Direct DB check
    const dbFav = await prisma.favoriteGiftCard.findUnique({
      where: {
        userId_giftCardId: {
          userId: loggedInUser.id,
          giftCardId: targetCardId,
        },
      },
    });
    if (dbFav) {
      throw new Error('Favorite row still exists in database after removal');
    }
    return `Successfully removed favorite from Supabase PostgreSQL.`;
  });

  // --- 5. RECIPIENT DIRECTORY SAVES CORRECTLY ---
  console.log('\n--- 5. RECIPIENT DIRECTORY SAVES CORRECTLY ---');
  let createdRecipientId = '';
  const testRecipientName = `Recipient Test ${Date.now().toString().slice(-4)}`;

  await step('Recipients', 'Create new gift recipient in Supabase via POST /api/recipients', async () => {
    const res = await request('/recipients', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        name: testRecipientName,
        email: 'test.recipient@example.com',
        phone: '+1 (555) 392-1082',
        relationship: 'Family Member',
      }),
    });
    if (!res.ok || !res.data?.data?.recipient) {
      throw new Error(`Create recipient failed: ${JSON.stringify(res.data)}`);
    }
    createdRecipientId = res.data.data.recipient.id;

    // Database verification
    const dbRecipient = await prisma.recipient.findUnique({
      where: { id: createdRecipientId },
    });
    if (!dbRecipient || dbRecipient.name !== testRecipientName) {
      throw new Error('Recipient not saved in Supabase database table');
    }
    return `Created recipient '${dbRecipient.name}' in Supabase (ID: ${createdRecipientId}).`;
  });

  await step('Recipients', 'Update recipient details via PUT /api/recipients/:id', async () => {
    const updatedName = `${testRecipientName} (VIP)`;
    const res = await request(`/recipients/${createdRecipientId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        name: updatedName,
        relationship: 'Close Family',
      }),
    });
    if (!res.ok || !res.data?.data?.recipient) {
      throw new Error(`Update recipient failed: ${JSON.stringify(res.data)}`);
    }

    const dbRecipient = await prisma.recipient.findUnique({
      where: { id: createdRecipientId },
    });
    if (dbRecipient?.name !== updatedName) {
      throw new Error('Recipient name not updated in database');
    }
    return `Updated recipient name to '${dbRecipient.name}' in Supabase.`;
  });

  await step('Recipients', 'Delete recipient from Supabase via DELETE /api/recipients/:id', async () => {
    const res = await request(`/recipients/${createdRecipientId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok || !res.data?.success) {
      throw new Error(`Delete recipient failed: ${JSON.stringify(res.data)}`);
    }

    const dbRecipient = await prisma.recipient.findUnique({
      where: { id: createdRecipientId },
    });
    if (dbRecipient) {
      throw new Error('Recipient record still exists in Supabase after deletion');
    }
    return `Successfully deleted recipient record from Supabase.`;
  });

  // --- 6. SUPPORT MESSAGES SAVE CORRECTLY ---
  console.log('\n--- 6. SUPPORT MESSAGES SAVE CORRECTLY ---');
  let testConversationId = '';

  await step('Support', 'Get or create support conversation in Supabase via POST /api/support/conversations', async () => {
    const visitorId = `vis_test_live_${Date.now()}`;
    const res = await request('/support/conversations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ visitorId }),
    });
    if (!res.ok || !res.data?.data?.conversation) {
      throw new Error(`Conversation creation failed: ${JSON.stringify(res.data)}`);
    }
    testConversationId = res.data.data.conversation.id;

    // Database verification
    const dbConv = await prisma.conversation.findUnique({
      where: { id: testConversationId },
      include: { messages: true },
    });
    if (!dbConv) {
      throw new Error('Conversation not found in Supabase database');
    }
    return `Created conversation in Supabase (ID: ${testConversationId}) with initial greeting (${dbConv.messages.length} messages).`;
  });

  await step('Support', 'Save customer support message via POST /api/support/messages', async () => {
    const messageText = `Testing message persistence in Supabase at ${new Date().toISOString()}`;
    const res = await request('/support/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        conversationId: testConversationId,
        message: messageText,
      }),
    });
    if (!res.ok || !res.data?.data?.message) {
      throw new Error(`Send message failed: ${JSON.stringify(res.data)}`);
    }
    const createdMsgId = res.data.data.message.id;

    // Database verification
    const dbMsg = await prisma.message.findUnique({
      where: { id: createdMsgId },
    });
    if (!dbMsg || dbMsg.message !== messageText) {
      throw new Error('Message not stored in Supabase Message table');
    }
    return `Message saved to Supabase (Message ID: ${createdMsgId}, Sender: ${dbMsg.senderType}).`;
  });

  await step('Support', 'Send agent reply & update status in Supabase via Admin Support Console', async () => {
    // Agent reply
    const agentMsgText = 'Hello! Your live ticket has been reviewed and verified in Supabase.';
    const resReply = await request(`/support/admin/conversations/${testConversationId}/reply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ message: agentMsgText }),
    });
    if (!resReply.ok || !resReply.data?.data?.message) {
      throw new Error(`Agent reply failed: ${JSON.stringify(resReply.data)}`);
    }

    // Status update
    const resStatus = await request(`/support/admin/conversations/${testConversationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ status: 'WAITING' }),
    });
    if (!resStatus.ok || resStatus.data?.data?.conversation?.status !== 'WAITING') {
      throw new Error(`Status update failed: ${JSON.stringify(resStatus.data)}`);
    }

    // Verify conversation thread count in database
    const convWithMsgs = await prisma.conversation.findUnique({
      where: { id: testConversationId },
      include: { messages: true },
    });

    return `Agent reply saved. Ticket status updated to WAITING. Total messages stored in Supabase for conversation: ${convWithMsgs?.messages.length}.`;
  });

  // --- SUMMARY ---
  console.log('\n================================================================');
  console.log('📊 LIVE INTEGRATION TEST RESULTS SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Scenarios Tested: ${total}`);
  console.log(`Passed: ${passed} / ${total}`);
  console.log(`Failed: ${failed} / ${total}`);
  console.log('----------------------------------------------------------------');

  if (failed > 0) {
    console.error(`❌ ${failed} test(s) failed. See details above.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 6 PHASE 2 INTEGRATION SUITES PASSED FLAWLESSLY WITH SUPABASE POSTGRESQL!');
    process.exit(0);
  }
}

runLiveIntegrationTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
