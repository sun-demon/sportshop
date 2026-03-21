import { Request, Response } from 'express';
import { createUser, findUserByEmail, validatePassword } from '../services/auth.service';
import { generateToken } from '../utils/jwt.utils';
import { VALIDATION } from '../constants/validation.constants';

// Auxiliary validation functions
const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL.REGEX.test(email);
};

const isValidPassword = (password: string): boolean => {
  return VALIDATION.PASSWORD.REGEX.test(password);
};

export const register = async (req: Request, res: Response) => {
  try {
    let { email, password, name } = req.body;

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
    
    // Token generation
    const token = generateToken(user.id, user.email, user.role);
    
    // We are not sending the password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error); // logging for ourselves
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    // Checking for required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email length limitation (protection against attacks)
    if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
      return res.status(400).json({ message: 'Invalid email format' }); // we do not specify the reason
    }
    
    // We do NOT limit the length of the password in the login
    // (or we limit it reasonably, for example 1000, so as not to consume memory)
    if (password.length > VALIDATION.LOGIN.MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Sanitation of email
    email = email.toLowerCase().trim();
    
    // Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    
    // User search
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Password verification
    const isValid = await validatePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Token generation
    const token = generateToken(user.id, user.email, user.role);
    
    // We are not sending the password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Authorization error:', error); // logging for ourselves
    res.status(500).json({ message: 'Login failed' });
  }
};
