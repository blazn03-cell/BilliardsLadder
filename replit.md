# BilliardsLadder

## Overview
BilliardsLadder is a dark-themed billiards tournament ladder system designed to revolutionize competitive billiards. It integrates live streaming, secure payments, and comprehensive player support, aiming to build a vibrant community. The platform offers a robust player ranking system, a credit-based challenge pool with anti-ghosting measures, and an innovative AI billiards coach. It targets both casual and high-stakes players, fostering skill development, community interaction, and competitive play within the digital sports and entertainment sector.

## User Preferences
- **Communication Style**: Concise, professional, no emojis in code
- **Code Style**: TypeScript strict mode, functional components, proper error handling
- **Theme**: Dark mode preferred, green accent colors for billiards aesthetic

## System Architecture
The system is built on a modern web stack emphasizing performance, scalability, and a unique user experience.

### UI/UX Decisions
- **Aesthetic**: Dark, gritty green theme reflecting a pool hall atmosphere.
- **Color Scheme**: Black backgrounds with bright green (#00ff00) accents.
- **Typography**: Monospace fonts for a tech-inspired feel.
- **QR Code Join Flow**: Enables easy mobile registration.
- **Automated Poster Generator**: One-click event poster creation.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, and TanStack Query for data fetching.
- **Backend**: Express.js, utilizing in-memory storage (MemStorage) with PostgreSQL available for persistence.
- **Mobile App**: React Native with Expo, acting as a WebView wrapper for the web application, incorporating native features like camera access for OCR, push notifications, and location services.
- **Styling**: Tailwind CSS with a custom dark theme.
- **Challenge Pool System**: Features credit-based entries, wallet management, configurable challenge markets, automated resolution, and a transaction ledger, including anti-ghosting via pre-funding and tiered service fees.
- **AI Billiards Coach**: Integrates Dr. Dave's physics rules for shot analysis, providing insights on various techniques and a scoring formula for improvement with monthly leaderboards.
- **Authentication**: A three-tier system (Creator/Owner, Operator, Player) supporting password login and 2FA for Creator accounts.
- **Language Sanitization**: An automatic system replaces gambling terms with league-safe terminology via middleware and a SafeText React component.
- **Live Streaming**: Multi-platform integration (Twitch, YouTube, Facebook, TikTok, Kick) with geographic filtering and stream categories.
- **Player Ladder System**: Tracks rankings, points, wins, and losses, featuring VIP tiers (LEGEND/GOLD/SILVER/BRONZE), win rate bars, streak badges, top 3 podium, and search/sort capabilities.
- **Special Events**: Supports birthday bonuses, charity nights, and player support programs.
- **Respect Points System**: Community recognition for sportsmanship.
- **Side Betting System**: Credit-based wagering with closed-loop funds.
- **Financial Features**: Entry ranges from $60 to $500,000, with league fees at 5% for members and 15% for non-members. Membership tiers include Basic ($25/month) and Pro ($60/month).
- **Automated Rewards**: The AI Coach system includes automated monthly rewards for top trainers, offering Stripe subscription discounts.

## External Dependencies
- **Payment Processing**: Stripe (Checkout Sessions API for one-time payments, subscriptions, and webhooks).
- **Streaming Platforms**: Twitch, YouTube, Facebook, TikTok, Kick (for live streaming integration).
- **Email Notifications**: SendGrid (for admin summaries and notifications).
- **OCR**: tesseract.js (for optical character recognition).
- **Database**: PostgreSQL (available as an option for persistent data).