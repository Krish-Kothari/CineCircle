const bcrypt = require('bcryptjs');

async function seedUsers(prisma) {
  const passwordHash = await bcrypt.hash('password123', 10);

  const krish = await prisma.user.upsert({
    where: { email: 'krish@nst.edu' },
    update: {},
    create: {
      name: 'Krish',
      username: 'krish_dev',
      email: 'krish@nst.edu',
      passwordHash,
      subscribedOTTs: ['Netflix', 'Prime Video'],
      totalWatchMinutes: 540,
      genrePreferences: {
        create: [
          { genre: 'Sci-Fi', weightScore: 10 },
          { genre: 'Thriller', weightScore: 9 },
          { genre: 'Action', weightScore: 8 }
        ]
      }
    }
  });

  const harsh = await prisma.user.upsert({
    where: { email: 'harsh@nst.edu' },
    update: {},
    create: {
      name: 'Harsh',
      username: 'harsh_db',
      email: 'harsh@nst.edu',
      passwordHash,
      subscribedOTTs: ['Netflix', 'Disney+ Hotstar'],
      totalWatchMinutes: 420,
      genrePreferences: {
        create: [
          { genre: 'Sci-Fi', weightScore: 9 },
          { genre: 'Drama', weightScore: 8 },
          { genre: 'Mystery', weightScore: 9 }
        ]
      }
    }
  });

  const aryan = await prisma.user.upsert({
    where: { email: 'aryan@nst.edu' },
    update: {},
    create: {
      name: 'Aryan',
      username: 'aryan_api',
      email: 'aryan@nst.edu',
      passwordHash,
      subscribedOTTs: ['Prime Video', 'JioCinema'],
      totalWatchMinutes: 380,
      genrePreferences: {
        create: [
          { genre: 'Thriller', weightScore: 10 },
          { genre: 'Sci-Fi', weightScore: 8 },
          { genre: 'Crime', weightScore: 9 }
        ]
      }
    }
  });

  return { krish, harsh, aryan };
}

module.exports = { seedUsers };
