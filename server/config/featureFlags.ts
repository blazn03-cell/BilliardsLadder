/**
 * featureFlags.ts — Controls which features are live, beta, or stub.
 *
 * WHY THIS FILE EXISTS:
 *   Several routes in routes.ts returned `res.json([])` or `res.json({ message: "Coming soon" })`
 *   with no structured way to tell stubs apart from real empty results. Clients had no way to
 *   distinguish "no data" from "not implemented yet."
 *
 *   Now every stub route checks its flag and returns a 503 FEATURE_NOT_LIVE response with
 *   a machine-readable code. When you implement a feature:
 *     1. Implement the real controller
 *     2. Flip the flag to `true` here
 *     3. Remove the 503 guard from the route
 *     4. Update CLAUDE.md live/stub/beta table
 *
 * FLAGS:
 *   true  = live, route is functional
 *   false = stub, route returns 503 FEATURE_NOT_LIVE
 *   env-dependent = live only when the required env var is set
 */

export interface FeatureFlags {
  // ─── Gameplay features ────────────────────────────────────────────────────
  OBJECT_CAROM_GAMES:  boolean;  // 3-ball / carom match type
  POOLHALL_MATCHES:    boolean;  // Location-gated poolhall matches
  GAME_VOTING:         boolean;  // Spectator vote on disputed calls
  SPOT_SHOTS:          boolean;  // Spot-shot challenge mode

  // ─── Social / streaming ───────────────────────────────────────────────────
  HALL_BATTLES:        boolean;  // Pool-hall vs pool-hall team matches
  LIVE_STREAM:         boolean;  // Embedded live stream player

  // ─── AI / automation ─────────────────────────────────────────────────────
  AI_COACHING:         boolean;  // GPT-4o coaching recommendations

  // ─── Payments ────────────────────────────────────────────────────────────
  STRIPE_CHECKOUT:     boolean;  // Stripe subscription checkout
  OPERATOR_BILLING:    boolean;  // Operator Stripe Connect billing

  // ─── Admin ───────────────────────────────────────────────────────────────
  ADMIN_DISPUTES:      boolean;  // Dispute management dashboard
  ADMIN_STAFF:         boolean;  // Staff accounts management
  ADMIN_OPERATORS:     boolean;  // Operator accounts management (list + detail)
}

export const FEATURE_FLAGS: FeatureFlags = {
  // Gameplay stubs — not yet implemented
  OBJECT_CAROM_GAMES:  false,
  POOLHALL_MATCHES:    false,
  GAME_VOTING:         false,
  SPOT_SHOTS:          false,

  // Social — functional (beta)
  HALL_BATTLES:        true,
  LIVE_STREAM:         true,

  // AI — live only when API key is configured
  AI_COACHING:         !!process.env.OPENAI_API_KEY,

  // Payments — live only when Stripe is configured
  STRIPE_CHECKOUT:     !!process.env.STRIPE_SECRET_KEY,
  OPERATOR_BILLING:    !!process.env.STRIPE_SECRET_KEY,

  // Admin — disputes live, staff/operators still stub
  ADMIN_DISPUTES:      true,
  ADMIN_STAFF:         false,
  ADMIN_OPERATORS:     false,
} as const;

// ─── Helper: build a consistent 503 response for unimplemented features ───────
export interface FeatureNotLiveResponse {
  status: 503;
  body: {
    code: "FEATURE_NOT_LIVE";
    message: string;
    feature: string;
  };
}

export function featureNotLive(featureName: string): FeatureNotLiveResponse {
  return {
    status: 503,
    body: {
      code: "FEATURE_NOT_LIVE",
      message: `${featureName} is not yet available. Check back soon.`,
      feature: featureName,
    },
  };
}
