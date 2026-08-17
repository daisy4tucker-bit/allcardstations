import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.startsWith('postgres') ||
  process.env.DATABASE_URL.includes('supabase.co') ||
  (!process.env.DATABASE_URL.startsWith('file:') &&
    !process.env.DATABASE_URL.startsWith('libsql:') &&
    !process.env.TURSO_AUTH_TOKEN &&
    !process.env.DATABASE_AUTH_TOKEN) ||
  (process.env.DATABASE_URL.startsWith('libsql:') &&
    !process.env.TURSO_AUTH_TOKEN &&
    !process.env.DATABASE_AUTH_TOKEN)
) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

export async function runMigrations() {
  console.log('🔄 Applying database schema via Prisma db push...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Database schema pushed successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Migration push failed:', error.message);
    
    // Check for SQLite corruption and attempt recovery
    const dbPath = path.resolve(process.cwd(), 'dev.db');
    if (fs.existsSync(dbPath)) {
      console.log('⚠️ Attempting recovery: resetting corrupt SQLite database file...');
      try {
        fs.unlinkSync(dbPath);
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('✅ Database schema recreated and pushed successfully after recovery!');
        return true;
      } catch (retryError: any) {
        console.error('❌ Recovery migration failed:', retryError.message);
        throw retryError;
      }
    }
    throw error;
  }
}

if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  runMigrations()
    .then(() => {
      console.log('🎉 Migration execution completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
