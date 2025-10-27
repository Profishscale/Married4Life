/**
 * Seed Promo Codes for Testing
 * 
 * DEV/PROTOTYPE ONLY - Seeds test promo codes
 * 
 * Usage: node scripts/seed_promo_codes.js
 */

const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

const testCodes = [
  {
    code: 'FULLACCESS-DEV-2025',
    planType: 'pro_max',
    description: 'Full access for development and testing',
    maxUses: 999,
  },
  {
    code: 'PROTOTYPE-365',
    planType: 'pro',
    description: 'Prototype access for 1 year',
    maxUses: 999,
  },
  {
    code: 'TEST-PLUS',
    planType: 'plus',
    description: 'Testing Plus tier features',
    maxUses: 100,
  },
  {
    code: 'HAPPY-2024',
    planType: 'pro',
    description: 'Special promo code',
    maxUses: 50,
  },
];

async function seedPromoCodes() {
  console.log('🌱 Seeding Test Promo Codes\n');
  console.warn('⚠️  WARNING: DEV/PROTOTYPE ONLY\n');

  const results = [];

  for (const promoCode of testCodes) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/promo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promoCode),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Created: ${promoCode.code} (${promoCode.planType})`);
        results.push({ code: promoCode.code, success: true });
      } else {
        console.log(`⚠️  ${promoCode.code}: ${data.error || 'Already exists?'}`);
        results.push({ code: promoCode.code, success: false });
      }
    } catch (error) {
      console.error(`❌ Error creating ${promoCode.code}:`, error.message);
      results.push({ code: promoCode.code, success: false });
    }
  }

  console.log('\n📊 Summary:');
  const successCount = results.filter(r => r.success).length;
  console.log(`  Created: ${successCount}/${testCodes.length}`);
  
  console.log('\n🎁 Test Codes Available:');
  testCodes.forEach(code => {
    console.log(`  - ${code.code} → ${code.planType}`);
  });

  console.log('\n⚠️  Remember: Remove promo system before production!');
}

seedPromoCodes().catch(console.error);

