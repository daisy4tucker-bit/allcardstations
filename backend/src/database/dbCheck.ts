import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function check() {
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
  const rawUrl = process.env.DATABASE_URL || '';
  const masked = rawUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('DATABASE_URL format:', masked);

  const pool = new Pool({ connectionString: rawUrl, connectionTimeoutMillis: 5000 });
  try {
    const res = await pool.query('SELECT NOW(), current_database(), current_user;');
    console.log('PG Pool Connection SUCCESS:', res.rows[0]);
    await pool.end();
  } catch (err: any) {
    console.error('PG Pool Connection ERROR:', err.message);
  }
}

check();
