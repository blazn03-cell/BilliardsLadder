const Stripe = require('stripe');
require('dotenv').config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
    const eventPayload = {
        id: 'evt_test_12345',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id: 'pi_test_12345',
                object: 'payment_intent',
                amount: 5000,
                currency: 'usd',
                status: 'succeeded',
                metadata: { type: 'charity_donation' }
            }
        }
    };

    const payload = JSON.stringify(eventPayload);
    const sig = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET,
        timestamp: Math.floor(Date.now() / 1000)
    });

    const res = await fetch('http://127.0.0.1:5000/api/stripe/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': sig
        },
        body: payload
    });

    console.log('status', res.status);
    console.log(await res.text());
})();
