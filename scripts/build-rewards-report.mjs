import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak } from "docx";
import fs from "fs";

const ACCENT = "C8102E";
const DARK = "111111";
const MUTED = "555555";
const SOFT_BG = "F4F4F4";
const HEAD_BG = "1A1A1A";

const T = (text, opts = {}) => new TextRun({ text, font: "Calibri", size: opts.size ?? 22, bold: opts.bold, italics: opts.italics, color: opts.color ?? DARK });
const P = (children, opts = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], spacing: { after: 120, ...opts.spacing }, alignment: opts.alignment });

const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: "Calibri", size: 36, bold: true, color: ACCENT })] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 140 }, children: [new TextRun({ text, font: "Calibri", size: 28, bold: true, color: DARK })] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: DARK })] });

const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [T(text)] });
const para = (text) => P(T(text));
const labelLine = (label, body) => P([T(label + " ", { bold: true, color: ACCENT }), T(body)]);

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: HEAD_BG, color: "auto" },
      margins: { top: 120, bottom: 120, left: 140, right: 140 },
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Calibri", size: 22, bold: true, color: "FFFFFF" })] })],
    })),
  });
  const dataRows = rows.map((r, i) => new TableRow({
    children: r.map(c => new TableCell({
      shading: i % 2 === 1 ? { type: ShadingType.CLEAR, fill: SOFT_BG, color: "auto" } : undefined,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({ children: [T(String(c))] })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "EEEEEE" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "EEEEEE" },
    },
  });
}

const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: "BILLIARDS LADDER", font: "Calibri", size: 28, bold: true, color: MUTED, characterSpacing: 80 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: "Rewards & Streaks", font: "Calibri", size: 72, bold: true, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: "A plain-English plan to make the app stickier", font: "Calibri", size: 28, italics: true, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Prepared for the BilliardsLadder team", font: "Calibri", size: 22, color: MUTED })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "April 2026", font: "Calibri", size: 22, color: MUTED })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const body = [
  H1("The Big Picture"),
  para("Right now, players sign up, play matches, and either come back or they don't. There's no system pulling them back day after day. This plan adds two things that are proven to work in nearly every successful gaming app: a points system and a daily streak. Together, they give players a reason to log in every day, even if they're not ready to play a match."),
  para("Think of it like an airline frequent flyer program. The miles aren't real money — but people change their behavior to earn them. We do the same thing, just for a billiards community."),

  H1("What's Already Built"),
  para("Good news: most of the plumbing already exists. The app already tracks streaks, gives out small rewards, runs a $50 weekly prize drawing, and even hands out free subscription months to top training-ladder players. What's missing is a single, visible reward currency that ties it all together — something players can see grow, brag about, and spend on stuff they actually want."),

  H1("The Plan: Two Currencies, Side by Side"),
  H3("Real Money Wallet (already exists)"),
  bullet("Real cash, in cents."),
  bullet("Earned by winning real-money matches."),
  bullet("Can be cashed out (where banking rules allow)."),
  bullet("Stays exactly as it is today — no changes."),
  H3("Rack Points (the new piece)"),
  bullet("Pure points. Not money. Not cashable."),
  bullet("Earned by being active — playing, logging in, winning, helping the community grow."),
  bullet("Spent on cool stuff: prize drawing entries, free Pro months, custom profile flair, contest discounts."),
  bullet("Like airline miles or video game XP — they have value to players, but no legal tie to dollars."),
  para("Keeping these two completely separate is the single most important rule. The moment a points system can be turned into cash 1-for-1, it becomes a regulated financial product (think money transmitter laws). By keeping Rack Points strictly for in-app perks, we avoid that whole world entirely."),

  H1("How Players Earn Rack Points"),
  para("Every action below already happens in the app — we're just rewarding it visibly."),
  makeTable(
    ["Action", "Points", "Limit"],
    [
      ["Daily login (after day 1 of streak)", "5 to 50", "Once a day"],
      ["Play your first match of the day", "25", "Once a day"],
      ["Win a match", "50", "No limit"],
      ["Beat a higher-rated opponent (upset)", "+100 bonus", "No limit"],
      ["Both players earn this on a hill-hill match", "+25 each", "No limit"],
      ["Submit your match result within an hour", "+20", "No limit"],
      ["Stream a match (operator confirms it ran)", "+200", "Up to 3 per week"],
      ["Refer a friend who plays 5 matches", "1,000", "No limit"],
      ["Enter a tournament", "+100", "No limit"],
      ["Attend a coaching session", "+75", "Up to 2 per week"],
    ]
  ),

  H1("The Streak System (the engagement engine)"),
  para("This is the real magic. When players log in on consecutive days, they build a streak. Their streak doesn't just give them a daily bonus — it multiplies every other point they earn that day. Miss a day, and the streak resets to zero."),
  para("This single mechanic is the reason apps like Duolingo, Snapchat, and BeReal have such loyal daily users. People will go out of their way to keep their streak alive."),
  makeTable(
    ["Streak day", "Multiplier on all points", "Login bonus"],
    [
      ["Day 1", "1.0x", "(start)"],
      ["Days 2-6", "1.0x", "5 points each day"],
      ["Day 7", "1.25x", "50 points + first-week badge"],
      ["Day 14", "1.5x", "100 points"],
      ["Day 30", "1.75x", "250 points + a profile frame"],
      ["Day 60", "2.0x", "500 points"],
      ["Day 100", "2.5x", "1,000 points + leaderboard flair"],
    ]
  ),
  H3("The Pro membership perk"),
  para("Pro members get one Streak Shield per month — a free pass that protects their streak if they miss a day. This is a small thing that makes a big difference: it removes the anxiety of losing months of progress, and it gives non-Pro players a real, tangible reason to upgrade."),

  H1("How Players Spend Rack Points"),
  para("Earning is only half the system. If players have nowhere to spend their points, the points become worthless and motivation collapses. Below is the menu of things they can buy. Notice that some cost the business nothing (a profile color), some cost a small amount (a Stripe coupon), and some are revenue-positive (a tournament discount that drives entries)."),
  makeTable(
    ["Reward", "Cost", "What it costs us"],
    [
      ["Entry into the weekly $50 mini-prize drawing", "500 points", "Already budgeted"],
      ["10% off a tournament entry", "1,000 points", "Drives more entries (net positive)"],
      ["1 free month of Pro membership", "10,000 points", "One Stripe coupon (already supported)"],
      ["Custom profile frame or badge", "500 to 5,000", "Zero — it's just art"],
      ["Custom callout or emoji in the match feed", "2,000 points", "Zero"],
      ["24-hour 2x point boost", "1,500 points", "Zero — encourages more play"],
      ["Challenge another player with no entry fee", "3,000 points", "Tiny — drives engagement"],
      ["Custom name color on the ladder", "5,000 points", "Zero"],
      ["Spotlight on the monthly Rack Master leaderboard", "250 points", "Zero"],
    ]
  ),
  para("The cosmetic items are the secret weapon. They cost the business nothing, give players something to grind toward, and make the platform feel personalized. This is exactly how successful free-to-play games (Fortnite, League of Legends, Call of Duty) make billions of dollars."),

  H1("What This Looks Like for the Player"),
  H3("First time"),
  para("New player signs up, plays their first match, and wins. A toast pops up: \"+75 Rack Points (50 win + 25 first-match bonus). Streak: Day 1.\" Their nav bar now shows their balance."),
  H3("A week in"),
  para("They've logged in 7 days in a row. They get a celebration animation, a first-week badge on their profile, and a permanent 1.25x multiplier on all future points until their streak breaks. Now every match win is worth 62 points instead of 50."),
  H3("A month in"),
  para("They've stockpiled 8,000 points. They spend 5,000 to enter ten weekly prize drawings. They spend 2,000 to set their name to gold on the ladder. They start eyeing the 10,000-point free Pro month."),
  H3("Three months in"),
  para("They have a 90-day streak, a 2x multiplier, two referred friends, and a top-10 spot on the monthly Rack Master leaderboard. They've never spent a dollar beyond their Pro subscription, but they log in every single day."),

  H1("What Could Go Wrong (and How We Handle It)"),
  makeTable(
    ["Risk", "How we handle it"],
    [
      ["Legal: points being seen as a financial product", "Never advertise a cash value. Marketing copy says 'earn rewards,' never 'earn $X worth.' Points cannot be transferred between accounts for cash."],
      ["Tax surprises for players", "Cosmetic redemptions create no tax event. Cash-equivalent redemptions (Pro month, prize drawings) flow through the existing payment system that already handles 1099s when needed."],
      ["Inflation: too many points, nothing to spend on", "Launch with at least 5 spending options on day one. Watch the ratio of points earned vs spent every week. Add new spending options before the imbalance grows."],
      ["Bot farming streaks", "Already have device verification in place. Cap base earnings at 500 points per day so even a perfect bot can't run away with the system."],
      ["Players losing points on account closure", "Standard terms-of-service line: promotional points have no cash value and are forfeited on account closure. This is industry standard."],
    ]
  ),

  H1("Rollout Plan"),
  H3("Phase 1 — Build the foundation (Week 1)"),
  bullet("Add the points balance and ledger to the database."),
  bullet("Wire up the earning rules behind the scenes (no UI yet)."),
  bullet("Build the streak counter and the Pro Streak Shield."),
  bullet("Give admins the ability to view and adjust balances."),
  bullet("Run silently for 2 weeks to gather real data on how fast players actually earn."),
  H3("Phase 2 — Show players what they've earned (Week 2)"),
  bullet("Points balance in the top nav bar."),
  bullet("Streak widget on the player dashboard."),
  bullet("Toast notifications after matches: '+50 Rack Points'."),
  bullet("Activity feed showing recent points earned."),
  bullet("Daily login modal that delivers the bonus."),
  H3("Phase 3 — Open the spending menu (Week 3)"),
  bullet("Redemption store page with the first 5 to 8 items."),
  bullet("Mini-prize entry can be bought with points."),
  bullet("Cosmetic items (frames, name colors, callouts) go live."),
  bullet("Pro membership month redemption goes live."),
  bullet("Monthly Rack Master leaderboard launches."),
  H3("Phase 4 — Social loops (Later)"),
  bullet("Gift points to a friend (small fee, daily cap)."),
  bullet("Squad/team pooled points."),
  bullet("Operator-sponsored bounties: 'First to 10 wins this week gets 5,000 points.'"),

  H1("How We'll Know It's Working"),
  bullet("Daily active users go up by at least 15% within 30 days of launch."),
  bullet("At least 25% of active users have a 7-day-or-longer streak within 60 days."),
  bullet("Pro subscription conversions go up — the Streak Shield is the hook."),
  bullet("The points-earned-to-points-spent ratio settles around 1-to-1. If points pile up unspent, the spending menu needs more options."),

  H1("Bottom Line"),
  para("This is a clean fit for what BilliardsLadder already has. The wallet system gives us a proven blueprint. The dual-currency approach keeps us safely out of regulatory territory. The streak multiplier is the engagement engine that turns occasional users into daily ones."),
  para("Recommended next step: build Phase 1 only, run it silently for two weeks to see how fast points actually accumulate, and use that data to size the spending menu correctly before launch."),
  para("Total estimated build time for Phases 1 through 3: about three weeks of focused work."),
];

const doc = new Document({
  creator: "BilliardsLadder",
  title: "Rewards & Streaks Plan",
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children: [...cover, ...body],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("exports/BilliardsLadder-Rewards-and-Streaks.docx", buffer);
console.log("Wrote exports/BilliardsLadder-Rewards-and-Streaks.docx", buffer.length, "bytes");
