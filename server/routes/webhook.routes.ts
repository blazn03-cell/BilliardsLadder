import express from "express";
import { storage } from "../storage";
import { stripeWebhookHandler } from "../controllers/financial.controller";

export function registerWebhookRoutes(app: express.Express) {
    // Register Stripe webhook endpoint with raw body required for signature verification
    app.post(
        "/api/stripe/webhook",
        express.raw({ type: 'application/json' }),
        stripeWebhookHandler(storage)
    );
}
