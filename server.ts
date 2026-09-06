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
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/routes/index.js';
import { errorHandler } from './backend/src/middleware/errorHandler.js';
import { runMigrations } from './backend/src/database/migrate.js';
import { seedDatabase } from './backend/src/database/seed.js';
import { prisma } from './backend/src/database/prisma.js';

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
    if (req.path === '/api/health' || req.path === '/health') return next();
    // Check proto header from reverse proxy or load balancer
    const proto = req.headers['x-forwarded-proto'];
    if (process.env.NODE_ENV === 'production' && proto && proto !== 'https') {
      const host = req.headers.host || 'allcardstatus.com';
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

  // Search Engine & Sitemap Endpoints (Dynamic Sitemap Generator with fallback)
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const staticPages = [
        { loc: 'https://allcardstatus.com/', changefreq: 'daily', priority: '1.0' },
        { loc: 'https://allcardstatus.com/gift-cards', changefreq: 'daily', priority: '0.9' },
        { loc: 'https://allcardstatus.com/validate', changefreq: 'daily', priority: '0.9' },
        { loc: 'https://allcardstatus.com/how-it-works', changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://allcardstatus.com/about', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://allcardstatus.com/faq', changefreq: 'weekly', priority: '0.8' },
        { loc: 'https://allcardstatus.com/contact', changefreq: 'monthly', priority: '0.8' },
        { loc: 'https://allcardstatus.com/sitemap', changefreq: 'weekly', priority: '0.7' },
        { loc: 'https://allcardstatus.com/legal', changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://allcardstatus.com/privacy', changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://allcardstatus.com/terms', changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://allcardstatus.com/security', changefreq: 'monthly', priority: '0.7' },
        { loc: 'https://allcardstatus.com/compliance', changefreq: 'monthly', priority: '0.7' },
      ];

      let cardSlugs: string[] = [];
      try {
        const cards = await prisma.giftCard.findMany({
          where: { available: true },
          select: { slug: true, updatedAt: true },
          orderBy: { name: 'asc' },
        });
        cardSlugs = cards.map((c) => c.slug);
      } catch {
        // Database not ready, proceed to static fallback
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
      xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
      xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
      xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n\n`;

      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      if (cardSlugs.length > 0) {
        for (const slug of cardSlugs) {
          xml += `  <url>\n    <loc>https://allcardstatus.com/gift-cards/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
        }
      } else {
        const fallbackPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        if (fs.existsSync(fallbackPath)) {
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          return res.sendFile(fallbackPath);
        }
      }

      xml += `</urlset>\n`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(xml);
    } catch {
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.sendFile(sitemapPath);
    }
  });

  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
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
    console.log(`🚀 AllCardStatus Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
