#!/usr/bin/env node

import Stripe from 'stripe';
import 'dotenv/config';

const requiredEvents = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_failed',
    'customer.subscription.trial_will_end',
];

function normalizeBaseUrl() {
    const appBaseUrl = process.env.APP_BASE_URL?.trim();
    if (appBaseUrl) {
        return appBaseUrl.replace(/\/+$/, '');
    }

    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
    if (replitDomain) {
        const cleaned = replitDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
        return `https://${cleaned}`;
    }

    return null;
}

async function main() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not set.');
    }

    const baseUrl = normalizeBaseUrl();
    if (!baseUrl) {
        throw new Error('APP_BASE_URL or REPLIT_DOMAINS must be set to configure webhook URL.');
    }

    const webhookUrl = `${baseUrl}/api/stripe/webhook`;
    const stripe = new Stripe(secretKey);

    console.log(`Target webhook URL: ${webhookUrl}`);
    console.log('Ensuring required Stripe events are configured...');

    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const existing = endpoints.data.find((endpoint) => endpoint.url === webhookUrl);

    if (existing) {
        await stripe.webhookEndpoints.update(existing.id, {
            enabled_events: requiredEvents,
            disabled: false,
        });

        console.log(`Updated existing endpoint: ${existing.id}`);
        console.log('Required events are now enabled.');
        console.log('Note: Stripe only reveals signing secret at creation time.');
        return;
    }

    const created = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: requiredEvents,
    });

    console.log(`Created endpoint: ${created.id}`);
    console.log(`Signing secret: ${created.secret}`);
    console.log('Add this secret to STRIPE_WEBHOOK_SECRET in your deployment secrets.');
}

main().catch((error) => {
    console.error('Webhook setup failed:', error.message);
    process.exit(1);
});
