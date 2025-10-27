import express, { Request, Response } from 'express';
import { stripeService } from '../services/stripeService';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const createSessionSchema = z.object({
  userId: z.string(),
  priceId: z.string(),
  planType: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

// POST /create-session - Create Stripe checkout session
router.post('/create-session', async (req: Request, res: Response) => {
  try {
    const validated = createSessionSchema.parse(req.body);

    const session = await stripeService.createCheckoutSession({
      userId: validated.userId,
      priceId: validated.priceId,
      planType: validated.planType,
      successUrl: validated.successUrl,
      cancelUrl: validated.cancelUrl,
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
    });
  }
});

// POST /webhook - Handle Stripe webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'No signature',
      });
    }

    const stripe = stripeService['stripe'];
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: 'Stripe not configured',
      });
    }

    // Verify webhook
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle event
    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
});

export default router;

