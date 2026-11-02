const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cinecircle_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainTextPassword, salt);
}

async function verifyPassword(plainTextPassword, passwordHash) {
  return bcrypt.compare(plainTextPassword, passwordHash);
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateAccessToken
};
