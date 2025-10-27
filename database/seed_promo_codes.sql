-- Seed Promo Codes for Testing
-- DEV/PROTOTYPE ONLY - Remove before production!

-- Insert test promo codes
INSERT INTO promo_codes (code, description, plan_type, max_uses, is_active)
VALUES 
  ('FULLACCESS-DEV-2025', 'Full access for development and testing', 'pro_max', 999, true),
  ('PROTOTYPE-365', 'Prototype access for 1 year', 'pro', 999, true),
  ('TEST-PLUS', 'Testing Plus tier features', 'plus', 100, true),
  ('HAPPY-2024', 'Special promo code', 'pro', 50, true),
  ('FREETRIAL', 'Free trial access', 'pro', 100, true)
ON CONFLICT (code) DO NOTHING;

-- Display created codes
SELECT code, plan_type, max_uses, current_uses, is_active
FROM promo_codes
ORDER BY created_at DESC;

