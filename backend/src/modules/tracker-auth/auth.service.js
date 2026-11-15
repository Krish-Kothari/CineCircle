const prisma = require('../../config/prisma');
const { hashPassword, verifyPassword, generateAccessToken } = require('./auth.utils');

async function registerUser({ name, username, email, password, subscribedOTTs = [] }) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { username: normalizedUsername }]
    }
  });

  if (existingUser) {
    const error = new Error('A user with that email or username already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      subscribedOTTs: Array.isArray(subscribedOTTs) ? subscribedOTTs : []
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      subscribedOTTs: true,
      totalWatchMinutes: true,
      createdAt: true
    }
  });

  const token = generateAccessToken(user);
  return { user, token };
}

async function loginUser({ emailOrUsername, password }) {
  const identifier = (emailOrUsername || '').trim();
  const normalizedIdentifier = identifier.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
    },
    include: {
      genrePreferences: true
    }
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateAccessToken(user);
  const { passwordHash, ...safeUser } = user;

  return { user: safeUser, token };
}

async function getUserProfileById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      subscribedOTTs: true,
      totalWatchMinutes: true,
      createdAt: true,
      genrePreferences: {
        orderBy: { weightScore: 'desc' }
      },
      _count: {
        select: {
          watchlist: true,
          reviews: true,
          groupMemberships: true
        }
      }
    }
  });

  if (!user) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfileById
};
