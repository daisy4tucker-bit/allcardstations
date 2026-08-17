import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import giftCardRoutes from './giftCardRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import recipientRoutes from './recipientRoutes.js';
import supportRoutes from './supportRoutes.js';
import adminRoutes from './adminRoutes.js';
import validationRoutes from './validationRoutes.js';
import currencyRoutes from './currencyRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/gift-cards', giftCardRoutes);
apiRouter.use('/favorites', favoriteRoutes);
apiRouter.use('/recipients', recipientRoutes);
apiRouter.use('/support', supportRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/validation', validationRoutes);
apiRouter.use('/currency', currencyRoutes);

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    phase: 2,
    service: 'AllCardStation REST API',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
