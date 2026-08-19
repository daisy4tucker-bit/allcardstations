import { Router, Request, Response } from 'express';
import { submitPaymentProof, getAllOrders, updateOrderStatus } from '../services/orderService.js';
import { optionalAuth, authenticateUser, requireRole } from '../middleware/authMiddleware.js';
import { Role } from '../models/types.js';

const router = Router();

/**
 * Public/Customer endpoint: Submit payment proof (TX Hash + screenshot) for an order during checkout.
 */
router.post('/payment-proof', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      cardName,
      amount,
      currency,
      customerEmail,
      cryptoCurrency,
      cryptoAmount,
      walletAddress,
      txHash,
      receiptImage,
    } = req.body;

    if (!cardName || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields: cardName and amount are required.',
      });
    }

    const orderRecord = await submitPaymentProof({
      orderId,
      cardName,
      amount,
      currency,
      customerEmail: customerEmail || (req as any).user?.email,
      cryptoCurrency,
      cryptoAmount,
      walletAddress,
      txHash,
      receiptImage,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully! Instant notification delivered to Admin.',
      data: orderRecord,
    });
  } catch (error: any) {
    console.error('[Order Routes] Error in payment-proof submission:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment proof submission.',
    });
  }
});

/**
 * Admin endpoint: Fetch all orders and payment proof submissions.
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch orders.',
    });
  }
});

/**
 * Admin endpoint: Update payment status of an order (e.g. PAID, FAILED, CONFIRMING).
 */
router.patch('/:id/status', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
