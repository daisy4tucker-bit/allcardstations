import 'dotenv/config';
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
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/routes/index.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';
import { runMigrations } from './backend/src/database/migrate.js';
import { seedDatabase } from './backend/src/database/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Run database migrations and seeding on boot
  try {
    await runMigrations();
    await seedDatabase();
  } catch (err) {
    console.error('Database migration/seed warning on boot:', err);
  }

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Trust proxy for reverse proxy environments (Google Cloud Run / Nginx / Load Balancer)
  app.set('trust proxy', 1);

  // HTTPS Enforcement Middleware (Redirect HTTP -> HTTPS in production)
  app.use((req, res, next) => {
    // Check proto header from reverse proxy or load balancer
    const proto = req.headers['x-forwarded-proto'];
    if (process.env.NODE_ENV === 'production' && proto && proto !== 'https') {
      const host = req.headers.host || 'allcardvault.com';
      return res.redirect(301, `https://${host}${req.url}`);
    }
    next();
  });

  // Strict SSL & Transport Security Headers
  app.use((req, res, next) => {
    // HSTS (HTTP Strict Transport Security) - enforce HTTPS for 2 years + subdomains + preload
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // Prevent MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Cross-site scripting filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Feature permissions policy
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
    next();
  });

  // JSON request body parser
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Request logger in development
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // Search Engine & Sitemap Endpoints
  app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(sitemapPath);
  });

  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(robotsPath);
  });

  // Central Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for development & static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global fallback error handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AllCardVault Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
