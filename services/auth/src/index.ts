import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import prisma from './db/client';
import authRoutes from './routes/auth.routes';
import { swaggerSpec } from './swagger';
import { validateEnv, checkJwtSecret, getPort } from './config/env';
import { setupGracefulShutdown } from './utils/shutdown';

// ==================== ENVIRONMENT ====================
validateEnv();
checkJwtSecret();

// ==================== APP SETUP ====================
const app = express();
const PORT = getPort();

// ==================== RATE LIMITING ====================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== MIDDLEWARE ====================
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/auth', authLimiter);

// ==================== SWAGGER ====================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==================== ROUTES ====================
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth' });
});

// ==================== SERVER ====================
const server = app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// ==================== GRACEFUL SHUTDOWN ====================
setupGracefulShutdown(server, prisma);
