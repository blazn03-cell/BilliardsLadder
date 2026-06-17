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
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: "Rewards & Streaks", font: "Calibri", size: 64, bold: true, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "Phase 1 Starter Plan", font: "Calibri", size: 40, bold: true, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [new TextRun({ text: "A small, safe first version we can build in a few days", font: "Calibri", size: 26, italics: true, color: DARK })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Prepared for the BilliardsLadder team", font: "Calibri", size: 22, color: MUTED })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "April 2026", font: "Calibri", size: 22, color: MUTED })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const body = [
  H1("Why a Smaller First Step"),
  para("The full rewards plan is ambitious and the right long-term direction. But shipping the whole thing at once is risky: we'd be guessing how fast players actually earn, what they want to spend points on, and whether streaks actually pull people back. Starting smaller lets us launch in a few days, watch real player behavior, and use that data to size everything else correctly before we build it."),
  para("This Phase 1 plan does only what's necessary to prove the system works. Every piece is designed so the bigger plan slots in cleanly later — no rebuilds, no awkward migrations, no broken player history."),

  H1("What Phase 1 Includes"),
  para("Three things, and only three things:"),
  H3("1. Rack Points (the currency)"),
  para("Every player gets a points balance, visible in the top corner of the app. Points are earned, never bought. They are not money and cannot be cashed out. Think airline miles or video game XP."),
  H3("2. A Daily Login Streak"),
  para("If a player logs in two days in a row, that's a 2-day streak. Three days in a row, a 3-day streak. Miss a day, the streak resets to zero. The streak is shown as a number with a flame icon, like every other app that uses streaks. That's it for now — no multipliers, no shields, no badges. Just the number."),
  H3("3. Three Earn Events"),
  para("Players earn Rack Points from exactly three things in this first version:"),
  makeTable(
    ["When", "Points", "Why these three"],
    [
      ["Daily login (after first day of streak)", "10", "Anchors the streak habit"],
      ["Win a match", "50", "Rewards the core activity"],
      ["Beat a higher-rated opponent (upset)", "+50 bonus", "Adds a little drama and excitement"],
    ]
  ),
  para("That's the entire earning surface. No referrals, no streaming bonuses, no coaching credit, no daily-first-match bonus. Those all come later, and they slot in by simply adding new entries to the same earning pipeline."),

  H1("What Phase 1 Deliberately Does NOT Include"),
  para("Everything below is in the bigger plan and will come later. Cutting it now is what makes this buildable in a few days:"),
  bullet("No spending menu or store. Players can't redeem points for anything yet — they just accumulate."),
  bullet("No streak multipliers. Earnings are flat regardless of streak length."),
  bullet("No Pro Streak Shield. Miss a day, streak resets, period."),
  bullet("No cosmetics, profile frames, name colors, or callouts."),
  bullet("No referral rewards or social gifting."),
  bullet("No leaderboard."),
  bullet("No tournament discount, no free Pro month redemption."),
  bullet("No notifications or daily login modal — the points just appear quietly."),
  para("Why no spending? Because if we open spending too early — before we know how fast points actually pile up — we either price things too cheap (everyone redeems on day one and the system feels broken) or too expensive (no one bothers and the system feels pointless). Two weeks of silent data collection answers this."),

  H1("How It's Designed for the Future"),
  para("This is the most important part. Even though Phase 1 is small, we build the foundation in a way that the full plan plugs into without rework."),
  H3("The earnings pipeline is generic from day one"),
  para("Internally, every point award goes through a single function that takes (player, amount, reason). Adding 'streamed a match: +200' later is a one-line change — no architectural shift. Same goes for 'referred a friend: +1000.'"),
  H3("The streak counter is real, even though we only show the number"),
  para("We track the actual streak length in the database. When we add the 7-day badge, the 1.25x multiplier, or the Pro Shield later, the historical data is already there. Players who built a 30-day streak in Phase 1 will get full credit when those features ship."),
  H3("The points ledger is permanent"),
  para("Every points event is written to a permanent log — who, how many, what reason, when. This is the same pattern your real-money wallet already uses. When we add a redemption store later, refund handling, audit reports, or any analytics, the data is all there."),
  H3("The currency is named correctly from day one"),
  para("We call them Rack Points, not 'beta points' or 'test credits.' Players who earn points now keep them as the same Rack Points later. No rename, no migration, no confusion."),
  H3("Spending is built behind the scenes"),
  para("Even though there's no store yet, the spending function exists internally. When we open the store in a later phase, we just build the UI on top — the deduct-points-and-write-to-ledger logic is already done."),

  H1("What This Looks Like for the Player"),
  para("Player logs in. They see a small flame icon and a number in the top corner: 'Streak: 3' and 'Rack Points: 175.' That's all they see at first. No fanfare, no popup, no explanation."),
  para("They play a match and win. The number quietly ticks up to 225. They keep playing because they came here to play pool, not chase points."),
  para("Two weeks later, they notice their streak is at 14 and their balance is over 1,000. They wonder what they're for. We watch this — that's the signal that it's time to ship Phase 2 (the spending menu)."),

  H1("What We Watch For"),
  para("Phase 1 is as much a data collection exercise as a launch. The questions we want answered before we build Phase 2:"),
  bullet("How many points does an average active player earn per week?"),
  bullet("What percent of players hit a 7-day streak? A 30-day streak?"),
  bullet("Do streaks correlate with playing more matches, or just logging in more?"),
  bullet("Do players notice the points and streak at all without being told?"),
  bullet("Are there any earning paths that get gamed (e.g., one player winning 50 matches a day against the same friend)?"),
  para("Two to four weeks of this data tells us exactly how to price the spending menu, whether the streak multipliers in the full plan are too generous or not generous enough, and whether the system is doing what we hoped — pulling players back day after day."),

  H1("Build Plan (a few days of focused work)"),
  H3("Day 1: Foundation"),
  bullet("Add a 'Rack Points' balance and a 'streak' counter to player accounts."),
  bullet("Add a permanent log table for every points transaction."),
  bullet("Build the internal award function (one place, one purpose)."),
  H3("Day 2: Hook into events"),
  bullet("Award points on login if it extends the streak."),
  bullet("Award 50 points on every match win."),
  bullet("Award the +50 upset bonus when the lower-rated player wins."),
  bullet("Reset the streak to zero on any 24-hour gap."),
  H3("Day 3: Show it to players"),
  bullet("Add the streak number and points balance to the top nav bar."),
  bullet("Update both numbers in real time as events happen."),
  H3("Day 4: Admin tools and testing"),
  bullet("Admin view: see any player's balance, streak, and full earning history."),
  bullet("Admin override: manually adjust balance or streak with a reason (writes to the ledger)."),
  bullet("End-to-end testing of all three earning paths."),
  bullet("Verify that streaks reset correctly across timezone edge cases."),
  H3("Day 5 (buffer): Polish and ship"),
  bullet("Tooltip explaining what Rack Points are when a player hovers the balance."),
  bullet("Sanity test on production with a small group before opening to everyone."),

  H1("How Phase 1 Becomes Phase 2 Later"),
  para("When we're ready to expand, the path is clear and additive — no breaking changes:"),
  makeTable(
    ["Bigger plan feature", "How Phase 1 makes it easy"],
    [
      ["Streak multipliers (1.25x at day 7, etc.)", "Streak length is already tracked. Just multiply in the award function."],
      ["Pro Streak Shield", "Add a single column for 'shield used this month.' One small check before resetting."],
      ["More earning events (referrals, streaming, coaching)", "Just add new calls to the existing award function. No structural change."],
      ["Spending menu", "The deduct function already exists. Just build the store UI and connect it."],
      ["Tournament discount and Pro month redemption", "Spending menu items pointing at existing Stripe coupon flow."],
      ["Cosmetics and profile flair", "New 'inventory' table, but the points side stays the same."],
      ["Leaderboard", "Just a query against the points ledger and balance columns we already have."],
    ]
  ),

  H1("Bottom Line"),
  para("Phase 1 ships in about a week, gives us a working rewards system that costs essentially nothing to operate, and produces the data we need to confidently build the rest of the plan. Players see a clean, simple feature: a streak number and a points balance. Behind the scenes, we lay the full foundation so nothing has to be rebuilt later."),
  para("If you approve, the next step is to start the build. The first three days produce the working invisible system; the next two make it visible to players and ready for testing."),
];

const doc = new Document({
  creator: "BilliardsLadder",
  title: "Rewards & Streaks — Phase 1 Starter Plan",
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children: [...cover, ...body],
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("exports/BilliardsLadder-Rewards-Phase1-Starter.docx", buffer);
console.log("Wrote exports/BilliardsLadder-Rewards-Phase1-Starter.docx", buffer.length, "bytes");
