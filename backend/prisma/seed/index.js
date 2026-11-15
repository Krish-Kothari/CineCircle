
const prisma = require('../../src/config/prisma');

const { seedUsers } = require('./users.seed');
const { seedCatalog } = require('./catalog.seed');
const { seedReviews } = require('./reviews.seed');
const { seedGroups } = require('./groups.seed');

async function main() {
  console.log('Starting CineCircle PostgreSQL Database Seed...');

  // Clear existing group nominations and votes before reseeding
  await prisma.groupPollVote.deleteMany({});
  await prisma.groupWatchlistItem.deleteMany({});

  const users = await seedUsers(prisma);
  console.log('1. Seeded Users:', Object.keys(users).join(', '));

  await seedCatalog(prisma);
  const allMedia = await prisma.mediaItem.findMany({ orderBy: { title: 'asc' } });
  await seedReviews();
  console.log(`2. Seeded ${allMedia.length} catalog titles.`);

  const { group } = await seedGroups(prisma, users, allMedia);
  console.log(
    `4. Seeded Friend Squad "${group.name}" (Invite Code: ${group.inviteCode})`
  );

  console.log('CineCircle Seed Completed Successfully!');
}

main()
  .catch((err) => {
    console.error('Seed Error:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  