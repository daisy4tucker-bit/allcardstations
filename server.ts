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
  const PORT = 3000;

  // Trust proxy for reverse proxy environments (Google Cloud Run / Nginx / Load Balancer)
  app.set('trust proxy', 1);

  // HTTPS & Domain Canonical Enforcement Middleware (Redirect *.onrender.com -> allcardstatus.com, HTTP -> HTTPS)
  app.use((req, res, next) => {
    if (req.path === '/api/health' || req.path === '/health' || req.path.startsWith('/zohoverify')) return next();
    
    const host = (req.headers.host || '').toLowerCase();
    
    // SEO Safeguard: If visited via default *.onrender.com domain, 301 redirect permanently to main domain
    if (host.includes('onrender.com')) {
      return res.redirect(301, `https://allcardstatus.com${req.originalUrl || req.url}`);
    }

    // Check proto header from reverse proxy or load balancer
    const proto = req.headers['x-forwarded-proto'];
    if (process.env.NODE_ENV === 'production' && proto && proto !== 'https') {
      const targetHost = host || 'allcardstatus.com';
      return res.redirect(301, `https://${targetHost}${req.url}`);
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
        const rootPath = path.join(process.cwd(), 'sitemap.xml');
        const fallbackPath = fs.existsSync(rootPath) ? rootPath : path.join(process.cwd(), 'public', 'sitemap.xml');
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
      const rootPath = path.join(process.cwd(), 'sitemap.xml');
      const sitemapPath = fs.existsSync(rootPath) ? rootPath : path.join(process.cwd(), 'public', 'sitemap.xml');
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

  // Zoho Domain Verification HTML Route
  app.get('/zohoverify/verifyforzoho.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('03029839');
  });

  // Static asset serving from public directory (og-image.png, favicon, robots, sitemap, cards)
  app.use(
    express.static(path.join(process.cwd(), 'public'), {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        }
      },
    })
  );

  // Helper to extract base URL from incoming request
  const getBaseUrl = (req: express.Request): string => {
    const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'allcardstatus.com';
    const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
    return `${proto}://${host}`;
  };

  interface PageMeta {
    title: string;
    description: string;
    image: string;
    url: string;
  }

  // Resolve dynamic metadata based on path
  const resolvePageMeta = async (pathname: string, baseUrl: string): Promise<PageMeta> => {
    const defaultMeta: PageMeta = {
      title: 'AllCardStatus – Digital Gift Card Marketplace & Check Card Status',
      description: 'Buy, send, and check your gift card status for Apple, Steam, Amazon, PlayStation, Xbox, and top global brands with instant email delivery and secure checkout.',
      image: `${baseUrl}/og-image.png?v=4`,
      url: `${baseUrl}${pathname === '/' ? '' : pathname}`,
    };

    if (pathname.startsWith('/gift-cards/')) {
      const slug = pathname.replace('/gift-cards/', '').split('/')[0].split('?')[0];
      if (slug) {
        try {
          const card = await prisma.giftCard.findUnique({
            where: { slug },
            select: { name: true, description: true, image: true, startingPrice: true, currency: true },
          });
          if (card) {
            return {
              title: `${card.name} – Instant Digital Delivery | AllCardStatus`,
              description: `Buy ${card.name} digital gift cards starting at ${card.currency} ${card.startingPrice}. Instant email delivery and verified claim codes. ${card.description}`,
              image: card.image && card.image.startsWith('http') ? card.image : `${baseUrl}/og-image.png`,
              url: `${baseUrl}/gift-cards/${slug}`,
            };
          }
        } catch {
          // Fallback to default
        }
      }
    } else if (pathname === '/gift-cards') {
      return {
        title: 'Buy Digital Gift Cards Online – Instant Delivery | AllCardStatus',
        description: 'Explore authentic digital gift cards for Apple, Steam, Amazon, PlayStation, Xbox, and 24+ global brands with instant code delivery & secure payment.',
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/gift-cards`,
      };
    } else if (pathname === '/validate') {
      return {
        title: 'Check Gift Card Balance & Code Authenticity | AllCardStatus',
        description: 'Securely check digital claim codes, verify balances, and validate gift cards instantly with official brand verification.',
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/validate`,
      };
    } else if (pathname === '/how-it-works') {
      return {
        title: 'How It Works – Instant Digital Gift Cards | AllCardStatus',
        description: 'Learn how to buy, customize, pay with crypto or card, and instantly receive verified digital gift cards in 4 simple steps.',
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/how-it-works`,
      };
    } else if (pathname === '/faq') {
      return {
        title: 'Frequently Asked Questions – Help & Support | AllCardStatus',
        description: 'Common questions and answers regarding gift card codes, redemption, crypto checkout, and balance validation security.',
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/faq`,
      };
    } else if (pathname === '/about') {
      return {
        title: 'About AllCardStatus – Trusted Digital Gift Card Marketplace',
        description: "Learn about AllCardStatus's mission to provide secure, instant, and frictionless digital gift card transactions worldwide.",
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/about`,
      };
    } else if (pathname === '/contact') {
      return {
        title: 'Contact Support – 24/7 Assistance | AllCardStatus',
        description: 'Get in touch with AllCardStatus support for help with digital gift card purchases, verification, and code redemption.',
        image: `${baseUrl}/og-image.png`,
        url: `${baseUrl}/contact`,
      };
    }

    return defaultMeta;
  };

  // Inject metadata into raw index.html
  const injectMeta = (html: string, meta: PageMeta): string => {
    const escapeAttr = (str: string) =>
      str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let result = html;
    result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
    result = result.replace(
      /<meta name="description" content=".*?" \/>/i,
      `<meta name="description" content="${escapeAttr(meta.description)}" />`
    );
    result = result.replace(
      /<meta property="og:title" content=".*?" \/>/i,
      `<meta property="og:title" content="${escapeAttr(meta.title)}" />`
    );
    result = result.replace(
      /<meta property="og:description" content=".*?" \/>/i,
      `<meta property="og:description" content="${escapeAttr(meta.description)}" />`
    );
    result = result.replace(
      /<meta property="og:url" content=".*?" \/>/i,
      `<meta property="og:url" content="${escapeAttr(meta.url)}" />`
    );
    result = result.replace(
      /<meta property="og:image" content=".*?" \/>/i,
      `<meta property="og:image" content="${escapeAttr(meta.image)}" />`
    );
    result = result.replace(
      /<meta property="og:image:secure_url" content=".*?" \/>/i,
      `<meta property="og:image:secure_url" content="${escapeAttr(meta.image)}" />`
    );
    result = result.replace(
      /<meta property="og:image:alt" content=".*?" \/>/i,
      `<meta property="og:image:alt" content="${escapeAttr(meta.title)}" />`
    );
    result = result.replace(
      /<meta name="twitter:title" content=".*?" \/>/i,
      `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`
    );
    result = result.replace(
      /<meta name="twitter:description" content=".*?" \/>/i,
      `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`
    );
    result = result.replace(
      /<meta name="twitter:image" content=".*?" \/>/i,
      `<meta name="twitter:image" content="${escapeAttr(meta.image)}" />`
    );
    result = result.replace(
      /<meta name="twitter:image:alt" content=".*?" \/>/i,
      `<meta name="twitter:image:alt" content="${escapeAttr(meta.title)}" />`
    );
    result = result.replace(
      /<link rel="canonical" href=".*?" \/>/i,
      `<link rel="canonical" href="${escapeAttr(meta.url)}" />`
    );

    return result;
  };

  // Social crawler detector (WhatsApp, iMessage, Facebook, Twitter, Telegram, Discord, etc.)
  const SOCIAL_CRAWLERS =
    /facebookexternalhit|whatsapp|twitterbot|applebot|telegrambot|slackbot|discordbot|linkedinbot|pinterest|skypeuripreview|googlebot|bingbot/i;

  // Central Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for development & static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Intercept social crawlers in development mode to provide full OpenGraph tags
    app.use(async (req, res, next) => {
      const userAgent = req.headers['user-agent'] || '';
      const isCrawler = SOCIAL_CRAWLERS.test(userAgent);
      const isHtmlRoute =
        req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.includes('.') &&
        (isCrawler || req.query.crawler === '1' || req.query.og === '1');

      if (isHtmlRoute) {
        try {
          const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          const transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
          const baseUrl = getBaseUrl(req);
          const meta = await resolvePageMeta(req.path, baseUrl);
          const finalHtml = injectMeta(transformedHtml, meta);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(finalHtml);
        } catch (err) {
          return next(err);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      try {
        const rawHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        const baseUrl = getBaseUrl(req);
        const meta = await resolvePageMeta(req.path, baseUrl);
        const finalHtml = injectMeta(rawHtml, meta);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(finalHtml);
      } catch {
        res.sendFile(path.join(distPath, 'index.html'));
      }
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
