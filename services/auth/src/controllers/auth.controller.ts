import { Request, Response } from 'express';
import type { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse
} from '@sportshop/shared-types';

import { VALIDATION } from '../constants/validation.constants';
import { 
  createUser, 
  findUserByEmail,
  findUserById,
  validatePassword,
  toIUser,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  updateUserProfile,
  updateUserPassword
} from '../services/auth.service';
import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken } from '../utils/jwt.utils';

// Auxiliary validation functions
const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL.REGEX.test(email);
};

const isValidPassword = (password: string): boolean => {
  return VALIDATION.PASSWORD.REGEX.test(password);
};

export const register = async (req: Request, res: Response) => {
  try {
    let { email, password, name } = req.body as RegisterRequest;

    // Checking for required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Length limitation
    if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
      return res.status(400).json({ message: `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters` });
    }
    
    if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
      return res.status(400).json({ message: `Password must be less than ${VALIDATION.PASSWORD.MAX_LENGTH} characters` });
    }
    
    if (name && name.length > VALIDATION.NAME.MAX_LENGTH) {
      return res.status(400).json({ message: `Name must be less than ${VALIDATION.NAME.MAX_LENGTH} characters` });
    }
    
    // Sanitation of email
    email = email.toLowerCase().trim();
    
    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters and contain both letters and numbers' 
      });
    }
    
    // Checking if the user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Creating a user
    const user = await createUser(email, password, name);
    
    // Generate tokens
    const accessToken = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await saveRefreshToken(user.id, refreshToken, expiresAt);
    
    // Response with shared-types
    const response: any = { user, accessToken, refreshToken };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body as LoginRequest;

    // Checking for required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email length limitation
    if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Reasonable limit for password in login
    if (password.length > VALIDATION.LOGIN.MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Sanitation of email
    email = email.toLowerCase().trim();
    
    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Find user with password for verification
    const userWithPassword = await findUserByEmail(email);
    if (!userWithPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Password verification
    const isValid = await validatePassword(password, userWithPassword.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Delete old refresh tokens
    await deleteAllUserRefreshTokens(userWithPassword.id);
    
    // Get public user data
    const user = toIUser(userWithPassword);
    
    // Generate tokens
    const accessToken = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await saveRefreshToken(user.id, refreshToken, expiresAt);
    
    // Response
    res.json({ user, accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    
    // Check if refresh token exists in database
    const storedToken = await findRefreshToken(refreshToken);
    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await deleteRefreshToken(refreshToken);
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    
    // Verify JWT signature
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded === 'string') {
      await deleteRefreshToken(refreshToken);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Get user
    const user = await findUserById(decoded.id);
    if (!user) {
      await deleteRefreshToken(refreshToken);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Delete old refresh token
    await deleteRefreshToken(refreshToken);
    
    // Generate new tokens
    const newAccessToken = generateToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    
    // Save new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await saveRefreshToken(user.id, newRefreshToken, expiresAt);
    
    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Refresh failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userData = await findUserByEmail(user.email);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(toIUser(userData));
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to get user info' });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: number } | undefined;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, name, password } = req.body as { email?: string; name?: string; password?: string };
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedName = typeof name === 'string' ? name.trim() : name;

    if (normalizedEmail !== undefined) {
      if (!normalizedEmail) return res.status(400).json({ message: 'Email cannot be empty' });
      if (normalizedEmail.length > VALIDATION.EMAIL.MAX_LENGTH) {
        return res.status(400).json({ message: `Email must be less than ${VALIDATION.EMAIL.MAX_LENGTH} characters` });
      }
      if (!isValidEmail(normalizedEmail)) return res.status(400).json({ message: 'Invalid email format' });
    }

    if (normalizedName !== undefined && normalizedName.length > VALIDATION.NAME.MAX_LENGTH) {
      return res.status(400).json({ message: `Name must be less than ${VALIDATION.NAME.MAX_LENGTH} characters` });
    }

    if (password !== undefined) {
      if (!password) return res.status(400).json({ message: 'Password cannot be empty' });
      if (password.length > VALIDATION.PASSWORD.MAX_LENGTH || !isValidPassword(password)) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters and contain both letters and numbers'
        });
      }
    }

    if (normalizedEmail !== undefined) {
      const existing = await findUserByEmail(normalizedEmail);
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    }

    const profileUpdateData: { email?: string; name?: string | null } = {};
    if (normalizedEmail !== undefined) profileUpdateData.email = normalizedEmail;
    if (normalizedName !== undefined) profileUpdateData.name = normalizedName || null;
    const updatedUser = await updateUserProfile(user.id, profileUpdateData);

    if (password !== undefined) {
      await updateUserPassword(user.id, password);
      await deleteAllUserRefreshTokens(user.id);
    }

    const accessToken = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);
    const refreshToken = generateRefreshToken(updatedUser.id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await saveRefreshToken(updatedUser.id, refreshToken, expiresAt);

    return res.json({ user: updatedUser, accessToken, refreshToken });
  } catch (error) {
    console.error('Update me error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const feedback = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id: number; email: string } | undefined;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { subject, message } = req.body as { subject?: string; message?: string };
    const normalizedSubject = (subject ?? '').trim();
    const normalizedMessage = (message ?? '').trim();
    if (!normalizedSubject || !normalizedMessage) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }
    if (normalizedSubject.length > 120) {
      return res.status(400).json({ message: 'Subject must be less than 120 characters' });
    }
    if (normalizedMessage.length > 2000) {
      return res.status(400).json({ message: 'Message must be less than 2000 characters' });
    }

    console.info('[developer-feedback]', {
      userId: user.id,
      userEmail: user.email,
      subject: normalizedSubject,
      message: normalizedMessage,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ message: 'Failed to send feedback' });
  }
};
