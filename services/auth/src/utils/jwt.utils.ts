import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || process.env.JWT_SECRET;

// We check that the secret is set
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

if (!REFRESH_SECRET) {
  console.error('FATAL ERROR: REFRESH_SECRET is not defined');
  process.exit(1);
}

// Access Token (15 minutes)
export const generateToken = (userId: number, email: string, role: string) => {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Refresh Token (7 days)
export const generateRefreshToken = (userId: number) => {
  return jwt.sign(
    { id: userId },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
