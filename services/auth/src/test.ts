import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('Connected!');
  } catch (e) {
    console.error('Connection failed:', e);
  }
}

test();
