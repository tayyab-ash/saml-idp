import { config as loadEnv } from 'dotenv';
import path from 'path';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';

loadEnv({ path: path.resolve(__dirname, '../.env'), override: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isAdmin: true },
    create: {
      email,
      passwordHash,
      isAdmin: true,
      firstName: 'IdP',
      lastName: 'Admin',
      username: 'IdP Admin',
    },
  });

  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      issuer: process.env.ISSUER || 'urn:example:idp',
      acsUrl: process.env.ACS_URL || 'http://localhost:4000/acs',
      audience: process.env.AUDIENCE || 'urn:example:sp',
      serviceProviderId: process.env.AUDIENCE || 'urn:example:sp',
      relayState: '',
      authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
