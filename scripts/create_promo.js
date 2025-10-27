/**
 * Create Promo Code Script
 * 
 * DEV/PROTOTYPE ONLY - For creating test promo codes
 * 
 * Usage: node scripts/create_promo.js <code> <plan_type> [max_uses] [description]
 * 
 * Examples:
 *   node scripts/create_promo.js TEST2024 pro 100 "Testing code"
 *   node scripts/create_promo.js FULLACCESS-DEV-2025 pro_max 999 "Full access for dev"
 *   node scripts/create_promo.js PROTOTYPE-365 pro 365 "1 year prototype access"
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createPromoCode() {
  console.log('🔓 DEV/PROTOTYPE: Create Promo Code\n');
  console.warn('⚠️  WARNING: This is for testing only. Remove before production!\n');

  const args = process.argv.slice(2);
  
  let code, planType, maxUses, description;

  if (args.length >= 2) {
    // Command line arguments provided
    code = args[0];
    planType = args[1];
    maxUses = args[2] ? parseInt(args[2]) : undefined;
    description = args[3] || undefined;
  } else {
    // Interactive mode
    code = await question('Enter promo code: ');
    planType = await question('Enter plan type (plus/pro/pro_max): ');
    const maxUsesStr = await question('Enter max uses (or press Enter for unlimited): ');
    maxUses = maxUsesStr ? parseInt(maxUsesStr) : undefined;
    description = await question('Enter description (optional): ');
  }

  if (!code || !planType) {
    console.error('Error: Code and plan type are required');
    process.exit(1);
  }

  const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
  
  console.log(`\nCreating promo code via API: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code.toUpperCase(),
        planType,
        maxUses,
        description,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('\n✅ Promo code created successfully!');
      console.log('\nDetails:');
      console.log(`  Code: ${code.toUpperCase()}`);
      console.log(`  Plan Type: ${planType}`);
      console.log(`  Max Uses: ${maxUses || 'Unlimited'}`);
      console.log(`  Description: ${description || 'None'}`);
      
      if (data.warning) {
        console.log(`\n⚠️  ${data.warning}`);
      }
    } else {
      console.error('\n❌ Failed to create promo code:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error creating promo code:', error.message);
    console.error('\nMake sure the backend server is running on', API_BASE_URL);
    process.exit(1);
  }

  rl.close();
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

createPromoCode().catch(console.error);

