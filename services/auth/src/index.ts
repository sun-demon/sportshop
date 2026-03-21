import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import prisma from './db/client'
import authRoutes from './routes/auth.routes';

// ==================== ENVIRONMENT ====================
dotenv.config();

// ==================== VALIDATION ====================
// Checking required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ FATAL ERROR: ${envVar} is not defined in .env`);
    process.exit(1);
  }
}

// Warning if JWT_SECRET is too simple
if (process.env.JWT_SECRET === 'your-secret-key-here') {
  console.warn('⚠️ WARNING: JWT_SECRET is using default value. Generate a real secret with:');
  console.warn('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

// ==================== APP SETUP ====================
const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================
// The limit for registration and login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // maximum of 10 attempts
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});


app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/auth', authLimiter);

// ==================== ROUTES ====================
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth' });
});

// ==================== SERVER ====================
const server = app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  // Closing the HTTP server
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Closing the connection to the database
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected');
    
    process.exit(0);
  });
  
  // If it is not closed after 5 seconds, it is forced
  setTimeout(() => {
    console.error('⚠️ Forced shutdown');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
