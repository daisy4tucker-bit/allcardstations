import 'dotenv/config';
import express from 'express';
import apiRouter from '../backend/src/routes/index.js';
import { errorHandler } from '../backend/src/middleware/errorHandler.js';
import { runMigrations } from '../backend/src/database/migrate.js';
import { seedDatabase } from '../backend/src/database/seed.js';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let initialized = false;
app.use(async (req, res, next) => {
  if (!initialized) {
    try {
      await runMigrations();
      await seedDatabase();
      initialized = true;
    } catch (err) {
      console.warn('Initialization notice:', err);
      initialized = true;
    }
  }
  next();
});

// Route handling for both /api prefix and direct mounts on Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use(errorHandler);

export default app;
