const prisma = require('../../src/config/prisma');
const bcrypt = require('bcryptjs');

const USERS = [
  ['test_a', 'Test A', ['Netflix'], [['Sci-Fi', 10], ['Thriller', 8]]],
  ['test_b', 'Test B', ['Prime Video'], [['Drama', 9], ['Sci-Fi', 6]]],
  ['test_c', 'Test C', ['Netflix', 'Prime Video'], [['Crime', 9], ['Thriller', 9]]]
];

const RATINGS = {
  test_a: { Inception: 9, Interstellar: 8, Dark: 9, 'Stranger Things': 8, 'The Dark Knight': 7 },
  test_b: { Interstellar: 9, Parasite: 9, '3 Idiots': 8, Dangal: 8, Inception: 7 },
  test_c: { 'Breaking Bad': 10, 'Money Heist': 9, 'Sacred Games': 9, Drishyam: 8, 'The Dark Knight': 9, Inception: 6 }
};

async function seedReviews() {
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const [uname, name, otts, prefs] of USERS) {
    const user = await prisma.user.upsert({
      where: { email: `${uname}@test.dev` },
      update: {},
      create: {
        name, username: uname, email: `${uname}@test.dev`, passwordHash,
        subscribedOTTs: otts,
        genrePreferences: { create: prefs.map(([genre, weightScore]) => ({ genre, weightScore })) }
      }
    });
    for (const [title, rating] of Object.entries(RATINGS[uname])) {
      const media = await prisma.mediaItem.findFirst({ where: { title } });
      if (!media) continue;
      await prisma.userReview.upsert({
        where: { userId_mediaId: { userId: user.id, mediaId: media.id } },
        update: { rating },
        create: { userId: user.id, mediaId: media.id, rating }
      });
    }
  }
  await prisma.$executeRaw`
    UPDATE "MediaItem" m
    SET "avgRating" = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 1) FROM "UserReview" r WHERE r."mediaId" = m.id), 0)
  `;
  console.log('Reviews seeded for test users');
}

module.exports = { seedReviews };

if (require.main === module) {
  seedReviews()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
