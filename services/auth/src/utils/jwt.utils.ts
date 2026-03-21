import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// We check that the secret is set
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

export const generateToken = (userId: number, email: string, role: string) => {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
