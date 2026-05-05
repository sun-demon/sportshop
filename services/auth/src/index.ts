import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import prisma from './db/client';
import authRoutes from './routes/auth.routes';
import { swaggerSpec } from './config/swagger';
import { validateEnv, checkJwtSecret, getPort } from './config/env';
import { setupGracefulShutdown } from './utils/shutdown';
import { ensureAdminUser } from './utils/bootstrap';

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
// Limit only mutation-heavy auth endpoints; /auth/me should stay responsive.
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/refresh', authLimiter);

// ==================== SWAGGER ====================
app.get('/api-docs/json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ==================== ROUTES ====================
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth' });
});

// ==================== SERVER ====================
async function startServer() {
  await ensureAdminUser();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Auth service running on port ${PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
  setupGracefulShutdown(server, prisma);
}

startServer().catch((error) => {
  console.error('❌ Failed to start auth service:', error);
  process.exit(1);
});
