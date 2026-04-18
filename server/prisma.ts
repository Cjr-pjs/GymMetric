import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
  var __gymmetricPgPool__: Pool | undefined;
  var __gymmetricPrismaAdapter__: PrismaPg | undefined;
  var __gymmetricPrisma__: PrismaClient | undefined;
}

export function getPrisma() {
  if (globalThis.__gymmetricPrisma__) {
    return globalThis.__gymmetricPrisma__;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL nao encontrada. Configure o arquivo .env.');
  }

  const pool = globalThis.__gymmetricPgPool__ ?? new Pool({
    connectionString: databaseUrl
  });

  const adapter = globalThis.__gymmetricPrismaAdapter__ ?? new PrismaPg(pool);

  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__gymmetricPgPool__ = pool;
    globalThis.__gymmetricPrismaAdapter__ = adapter;
    globalThis.__gymmetricPrisma__ = prisma;
  }

  return prisma;
}
