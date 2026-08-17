import 'dotenv/config';
import path from 'path';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

const defaultDbPath = `file:${path.resolve(process.cwd(), 'dev.db')}`;

let dbUrl = process.env.DATABASE_URL;
let authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

// If DATABASE_URL is not provided, is Postgres, is an HTTP/HTTPS endpoint without token, or is not a valid LibSQL URL with token, use local SQLite file
if (
  !dbUrl ||
  dbUrl.startsWith('postgres') ||
  dbUrl.includes('supabase.co') ||
  (!dbUrl.startsWith('file:') && !dbUrl.startsWith('libsql:')) ||
  (dbUrl.startsWith('libsql:') && !authToken) ||
  (dbUrl.startsWith('http') && !authToken)
) {
  dbUrl = defaultDbPath;
  authToken = undefined;
  process.env.DATABASE_URL = 'file:./dev.db';
}

const adapter = new PrismaLibSql({
  url: dbUrl,
  ...(authToken ? { authToken } : {}),
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const pool = {
  totalCount: 1,
  idleCount: 1,
  waitingCount: 0,
  query: async () => ({ rows: [] }),
  end: async () => {},
};

export default prisma;

