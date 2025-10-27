import express, { Request, Response } from 'express';
import { promoService } from '../services/promoService';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const validateSchema = z.object({
  code: z.string(),
  userId: z.string(),
});

const createSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  planType: z.string(),
  expiresAt: z.string().optional(),
  maxUses: z.number().optional(),
});

// POST /redeem - Redeem promo code (matches spec)
router.post('/redeem', async (req: Request, res: Response) => {
  // TODO: Add auth middleware
  // const userId = req.user.id;
  
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and userId',
      });
    }

    const result = await promoService.validatePromoCode(code, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error redeeming promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem promo code',
    });
  }
});

// POST /validate - Validate promo code (alias for backward compat)
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const validated = validateSchema.parse(req.body);
    const result = await promoService.validatePromoCode(
      validated.code,
      validated.userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate promo code',
    });
  }
});

// GET /check/:userId - Check user's promo access
router.get('/check/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const access = await promoService.checkUserPromoAccess(userId);

    res.json({
      success: true,
      data: access,
    });
  } catch (error) {
    console.error('Error checking promo access:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check promo access',
    });
  }
});

// POST /admin/promo - Create promo code (DEV/PROTOTYPE ONLY)
router.post('/admin/promo', async (req: Request, res: Response) => {
  // TODO: Add admin authentication check here
  try {
    // In production, add authentication check here
    console.warn('⚠️  DEV/PROTOTYPE: Creating promo code');

    const validated = createSchema.parse(req.body);

    const promoCode = await promoService.createPromoCode({
      code: validated.code,
      description: validated.description,
      planType: validated.planType,
      maxUses: validated.maxUses,
    });

    res.json({
      success: true,
      data: promoCode,
      warning: 'DEV/PROTOTYPE ONLY',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Error creating promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create promo code',
    });
  }
});

// DEV/PROTOTYPE ONLY - Get all promo codes
router.get('/', async (req: Request, res: Response) => {
  try {
    // In production, add authentication check here
    console.warn('⚠️  DEV/PROTOTYPE: Getting all promo codes');

    const codes = await promoService.getAllPromoCodes();

    res.json({
      success: true,
      data: codes,
      warning: 'DEV/PROTOTYPE ONLY',
    });
  } catch (error) {
    console.error('Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get promo codes',
    });
  }
});

// DEV/PROTOTYPE ONLY - Delete promo code
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // In production, add authentication check here
    console.warn('⚠️  DEV/PROTOTYPE: Deleting promo code');

    const { id } = req.params;
    await promoService.deletePromoCode(id);

    res.json({
      success: true,
      message: 'Promo code deleted',
      warning: 'DEV/PROTOTYPE ONLY',
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete promo code',
    });
  }
});

export default router;

