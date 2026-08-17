import { prisma } from './prisma.js';

async function main() {
  console.log('🔍 Testing Prisma Client with Supabase...');
  const users = await prisma.user.findMany({
    include: { profile: true, favorites: true, recipients: true },
  });
  console.log(`✅ Found ${users.length} users in Supabase via Prisma:`);
  users.forEach((u) => {
    console.log(`   • ${u.email} (${u.role}) - ${u.firstName} ${u.lastName} [${u.favorites.length} favs, ${u.recipients.length} recipients]`);
  });

  const cards = await prisma.giftCard.findMany();
  console.log(`✅ Found ${cards.length} gift cards via Prisma.`);

  const convs = await prisma.conversation.findMany({
    include: { messages: true },
  });
  console.log(`✅ Found ${convs.length} support conversations via Prisma.`);
  convs.forEach((c) => {
    console.log(`   • Conv ${c.id} (${c.visitorId}): ${c.messages.length} messages`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Prisma test error:', err);
    process.exit(1);
  });
