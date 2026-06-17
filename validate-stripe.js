#!/usr/bin/env node

// Stripe Price ID Validator
// Checks if all required price IDs exist in your Stripe account

import Stripe from 'stripe';

const requiredPriceIds = {
    player_subscriptions: {
        PLAYER_ROOKIE_MONTHLY_PRICE_ID: 'price_1THmhwDvTG8XWAaKP5IdXAic',
        PLAYER_STANDARD_MONTHLY_PRICE_ID: 'price_1THmi0DvTG8XWAaKGZwVO8WR',
        PLAYER_PREMIUM_MONTHLY_PRICE_ID: 'price_1THmi2DvTG8XWAaKpyx6VNyR',
    },
    operator_subscriptions: {
        SMALL_PRICE_ID: 'price_1THmiLDvTG8XWAaKhXE4JvZq',
        MEDIUM_PRICE_ID: 'price_1THmiPDvTG8XWAaKkeveuEqq',
        LARGE_PRICE_ID: 'price_1THmiRDvTG8XWAaK39Gg3Nb9',
        MEGA_PRICE_ID: 'price_1THmiUDvTG8XWAaKa43Y9Bm9',
    }
};

async function validateStripeIds() {
    console.log('🔍 Validating Stripe Price IDs\n');

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
        console.error('❌ ERROR: STRIPE_SECRET_KEY not set in .env');
        process.exit(1);
    }

    const stripe = new Stripe(stripeKey);

    let allValid = true;
    let passed = 0;
    let failed = 0;

    // Test Player Subscriptions
    console.log('📱 Player Subscriptions\n');
    for (const [envVar, priceId] of Object.entries(requiredPriceIds.player_subscriptions)) {
        try {
            const price = await stripe.prices.retrieve(priceId);
            console.log(`✅ ${envVar}`);
            console.log(`   Price ID: ${priceId}`);
            console.log(`   Product: ${price.product}`);
            console.log(`   Amount: $${(price.unit_amount / 100).toFixed(2)}`);
            console.log(`   Currency: ${price.currency.toUpperCase()}`);
            console.log(`   Recurring: ${price.recurring?.interval || 'one-time'}\n`);
            passed++;
        } catch (error) {
            console.log(`❌ ${envVar}`);
            console.log(`   Price ID: ${priceId}`);
            console.log(`   Error: ${error.message}\n`);
            failed++;
            allValid = false;
        }
    }

    // Test Operator Subscriptions
    console.log('🏢 Operator Subscriptions\n');
    for (const [envVar, priceId] of Object.entries(requiredPriceIds.operator_subscriptions)) {
        try {
            const price = await stripe.prices.retrieve(priceId);
            console.log(`✅ ${envVar}`);
            console.log(`   Price ID: ${priceId}`);
            console.log(`   Product: ${price.product}`);
            console.log(`   Amount: $${(price.unit_amount / 100).toFixed(2)}`);
            console.log(`   Currency: ${price.currency.toUpperCase()}\n`);
            passed++;
        } catch (error) {
            console.log(`❌ ${envVar}`);
            console.log(`   Price ID: ${priceId}`);
            console.log(`   Error: ${error.message}\n`);
            failed++;
            allValid = false;
        }
    }

    // Summary
    console.log('📊 Summary\n');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);

    if (allValid) {
        console.log('✅ All price IDs are valid and active in Stripe!\n');
        console.log('🎉 Ready for production deployment!\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some price IDs are missing or invalid.\n');
        console.log('Next steps:');
        console.log('1. Create missing products in Stripe Dashboard');
        console.log('2. Copy the correct price IDs');
        console.log('3. Update .env with the correct IDs');
        console.log('4. Run this script again to verify\n');
        process.exit(1);
    }
}

validateStripeIds().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
});