import { pool } from '../../../database/init';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  planType: string;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
}

export interface PromoRedemption {
  id: string;
  userId: string;
  promoCodeId: string;
  planType: string;
  redeemedAt: Date;
  expiresAt?: Date;
}

export class PromoService {
  /**
   * Validate a promo code
   */
  async validatePromoCode(code: string, userId: string): Promise<{
    valid: boolean;
    planType?: string;
    expiresAt?: Date;
    message?: string;
  }> {
    try {
      // Check if promo code exists
      const promoResult = await pool.query(
        `SELECT * FROM promo_codes 
         WHERE code = $1 AND is_active = true`,
        [code.toUpperCase()]
      );

      if (promoResult.rows.length === 0) {
        return {
          valid: false,
          message: 'Promo code not found or inactive',
        };
      }

      const promo = promoResult.rows[0];

      // Check if expired
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return {
          valid: false,
          message: 'Promo code has expired',
        };
      }

      // Check max uses
      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        return {
          valid: false,
          message: 'Promo code has reached maximum uses',
        };
      }

      // Check if user already redeemed this code
      const redemptionResult = await pool.query(
        `SELECT * FROM user_promo_redeems 
         WHERE user_id = $1 AND promo_code_id = $2`,
        [parseInt(userId), promo.id]
      );

      if (redemptionResult.rows.length > 0) {
        const redemption = redemptionResult.rows[0];
        
        // Check if redemption is still valid (if expires_at set)
        if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
          return {
            valid: false,
            message: 'Your promo access has expired',
          };
        }

        // Already redeemed and still valid
        return {
          valid: true,
          planType: redemption.plan_type,
          expiresAt: redemption.expires_at,
          message: 'Already redeemed',
        };
      }

      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

      // Create redemption
      await pool.query(
        `INSERT INTO user_promo_redeems 
         (user_id, promo_code_id, plan_type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [parseInt(userId), promo.id, promo.plan_type, expiresAt]
      );

      // Update current uses
      await pool.query(
        `UPDATE promo_codes 
         SET current_uses = current_uses + 1
         WHERE id = $1`,
        [promo.id]
      );

      return {
        valid: true,
        planType: promo.plan_type,
        expiresAt,
        message: `Successfully redeemed! Plan: ${promo.plan_type}`,
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        message: 'Error validating promo code',
      };
    }
  }

  /**
   * Check if user has valid promo access
   */
  async checkUserPromoAccess(userId: string): Promise<{
    hasAccess: boolean;
    planType?: string;
    expiresAt?: Date;
  }> {
    try {
      const result = await pool.query(
        `SELECT plan_type, expires_at
         FROM user_promo_redeems
         WHERE user_id = $1
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
         ORDER BY redeemed_at DESC
         LIMIT 1`,
        [parseInt(userId)]
      );

      if (result.rows.length === 0) {
        return { hasAccess: false };
      }

      const redemption = result.rows[0];
      return {
        hasAccess: true,
        planType: redemption.plan_type,
        expiresAt: redemption.expires_at,
      };
    } catch (error) {
      console.error('Error checking promo access:', error);
      return { hasAccess: false };
    }
  }

  /**
   * Create a new promo code (DEV/PROTOTYPE ONLY)
   */
  async createPromoCode(data: {
    code: string;
    description?: string;
    planType: string;
    expiresAt?: Date;
    maxUses?: number;
  }): Promise<PromoCode> {
    try {
      const result = await pool.query(
        `INSERT INTO promo_codes (code, description, plan_type, expires_at, max_uses)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, code, description, plan_type, expires_at, max_uses, 
                   current_uses, is_active, created_at`,
        [
          data.code.toUpperCase(),
          data.description || null,
          data.planType,
          data.expiresAt || null,
          data.maxUses || null,
        ]
      );

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        code: row.code,
        description: row.description,
        planType: row.plan_type,
        expiresAt: row.expires_at,
        maxUses: row.max_uses,
        currentUses: row.current_uses,
        isActive: row.is_active,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw new Error('Failed to create promo code');
    }
  }

  /**
   * Get all promo codes (DEV/PROTOTYPE ONLY)
   */
  async getAllPromoCodes(): Promise<PromoCode[]> {
    try {
      const result = await pool.query(
        `SELECT id, code, description, plan_type, expires_at, max_uses, 
                current_uses, is_active, created_at
         FROM promo_codes
         ORDER BY created_at DESC`
      );

      return result.rows.map(row => ({
        id: row.id.toString(),
        code: row.code,
        description: row.description,
        planType: row.plan_type,
        expiresAt: row.expires_at,
        maxUses: row.max_uses,
        currentUses: row.current_uses,
        isActive: row.is_active,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error getting promo codes:', error);
      return [];
    }
  }

  /**
   * Revoke/delete promo code (DEV/PROTOTYPE ONLY)
   */
  async deletePromoCode(codeId: string): Promise<void> {
    try {
      await pool.query(
        `DELETE FROM promo_codes WHERE id = $1`,
        [parseInt(codeId)]
      );
    } catch (error) {
      console.error('Error deleting promo code:', error);
      throw new Error('Failed to delete promo code');
    }
  }
}

export const promoService = new PromoService();

