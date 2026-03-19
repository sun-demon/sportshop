import { Request, Response } from 'express';
import { createUser, findUserByEmail, validatePassword } from '../services/auth.service';
import { generateToken } from '../utils/jwt.utils';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Проверка, существует ли пользователь
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Создание пользователя
    const user = await createUser(email, password, name);
    
    // Генерация токена
    const token = generateToken(user.id, user.email, user.role);
    
    // Не отправляем пароль
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Поиск пользователя
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Проверка пароля
    const isValid = await validatePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Генерация токена
    const token = generateToken(user.id, user.email, user.role);
    
    // Не отправляем пароль
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};
