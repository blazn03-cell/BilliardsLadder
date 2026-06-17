#!/usr/bin/env node

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setupWebhook() {
    console.log('🔧 Stripe Webhook Setup Tool\n');

    // Get webhook URL from user
    const webhookUrl = await prompt(
        'Enter your Replit preview webhook URL (e.g., https://your-repl.replit.dev/api/stripe/webhook): '
    );

    if (!webhookUrl || !webhookUrl.startsWith('https://')) {
        console.error('❌ Invalid URL. Must start with https://');
        rl.close();
        process.exit(1);
    }

    // Events to listen for
    const events = [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.paid',
        'invoice.payment_failed',
        'customer.subscription.trial_will_end',
    ];

    console.log('\n📋 Events to configure:');
    events.forEach((event) => console.log(`  ✓ ${event}`));

    const confirmSetup = await prompt(
        '\nProceed with setting up webhook? (yes/no): '
    );

    if (confirmSetup.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        rl.close();
        process.exit(0);
    }

    try {
        console.log('\n🔄 Creating webhook endpoint...');

        // Create the webhook endpoint
        const endpoint = await stripe.webhookEndpoints.create({
            url: webhookUrl,
            enabled_events: events,
            api_version: '2023-10-16',
        });

        console.log('\n✅ Webhook created successfully!\n');
        console.log(`Endpoint ID: ${endpoint.id}`);
        console.log(`Signing Secret: ${endpoint.secret}`);
        console.log(`Status: ${endpoint.status}`);
        console.log(`URL: ${endpoint.url}`);

        console.log('\n📝 Add this to your .env file:');
        console.log(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);

        console.log('\n✨ Webhook is now active and ready for testing!');
        console.log('Events configured:', endpoint.enabled_events.length);

        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating webhook:', error.message);
        rl.close();
        process.exit(1);
    }
}

setupWebhook();
