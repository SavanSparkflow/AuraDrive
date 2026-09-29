const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'auradrive_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = generateToken;
