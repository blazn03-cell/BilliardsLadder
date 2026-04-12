require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

stripe.customers.create({
    email: 'test@example.com',
    name: 'Test User'
}).then(c => {
    console.log('customer', c.id);
    process.exit(0);
}).catch(e => {
    console.error('err', e.message || e);
    process.exit(1);
});
