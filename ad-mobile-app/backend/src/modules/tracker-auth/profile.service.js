const prisma = require('../../config/prisma');
const { verifyPassword, hashPassword } = require('./auth.utils');

async function updateUserProfile(userId, { name, subscribedOTTs, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};

  if (name && typeof name === 'string' && name.trim().length >= 2) {
    updateData.name = name.trim();
  }

  if (Array.isArray(subscribedOTTs)) {
    updateData.subscribedOTTs = subscribedOTTs;
  }

  if (newPassword) {
    if (!currentPassword) {
      const error = new Error('Current password is required to set a new password');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Current password does not match');
      error.statusCode = 403;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    updateData.passwordHash = await hashPassword(newPassword);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      subscribedOTTs: true,
      totalWatchMinutes: true
    }
  });
}

module.exports = { updateUserProfile };
