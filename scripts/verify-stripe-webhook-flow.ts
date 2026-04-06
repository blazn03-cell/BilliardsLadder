import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import Stripe from 'stripe';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '../server/config/db';
import {
    membershipSubscriptions,
    players,
    users,
    webhookEvents,
} from '../shared/schema';

const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5000'
    : (process.env.APP_BASE_URL || 'http://127.0.0.1:5000');

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const runId = Date.now().toString();
const userId = randomUUID();
const playerId = randomUUID();
const email = `stripe-webhook-test+${runId}@example.com`;
const playerName = `Stripe Webhook Test ${runId}`;
const customerId = `cus_webhook_test_${runId}`;
const subscriptionId = `sub_webhook_test_${runId}`;
const createdEventId = `evt_webhook_created_${runId}`;
const checkoutEventId = `evt_webhook_checkout_${runId}`;

async function insertTestData() {
    console.log('Inserting disposable user/player records...');

    await db.insert(users).values({
        id: userId,
        email,
        name: playerName,
        globalRole: 'PLAYER',
        role: 'player',
        onboardingComplete: false,
    });

    await db.insert(players).values({
        id: playerId,
        userId,
        name: playerName,
        city: 'Test City',
        member: false,
        rating: 500,
        points: 800,
        membershipTier: 'none',
    });
}

async function cleanupTestData() {
    console.log('Cleaning up disposable test records...');

    await db.delete(webhookEvents).where(inArray(webhookEvents.stripeEventId, [createdEventId, checkoutEventId]));
    await db.delete(membershipSubscriptions).where(eq(membershipSubscriptions.playerId, playerId));
    await db.delete(players).where(eq(players.id, playerId));
    await db.delete(users).where(eq(users.id, userId));
}

async function sendWebhook(eventId: string, eventType: string, object: unknown) {
    console.log(`Posting ${eventType} to ${baseUrl}/api/stripe/webhook ...`);

    const payload = JSON.stringify({
        id: eventId,
        object: 'event',
        api_version: '2024-06-20',
        created: Math.floor(Date.now() / 1000),
        type: eventType,
        data: { object },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

    const response = await fetch(`${baseUrl}/api/stripe/webhook`, {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': signature,
        },
        body: payload,
    });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(`Webhook ${eventType} failed with ${response.status}: ${responseText}`);
    }
}

async function fetchVerificationState() {
    console.log('Reading player row...');
    const playerRows = await db.select({
        id: players.id,
        userId: players.userId,
        member: players.member,
    }).from(players).where(eq(players.id, playerId));

    console.log('Reading membership subscription row...');
    const subscriptionRows = await db.select({
        playerId: membershipSubscriptions.playerId,
        tier: membershipSubscriptions.tier,
        status: membershipSubscriptions.status,
        stripeSubscriptionId: membershipSubscriptions.stripeSubscriptionId,
        stripeCustomerId: membershipSubscriptions.stripeCustomerId,
        monthlyPrice: membershipSubscriptions.monthlyPrice,
    }).from(membershipSubscriptions).where(eq(membershipSubscriptions.playerId, playerId));

    console.log('Reading webhook event rows...');
    const webhookRows = await db.select({
        stripeEventId: webhookEvents.stripeEventId,
        eventType: webhookEvents.eventType,
    }).from(webhookEvents).where(inArray(webhookEvents.stripeEventId, [createdEventId, checkoutEventId]));

    return {
        player: playerRows[0],
        subscription: subscriptionRows[0],
        webhookEvents: webhookRows,
    };
}

function assertVerificationState(state: Awaited<ReturnType<typeof fetchVerificationState>>) {
    if (!state.player) {
        throw new Error('Player row missing after webhook test');
    }

    if (state.player.member !== true) {
        throw new Error(`Expected player.member=true, got ${state.player.member}`);
    }

    if (!state.subscription) {
        throw new Error('Membership subscription row missing after webhook test');
    }

    if (state.subscription.playerId !== playerId) {
        throw new Error(`Subscription playerId mismatch: ${state.subscription.playerId}`);
    }

    if (state.subscription.tier !== 'basic') {
        throw new Error(`Expected subscription tier basic, got ${state.subscription.tier}`);
    }

    if (state.subscription.status !== 'active') {
        throw new Error(`Expected subscription status active, got ${state.subscription.status}`);
    }

    if (state.subscription.stripeSubscriptionId !== subscriptionId) {
        throw new Error(`Unexpected subscription id ${state.subscription.stripeSubscriptionId}`);
    }

    if (state.webhookEvents.length !== 2) {
        throw new Error(`Expected 2 webhook events, got ${state.webhookEvents.length}`);
    }
}

async function main() {
    console.log(`Verifying webhook flow against ${baseUrl} ...`);

    try {
        await cleanupTestData();
        await insertTestData();

        const currentPeriodStart = Math.floor(Date.now() / 1000);
        const currentPeriodEnd = currentPeriodStart + 30 * 24 * 60 * 60;

        await sendWebhook(createdEventId, 'customer.subscription.created', {
            id: subscriptionId,
            object: 'subscription',
            customer: customerId,
            status: 'active',
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            metadata: {
                userId,
                tier: 'basic',
            },
            items: {
                data: [
                    {
                        price: {
                            unit_amount: 2500,
                        },
                    },
                ],
            },
        });

        await sendWebhook(checkoutEventId, 'checkout.session.completed', {
            id: `cs_webhook_test_${runId}`,
            object: 'checkout.session',
            mode: 'subscription',
            client_reference_id: userId,
            customer: customerId,
            subscription: subscriptionId,
            metadata: {
                userId,
                tier: 'basic',
                type: 'player_subscription',
            },
        });

        const verificationState = await fetchVerificationState();
        assertVerificationState(verificationState);

        console.log(JSON.stringify({
            ok: true,
            baseUrl,
            userId,
            playerId,
            subscriptionId,
            verificationState,
        }, null, 2));
    } finally {
        if (process.env.KEEP_WEBHOOK_TEST_DATA !== '1') {
            await cleanupTestData();
        }
    }
}

main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
});