import { Router } from 'express';
import { getLiveRates, convertCurrency } from '../controllers/currencyController.js';

const router = Router();

// GET /api/currency/rates - Real-time forex and crypto rates with caching
router.get('/rates', getLiveRates);

// GET /api/currency/convert?amount=100&from=USD&to=EUR - Fast conversion endpoint
router.get('/convert', convertCurrency);

export default router;
