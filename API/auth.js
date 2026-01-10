const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { JWT_SECRET = "super-secret-key", JWT_EXPIRES_IN = "1h" } = process.env;

// Funcții utilitare
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};