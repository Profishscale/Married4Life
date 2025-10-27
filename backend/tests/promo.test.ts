/**
 * Unit Tests for Promo Code System
 * 
 * Run with: npm test
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { promoService } from '../src/services/promoService';
import { pool } from '../../database/init';

describe('Promo Code System', () => {
  const testCode = 'TEST2024';
  const testUserId = '1';

  beforeEach(async () => {
    // Clean up test data
    await pool.query(`DELETE FROM user_promo_redeems WHERE user_id = $1`, [parseInt(testUserId)]);
    await pool.query(`DELETE FROM promo_codes WHERE code = $1`, [testCode]);
  });

  describe('Promo Code Validation', () => {
    it('should validate and redeem a valid promo code', async () => {
      // Create a test promo code
      await pool.query(
        `INSERT INTO promo_codes (code, plan_type, max_uses, is_active)
         VALUES ($1, 'pro', 10, true)`,
        [testCode]
      );

      const result = await promoService.validatePromoCode(testCode, testUserId);

      expect(result.valid).toBe(true);
      expect(result.planType).toBe('pro');
      expect(result.expiresAt).toBeDefined();
    });

    it('should reject an invalid promo code', async () => {
      const result = await promoService.validatePromoCode('INVALID-CODE', testUserId);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should reject an expired promo code', async () => {
      // Create expired promo code
      await pool.query(
        `INSERT INTO promo_codes (code, plan_type, expires_at, is_active)
         VALUES ($1, 'pro', CURRENT_TIMESTAMP - INTERVAL '1 day', true)`,
        [testCode]
      );

      const result = await promoService.validatePromoCode(testCode, testUserId);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject a code that reached max uses', async () => {
      // Create code with max uses reached
      await pool.query(
        `INSERT INTO promo_codes (code, plan_type, max_uses, current_uses, is_active)
         VALUES ($1, 'pro', 1, 1, true)`,
        [testCode]
      );

      const result = await promoService.validatePromoCode(testCode, testUserId);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('maximum uses');
    });

    it('should prevent duplicate redemption by same user', async () => {
      // Create promo code
      await pool.query(
        `INSERT INTO promo_codes (code, plan_type, max_uses, is_active)
         VALUES ($1, 'pro', 10, true)`,
        [testCode]
      );

      // First redemption
      const firstResult = await promoService.validatePromoCode(testCode, testUserId);
      expect(firstResult.valid).toBe(true);

      // Second redemption should return already redeemed
      const secondResult = await promoService.validatePromoCode(testCode, testUserId);
      expect(secondResult.valid).toBe(true);
      expect(secondResult.message).toContain('Already redeemed');
    });
  });

  describe('Promo Access Checking', () => {
    it('should return false for user without promo access', async () => {
      const access = await promoService.checkUserPromoAccess(testUserId);

      expect(access.hasAccess).toBe(false);
    });

    it('should return true for user with valid promo access', async () => {
      // Create and redeem promo code
      await pool.query(
        `INSERT INTO promo_codes (code, plan_type, max_uses, is_active)
         VALUES ($1, 'pro', 10, true)`,
        [testCode]
      );

      await promoService.validatePromoCode(testCode, testUserId);

      const access = await promoService.checkUserPromoAccess(testUserId);

      expect(access.hasAccess).toBe(true);
      expect(access.planType).toBe('pro');
    });
  });
});

// Run tests: npm test

