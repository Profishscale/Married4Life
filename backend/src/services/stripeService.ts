import Stripe from 'stripe';
import { config } from '../config';
import { pool } from '../../database/init';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripe.secretKey) {
      console.warn('⚠️  Stripe secret key not configured');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2024-08-20.acacia',
      });
    }
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(data: {
    userId: string;
    priceId: string;
    planType: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ sessionId: string; url: string }> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      // Get or create Stripe customer
      let customerId = await this.getStripeCustomerId(data.userId);

      if (!customerId) {
        const user = await pool.query(
          `SELECT email, first_name FROM users WHERE id = $1`,
          [parseInt(data.userId)]
        );

        if (user.rows.length === 0) {
          throw new Error('User not found');
        }

        const customer = await this.stripe.customers.create({
          email: user.rows[0].email,
          name: user.rows[0].first_name,
          metadata: {
            userId: data.userId,
          },
        });

        customerId = customer.id;

        // Store customer ID
        await pool.query(
          `INSERT INTO stripe_subscriptions (user_id, stripe_customer_id, plan_type, status)
           VALUES ($1, $2, $3, 'pending')
           ON CONFLICT (stripe_customer_id) DO NOTHING`,
          [parseInt(data.userId), customerId, data.planType]
        );
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          planType: data.planType,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.warn('No userId in subscription metadata');
      return;
    }

    await pool.query(
      `UPDATE stripe_subscriptions 
       SET status = $1, stripe_subscription_id = $2, stripe_price_id = $3,
           current_period_start = $4, current_period_end = $5, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6`,
      [
        subscription.status,
        subscription.id,
        subscription.items.data[0].price.id,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        parseInt(userId),
      ]
    );

    // Update user subscription tier
    const planType = subscription.metadata?.planType || 'plus';
    await pool.query(
      `UPDATE users SET subscription_tier = $1 WHERE id = $2`,
      [planType, parseInt(userId)]
    );
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    
    if (!userId) return;

    await pool.query(
      `UPDATE stripe_subscriptions 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [parseInt(userId)]
    );

    // Reset user to free tier
    await pool.query(
      `UPDATE users SET subscription_tier = 'free' WHERE id = $1`,
      [parseInt(userId)]
    );
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    
    const result = await pool.query(
      `SELECT user_id FROM stripe_subscriptions WHERE stripe_customer_id = $1`,
      [customerId]
    );

    if (result.rows.length > 0) {
      const userId = result.rows[0].user_id;
      // Send notification to user about failed payment
      console.log(`Payment failed for user ${userId}`);
    }
  }

  private async getStripeCustomerId(userId: string): Promise<string | null> {
    try {
      const result = await pool.query(
        `SELECT stripe_customer_id FROM stripe_subscriptions WHERE user_id = $1`,
        [parseInt(userId)]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].stripe_customer_id;
    } catch (error) {
      console.error('Error getting Stripe customer ID:', error);
      return null;
    }
  }
}

export const stripeService = new StripeService();

