import bcrypt from 'bcrypt';

import prisma from '../db/client';

const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_NAME = 'Administrator';

export const ensureAdminUser = async (): Promise<void> => {
  const email = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME;
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
    update: {
      password: hashedPassword,
      name,
      role: 'admin',
    },
  });
};
