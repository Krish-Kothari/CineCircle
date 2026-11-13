
const prisma = require('../../src/config/prisma');

const { seedUsers } = require('./users.seed');
const { seedMovies } = require('./movies.seed');
const { seedShows } = require('./shows.seed');
const { seedGroups } = require('./groups.seed');

async function main() {
  console.log('Starting CineCircle PostgreSQL Database Seed...');

  // Clear existing group nominations and votes before reseeding
  await prisma.groupPollVote.deleteMany({});
  await prisma.groupWatchlistItem.deleteMany({});

  const users = await seedUsers(prisma);
  console.log('1. Seeded Users:', Object.keys(users).join(', '));

  const movies = await seedMovies(prisma);
  console.log(`2. Seeded ${movies.length} Movies.`);

  const shows = await seedShows(prisma);
  console.log(`3. Seeded ${shows.length} TV Shows.`);

  const allMedia = [...movies, ...shows];

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

  