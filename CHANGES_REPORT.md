# BilliardsLadder — 4-Day Changes Report
**Period:** April 13 – April 16, 2026

---

## Executive Summary

Over the past four days, the platform shipped two major systems — **email verification** and a complete **ban / suspension / appeal pipeline** — plus several quality and billing fixes. The result is a much safer, more accountable platform: every new account must prove their email, bad actors can be removed cleanly, and removed users have a fair, in-app way to plead their case.

---

## April 13 — Operator Billing Fixes

### Operator subscription checkout fixed
Operator subscriptions were silently failing to create after Stripe checkout completed. The webhook flow has been corrected so operator hall subscriptions (Small, Medium, Large, Mega tiers) now provision correctly after payment.

### Operator tier card design polish
The operator subscription tier cards were restyled to visually match the player tier cards — same layout, spacing, and badge treatment — so the upgrade experience feels consistent across the site.

---

## April 15 — Email Infrastructure & Verification

### SendGrid integrated as the email provider
The platform moved off of generic SMTP and onto SendGrid's API (`@sendgrid/mail`). Emails now send through a verified single sender (`osiraogene@gmail.com`) with proper branding. This is the foundation every other notification in the system runs on top of (verification, bans, appeals, etc.).

### Email verification for new accounts
New signups can no longer use the platform until they confirm they own their email address.

- After signup, users see an inline "Check Your Email" screen instead of being dumped into the app
- A verification link is sent with a 24-hour expiry token
- Clicking the link verifies the account and lets them log in
- Unverified users who try to log in are blocked with a clear message and a "Resend email" option
- OAuth (Replit) sign-ins are auto-verified since their email is already confirmed by the provider
- Owner and Staff accounts bypass verification

A critical bug was caught and fixed during this work: the user-save helper was stripping out the new verification fields before they hit the database. That's been corrected so verification status actually persists.

### Landing page login link
A "Already have an account? Let's log you back in" link was added under the signup cards on the landing page so returning users have an obvious path back in. The signup page header was also corrected to "Join BilliardsLadder."

### Sender address polish
The default outgoing email address was tightened up so all system emails come from a single, recognizable address.

---

## April 16 — Ban, Suspension & Appeal System (the big one)

### Backend: account status enforcement
The user model gained four new fields — `banReason`, `bannedAt`, `bannedBy`, and `banExpiresAt` — and an `accountStatus` of "active", "suspended", "banned", or "pending."

New admin endpoints:
- `POST /api/admin/users/:id/ban` — permanent ban with required reason
- `POST /api/admin/users/:id/suspend` — temporary suspension with expiry date
- `POST /api/admin/users/:id/unban` — reinstate any banned or suspended user
- `GET /api/admin/bans` — list all currently banned/suspended users
- `GET /api/admin/users` — full user list for admin management

### Security: middleware ordering done right
Every protected route now checks in this exact order:
1. Is the user logged in? → 401 if not
2. Is the account in good standing? → 403 with the ban reason if not
3. Does the user have the right role? → 403 if not

This is consistent across both the password-auth middleware and the OAuth middleware — no information leaks about whether an account exists vs. is banned.

### Login gate
- Banned users see "Your account has been banned" with the specific reason
- Suspended users see the suspension reason **and** the expiry date
- Suspensions that have passed their expiry auto-reactivate the account on login
- Owner accounts are protected — they cannot be banned or suspended

### Email notifications for moderation actions
When an admin bans, suspends, or reinstates someone, the affected user gets a branded email explaining what happened and (for suspensions) when access will be restored.

### Admin Dashboard: Users & Bans tab
A new admin tab with two views:

- **All Users** — searchable list (by name, email, role) showing every user with their role badge and status badge. Ban and suspend buttons live here.
- **Banned / Suspended** — filtered view of just the disciplined accounts, showing the reason, ban date, expiry (for suspensions), and a one-click Reinstate button.

The ban dialog requires a reason (button stays disabled until one is entered) and exposes an expiry date picker for suspensions.

### Appeal/dispute system
After the core ban system was confirmed working, the appeal pipeline was added so removed users have a fair, in-app way to contest decisions.

**For the user:**
- The login screen detects the ban/suspension and shows a dedicated notification screen
- The screen displays the reason, the type of action (ban vs. suspension), and an expiry date if applicable
- Users can submit an appeal with a reason and supporting context
- They can check the status of their existing appeal directly from this screen — pending, approved, or denied
- If denied, they can see the admin's response and submit a new appeal

**For the admin:**
- A new **Appeals** tab in the admin dashboard
- Filter by pending or all appeals
- Each appeal shows the user's identity, current account status, their reason, their supporting context, and timestamps
- Review dialog lets the admin write a response and either approve (auto-reinstates the account) or deny
- Only one pending appeal allowed per user at a time

### Appeal data persistence
Appeals are stored in a proper PostgreSQL table (`ban_appeals`) with indexes, not in-memory — they survive server restarts and back-end deploys.

### Appeal security
- Appeal submission tokens are HMAC-signed with a 30-minute expiry to prevent impersonation
- IP-based rate limiting (5 requests per 15 minutes) on the public appeal endpoint
- Strict input validation (reason capped at 2,000 chars, supporting context at 5,000)
- The user's identity is derived server-side from the signed token — never trusted from client input

---

## Operational / Infrastructure Notes

### Post-merge automation
The project's post-merge setup script was updated to automatically install dependencies and push database schema changes when task agents merge work in. This kept the rapid ship cadence smooth across the multiple ban-system tasks merged on April 16.

### Documentation
`replit.md` was expanded with dedicated sections for the email verification system and the ban/suspension/appeal system so future work has a clear reference point.

---

## What's Live and Working Right Now

- ✅ New users must verify their email before logging in
- ✅ Returning users have a clear path from the landing page back to login
- ✅ Operator subscription checkout creates accounts properly
- ✅ Admins can ban or suspend any non-Owner user with a reason
- ✅ Banned/suspended users see a clear, branded notification at login
- ✅ Suspended accounts auto-reactivate when their suspension expires
- ✅ Affected users receive email notifications for all moderation actions
- ✅ Banned users can submit an appeal directly from the login screen
- ✅ Admins can review, approve (auto-reinstate), or deny appeals
- ✅ All appeal data persists in the database

---

## Known Items to Watch

- **SendGrid emails currently land in spam.** This is normal until DNS domain authentication is set up on the sending domain. SPF/DKIM records will fix it.
- **Auth rate limit is set to 30 attempts** for testing convenience. Should be lowered to 5 before public launch.
- **Three duplicate Stripe webhook handler registrations** exist in the routes file (only the first executes). Worth cleaning up but not a functional problem.
