import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

export const validateEnv = (): void => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ FATAL ERROR: ${envVar} is not defined in .env`);
      process.exit(1);
    }
  }
};

export const checkJwtSecret = (): void => {
  if (process.env.JWT_SECRET === 'your-secret-key-here') {
    console.warn('⚠️ WARNING: JWT_SECRET is using default value. Generate a real secret with:');
    console.warn('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
};

export const getPort = (): number => {
  return parseInt(process.env.PORT || '3001', 10);
};
