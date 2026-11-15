const prisma = require('../../config/prisma');
const { verifyPassword, hashPassword } = require('./auth.utils');

async function updateUserProfile(userId, { name, subscribedOTTs, currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const data = {};
  if (typeof name === 'string' && name.trim().length >= 2) data.name = name.trim();
  if (Array.isArray(subscribedOTTs)) data.subscribedOTTs = subscribedOTTs;
  if (newPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      const error = new Error('Current password does not match');
      error.statusCode = 403;
      throw error;
    }
    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }
    data.passwordHash = await hashPassword(newPassword);
  }
  return prisma.user.update({
    where: { id: userId }, data,
    select: { id: true, name: true, username: true, email: true, subscribedOTTs: true, totalWatchMinutes: true }
  });
}

module.exports = { updateUserProfile };
