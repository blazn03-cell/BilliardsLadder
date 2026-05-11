import { Badge } from "@/components/ui/badge";

type Status = "live" | "hold" | "proposed";

interface RewardRow {
  name: string;
  sub?: string;
  col2: string;
  howTo: string;
  status: Status;
  legendary?: boolean;
}

interface Section {
  id: string;
  num: string;
  title: string;
  lead: string;
  col1: string;
  col2: string;
  col3: string;
  rows: RewardRow[];
  kicker?: { label: string; body: string };
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "live")
    return <Badge className="bg-green-900/40 text-green-400 border border-green-500/50 text-xs font-mono uppercase tracking-wider">Live</Badge>;
  if (status === "hold")
    return <Badge className="bg-orange-900/40 text-orange-400 border border-orange-500/50 text-xs font-mono uppercase tracking-wider">On Hold</Badge>;
  return <Badge className="bg-red-900/40 text-red-400 border border-red-500/50 text-xs font-mono uppercase tracking-wider">Proposed V2</Badge>;
}

function RewardTable({ col1, col2, col3, rows }: { col1: string; col2: string; col3: string; rows: RewardRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-green-950/60">
            <th className="text-left p-3 text-xs font-mono uppercase tracking-widest text-green-400 border-b border-green-500/20 w-1/4">{col1}</th>
            <th className="text-left p-3 text-xs font-mono uppercase tracking-widest text-green-400 border-b border-green-500/20 w-[14%]">{col2}</th>
            <th className="text-left p-3 text-xs font-mono uppercase tracking-widest text-green-400 border-b border-green-500/20">{col3}</th>
            <th className="text-left p-3 text-xs font-mono uppercase tracking-widest text-green-400 border-b border-green-500/20 w-[12%]">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
              <td className="p-3 align-top">
                <div className="font-bold text-white">{row.name}</div>
                {row.sub && (
                  <div className={`text-xs font-mono mt-0.5 tracking-wide ${row.legendary ? "text-yellow-400 font-bold" : "text-green-400"}`}>
                    {row.sub}
                  </div>
                )}
              </td>
              <td className={`p-3 align-top text-xs font-mono tracking-wide ${row.legendary ? "text-yellow-400 font-bold" : "text-green-300"}`}>
                {row.col2}
              </td>
              <td className="p-3 align-top text-gray-300 leading-relaxed text-sm">{row.howTo}</td>
              <td className="p-3 align-top"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: Section[] = [
  {
    id: "titles", num: "01", title: "Performance Titles",
    lead: "Streak-based and upset-based. Visible on profile + leaderboard while active. Reset when the streak breaks.",
    col1: "Title", col2: "Type", col3: "How To Earn",
    rows: [
      { name: "Heater", sub: "3-WIN STREAK", col2: "Streak title", howTo: "Win 3 stake matches in a row. Resets on any loss.", status: "live" },
      { name: "Predator", sub: "5-WIN STREAK", col2: "Streak title", howTo: "Win 5 stake matches in a row. Stacks on Heater. Lost on first loss.", status: "live" },
      { name: "Untouchable", sub: "7-WIN STREAK", col2: "Streak title", howTo: "Win 7 stake matches in a row. Triggers Hot Streak hall alert each match.", status: "live" },
      { name: "Assassin", sub: "10-WIN STREAK", col2: "Streak title", howTo: "Win 10 stake matches in a row. Rare. The Wall feed alerts the hall.", status: "live" },
      { name: "Legend", sub: "15-WIN STREAK", col2: "Streak title — legendary", howTo: "Win 15 stake matches in a row. The rarest active streak title on the platform.", status: "live", legendary: true },
      { name: "Sniper", sub: "UPSET · 7-DAY", col2: "Upset title — timed", howTo: "Beat an opponent ranked 10+ ladder spots above you in a stake match. Title visible for 7 days. Resets and extends on additional snipes.", status: "proposed" },
    ],
  },
  {
    id: "badges", num: "02", title: "Reputation Badges",
    lead: "Permanent achievements. Once earned, displayed forever on your profile. Some require very specific match conditions.",
    col1: "Badge", col2: "Type", col3: "How To Earn",
    rows: [
      { name: "Clutch", col2: "Achievement", howTo: "Win 3+ matches where you were down by 2+ racks at any point.", status: "live" },
      { name: "Grinder", col2: "Volume", howTo: "Play 100+ matches in a single quarter. Counts wins and losses.", status: "live" },
      { name: "Underdog Slayer", col2: "Upset volume", howTo: "Win 5 matches against opponents ranked above you in one month.", status: "live" },
      { name: "Shutout King", col2: "Rare achievement", howTo: "Win a match where your opponent scores zero racks. One match suffices.", status: "live" },
      { name: "Comeback Kid", col2: "Comeback", howTo: "Win a match after being down to match point (1 rack from losing).", status: "live" },
      { name: "Night Owl", col2: "Time-of-day", howTo: "Win 10+ matches that start after 10 PM local time.", status: "live" },
      { name: "Early Bird", col2: "Time-of-day", howTo: "Win 10+ matches that start before 11 AM local time.", status: "live" },
      { name: "Consistency Champion", col2: "Streak — earned", howTo: "Hit your weekly earnings threshold 12 weeks in a row. Comes with $100 cash bonus.", status: "live" },
      { name: "Half-Year Legend", col2: "Streak — legendary", howTo: "Hit your weekly threshold 26 weeks in a row. Comes with $220 cash + unlocks The Vault.", status: "live", legendary: true },
      { name: "Survivor [Quarter]", col2: "Rookie participation", howTo: "Play at least 5 Rookie matches each week of the quarter. Replaces the $10 'everyone else' cash bonus in V2. Permanent quarterly stamp.", status: "proposed" },
    ],
  },
  {
    id: "status", num: "03", title: "Status Drops",
    lead: "Temporary visible status on profile and leaderboard. Some last hours, some days, some week-to-week. Defend or lose them.",
    col1: "Status", col2: "Duration", col3: "How To Earn",
    rows: [
      { name: "Champion Aura", col2: "While top 5", howTo: "Be ranked top 5 in your ladder. Visible glow on the leaderboard. Lost the moment you drop below #5.", status: "live" },
      { name: "Hot Streak (active)", col2: "While streaking", howTo: "Currently on a 3+ win streak. Indicated next to your name across the app.", status: "live" },
      { name: "Hall Hot", col2: "1 Week", howTo: "Most wins at your hall this week. Visible at the hall and on the hall leaderboard. Resets every Monday.", status: "proposed" },
      { name: "City Champion of the Week", col2: "1 Week", howTo: "Most total wins ladder-wide in a week. Resets every Monday.", status: "proposed" },
      { name: "Lightning Win Badge", col2: "24 Hours", howTo: "Win a match during Lightning Hour (randomly-announced 60-minute window). Badge visible for 24 hours after the win.", status: "proposed" },
      { name: "Active Streak Shield", col2: "Until consumed", howTo: "Purchase from shop for 150 credits. Protects your streak from resetting on your next loss.", status: "live" },
      { name: "Rank Freeze (active)", col2: "48 Hours", howTo: "Purchase from shop for 250 credits. Stops rank decay for 48 hours while you're away.", status: "live" },
      { name: "3-Hour Power Window", col2: "3 Hours", howTo: "Activate 7-Day Performance Boost (purchased from shop for 1,800 credits) or earn via Morning/Evening Power Hour windows: play 7–9 AM or 7–9 PM for 1.30× multiplier.", status: "live" },
    ],
  },
  {
    id: "consistency", num: "04", title: "Consistency Cash Bonuses",
    lead: "Hit your weekly earnings threshold consistently. Cash fires automatically — no claim button, no friction.",
    col1: "Milestone", col2: "Cash", col3: "How To Earn",
    rows: [
      { name: "Week 1 Bonus", col2: "$10", howTo: "Hit your first weekly earnings threshold in your first week on a paid plan. Fires automatically.", status: "live" },
      { name: "3-Week Streak", col2: "$20", howTo: "Hit your weekly threshold 3 weeks in a row.", status: "live" },
      { name: "6-Week Streak", col2: "$50", howTo: "Hit your weekly threshold 6 weeks in a row.", status: "live" },
      { name: "12-Week Streak", col2: "$100", howTo: "Hit your weekly threshold 12 weeks in a row. Earns Consistency Champion badge.", status: "live" },
      { name: "26-Week Streak", col2: "$220", howTo: "Hit your weekly threshold 26 weeks in a row. Earns Half-Year Legend badge + unlocks The Vault draw.", status: "live", legendary: true },
    ],
    kicker: {
      label: "Earnings threshold by tier",
      body: "Basic $24.99 → $50–150/week threshold. Premium $34.99 → $50–500/week. Elite $99/mo → $50–1,000+/week. Family Plan operates at Basic-level thresholds for adults. Trial tier has no threshold (no staking allowed).",
    },
  },
  {
    id: "rookie", num: "05", title: "Rookie Cash Payouts",
    lead: "Drip during the season. Big peaks at quarter-end. Rookie cash scales with ladder size — small ladders get capped pools per the 'Under 15 players' rule.",
    col1: "Payout", col2: "Cash", col3: "How To Earn",
    rows: [
      { name: "Mid-Quarter Checkpoint", col2: "$15", howTo: "Be in top 5 of your hall's Rookie ladder at the 6-week mark. Fires twice per quarter — at week 6 and week 12.", status: "proposed" },
      { name: "Q-End: 1st Place", col2: "$500", howTo: "Most wins in your hall's Rookie ladder for the quarter. Minimum 5 wins to qualify. At small ladders (under 15 players) prize pool caps at $300 total — scaled accordingly.", status: "live", legendary: true },
      { name: "Q-End: 2nd Place", col2: "$400", howTo: "Second most wins in your hall's Rookie ladder for the quarter. Min 5 wins.", status: "live" },
      { name: "Q-End: 3rd Place", col2: "$300", howTo: "Third most wins. Min 5 wins.", status: "live" },
      { name: "Q-End: 4th Place", col2: "$200", howTo: "Fourth most wins. Min 5 wins.", status: "live" },
      { name: "Q-End: 5th Place", col2: "$100", howTo: "Fifth most wins. Min 5 wins.", status: "live" },
      { name: "Q-End: Next 25%", col2: "$50 each", howTo: "Finish in the top 6%–30% of your hall's Rookie ladder for the quarter. Min 5 wins.", status: "live" },
      { name: "Everyone Else", col2: "$0 (V2)", howTo: "V2 replaces the old $10 participation cash with the Survivor [Quarter] permanent badge — no cash, persistent status.", status: "proposed" },
    ],
  },
  {
    id: "tournaments", num: "06", title: "Tournament Prizes",
    lead: "90% of all paid tournament entry fees are returned as prizes. Added money goes on top from the platform.",
    col1: "Tournament", col2: "Prize", col3: "How To Earn",
    rows: [
      { name: "Monthly Tournament", col2: "$500 added", howTo: "Pay entry fee ($40 Rookie / $30 Basic / $20 Premium / Free–$20 Elite). Place in the prize positions.", status: "hold" },
      { name: "Quarterly Tournament", col2: "$2,000 added", howTo: "Same paid entry. Place in prize positions. On hold until 150+ active players per the upgrade doc.", status: "hold" },
      { name: "Year-End Major", col2: "$10,000 added", howTo: "Annual event. Top players across the platform earn seats. Scheduled for Month 7–12 of launch. Skill-based bracket; details TBA.", status: "hold", legendary: true },
      { name: "Rookie Quarterly Tournament", col2: "$1,500 pool", howTo: "Top 5 Rookies in the ladder at quarter-end (1st $500 / 2nd $400 / 3rd $300 / 4th $200 / 5th $100). Capped at $300 total pool for ladders under 15 players.", status: "live" },
      { name: "Family Tournament", col2: "TBA", howTo: "Dedicated event for Family Plan accounts. All ages. Format and prize structure pending confirmation.", status: "live" },
    ],
  },
  {
    id: "special", num: "07", title: "Special Games",
    lead: "Run the day before each tournament. Sign-ups close 1 hour before start. Visible in The Vault under 'Tonight & This Week.'",
    col1: "Game", col2: "Format", col3: "How To Earn",
    rows: [
      { name: "Kelly Pool", col2: "Pill draw · 15 max", howTo: "Pay buy-in (typically $25). Draw your pill. Player who pockets their assigned ball wins the pot. Up to 15 players per game.", status: "live" },
      { name: "Money Games", col2: "Various formats", howTo: "Cash games in formats including straight lag, rail-first, progressive. Win the format to win the cash. Stakes scale to player tier max.", status: "live" },
      { name: "Bounties", col2: "Runs continuously", howTo: "Cash for beating specific players or rank holders. Types: Hall Bounty (operator posts on top hall player), Champion Bounty (auto-rolling on every Champion Aura player), Player-Posted Bounty (players put credits/cash on rivals), Heater Bounty (auto-triggered at 10W streak — pot escalates with streak), Nationwide Open Bounty (platform-funded on #1, refreshed monthly). Live Bounty Wall surfaces all active bounties in the app.", status: "live" },
      { name: "Calcutta Auctions", col2: "Pari-mutuel", howTo: "Bid on tournament players before the tournament starts. Earn based on the finishing position of the player you bid on. Pari-mutuel pool distribution.", status: "live" },
      { name: "Season Predictions", col2: "Pick 3", howTo: "Before the season, pick the top 3 finishers. Payout split: 70% / 20% / 10% for correctly identifying 1st / 2nd / 3rd.", status: "live" },
    ],
  },
  {
    id: "training", num: "08", title: "Training Rewards",
    lead: "Each hall surfaces its own training leaderboard. Top trainers earn monthly rewards.",
    col1: "Reward", col2: "Value", col3: "How To Earn",
    rows: [
      { name: "Top 3 Trainer Reward", col2: "~$75 avg/hall", howTo: "Be in top 3 on your hall's training leaderboard for the month. Reward is a combination of subscription discount + cash bonus, distributed automatically via Stripe.", status: "live" },
    ],
    kicker: {
      label: "AI Coaching Sessions",
      body: "AI Coach access is included as a perk in Premium / Elite / Family Plan tiers, but the standalone 45-minute coaching session shop item is locked until the coaching system is fully built.",
    },
  },
  {
    id: "vault-backer", num: "09", title: "The Vault & The Backer",
    lead: "Ceremonial cash and credit-funded staking. The hardest reaches on the platform.",
    col1: "Reward", col2: "Value", col3: "How To Earn",
    rows: [
      { name: "The Vault Draw", col2: "$50 – $500", howTo: "Hit a 26-week consistency threshold streak. Triggers a single random draw with possible outcomes of $50, $100, $200, or $500. Average expected value ~$100. One draw per streak cycle.", status: "proposed", legendary: true },
      { name: "The Backer · $250 Match", col2: "6,000 cr → $250", howTo: "Accumulate 6,000 shop credits (earned via wins, losses, login chain, missions). Redeem for a sanctioned $250 match. Platform stakes the cash. Player keeps an agreed share of winnings; platform recovers stake plus share. Locked — release date TBA.", status: "hold" },
      { name: "The Backer · $500 Match", col2: "9,000 cr → $500", howTo: "Accumulate 9,000 shop credits. Curated opponent pool. Same settlement structure as $250 tier. Locked.", status: "hold" },
      { name: "The Backer · $1,000 Match", col2: "12,000 cr → $1,000", howTo: "Accumulate 12,000 shop credits. The hardest reward on BilliardsLadder. Platform backs a real $1,000 stake. Locked.", status: "hold", legendary: true },
    ],
  },
  {
    id: "credits", num: "10", title: "Shop Credits — Earn Rates",
    lead: "Credits power the shop, the daily ritual, and the long-term Backer climb. Earn rates are flat — wins and losses both count.",
    col1: "Action", col2: "Credits", col3: "How To Earn",
    rows: [
      { name: "Match Win", col2: "+15 cr", howTo: "Win any stake match. Flat rate. Does not reset.", status: "live" },
      { name: "Match Loss", col2: "+5 cr", howTo: "Lose any stake match. Participation credit. Raised from +3 to +5 in V2 upgrade.", status: "live" },
      { name: "30-Day Login Chain", col2: "Up to +200 cr", howTo: "Log in 30 days in a row. Daily rewards accumulate; max bonus is +200 credits at Day 30.", status: "live" },
      { name: "Loot Chest", col2: "Variable", howTo: "Every 5th match played earns a random chest: common (credits + badge), rare (more credits + Streak Shield), epic (cash drop + rare badge). V2 reweights chest contents toward credits/status, with cash on ~10% of chests.", status: "live" },
      { name: "Mystery Performance Package", col2: "+50 to +300 cr", howTo: "Spend 60 credits to open. Variable return: 50–300 credits.", status: "live" },
      { name: "Daily Missions", col2: "+30 to +130 cr", howTo: "3 new missions every day. Each worth 30–130 credits. Mission types rotate (play X matches, win Y at a hall, beat a higher-ranked player, etc.).", status: "live" },
      { name: "Promotion Match Bonus", col2: "+50 pts", howTo: "Win the match that promotes you to a new rank tier. Bonus credits + points awarded.", status: "live" },
      { name: "Champion Bounty", col2: "+120 pts", howTo: "Defeat the current #1 ranked player in your ladder. Extra points awarded.", status: "live" },
    ],
    kicker: {
      label: "Credit cashout",
      body: "Credits convert to cash at 100 credits = $1 at quarter end (Rookie ladder). Outside Rookie, credits are spent on shop items only — they don't cash out. Shop items maintain durable value: Streak Shields, Rank Freeze, and the Performance Boost extend playing days, which keeps credits in the system.",
    },
  },
  {
    id: "shop", num: "11", title: "Shop Items — Credit Cost",
    lead: "All shop items are functional, not cosmetic. Cosmetic-only items were removed in V2. Spend credits to protect progress or speed up.",
    col1: "Item", col2: "Cost", col3: "How To Earn / Use",
    rows: [
      { name: "Performance Insurance (Streak Shield)", col2: "150 cr", howTo: "Purchase from shop. Single-use. Protects your streak from resetting on your next loss.", status: "live" },
      { name: "Rank Freeze (48hr)", col2: "250 cr", howTo: "Purchase from shop. Stops rank decay for 48 hours. Critical before travel or breaks.", status: "live" },
      { name: "Mystery Performance Pack", col2: "60 cr", howTo: "Purchase from shop. Opens for 50–300 credit bonus.", status: "live" },
      { name: "7-Day Performance Boost", col2: "1,800 cr", howTo: "Purchase from shop. 1.5× points multiplier for 7 days. Game-changer for streak runs.", status: "live" },
      { name: "Tournament Entry Credit", col2: "2,200 cr", howTo: "Purchase from shop. $15 credit toward your next paid tournament entry.", status: "live" },
      { name: "1-Month Subscription Credit", col2: "2,500 cr", howTo: "Purchase from shop. Pays one full month of your subscription tier with credits.", status: "live" },
      { name: "The Callout", col2: "Earned · 7D streak", howTo: "Earned via 7-day match-completion streak. Active for 7 days. Publicly call out any player to a stake match. They have 72 hours to accept or take a -10 rank penalty + 'REFUSED' marker on their profile for 7 days. Win the callout: +25 rank points + Caller status on the Wall for 7 days + The Roast graphic auto-generated. Lose: -15 rank points + opponent earns 'Defender' badge for 7 days. Single callout per earning cycle.", status: "proposed" },
    ],
  },
  {
    id: "theater", num: "12", title: "Public Theater",
    lead: "Auto-generated content that the platform broadcasts when you do something noteworthy. Zero cost to platform, maximum reputation impact for player.",
    col1: "Drop", col2: "Trigger", col3: "How To Earn",
    rows: [
      { name: "Walk-On Theme", col2: "QR check-in", howTo: "QR check-in at a partner hall while ranked top-100. The hall's TV plays a 4-second animation with your gamer tag.", status: "proposed" },
      { name: "Hot Streak Hall Alert", col2: "3W in 4 hrs", howTo: "Win 3 consecutive matches within a rolling 4-hour window at the same hall. Push notification fires to every checked-in player at the hall.", status: "proposed" },
      { name: "The Wall", col2: "Champion Aura loss", howTo: "If you're top 5 (Champion Aura) and you lose a stake match, the loss is logged on a permanent public Wall page.", status: "proposed" },
      { name: "Rivalry Beef Sheet", col2: "Rival matches", howTo: "System pairs you with your closest competitor by rank proximity. Every match between you and your rival auto-updates the H2H stat sheet.", status: "proposed" },
      { name: "The Roast", col2: "Upset win", howTo: "Beat an opponent ranked higher than you. Auto-generated trash-talk graphic with both names and rank gap. Share-ready.", status: "proposed" },
      { name: "Weekly Highlight Reel", col2: "Sun 9 PM", howTo: "Play at least 1 match in the week. Sunday 9 PM the platform pushes a templated stat card to your inbox + share buttons.", status: "proposed" },
      { name: "Predator Index Entry", col2: "Top 20", howTo: "Be ranked in the top 20 in your ladder. You appear on the live H2H matrix accessible from the leaderboard.", status: "proposed" },
      { name: "Anniversary Yearbook", col2: "365 days", howTo: "Hit 365 days on the platform. Auto-generated 4-page personal yearbook PDF: top moments, rivals, halls played, biggest wins.", status: "proposed" },
      { name: "Near-Miss Prompt", col2: "Within 150 pts", howTo: "System fires automatically when you're within 150 points of the next reward threshold. Notification + countdown.", status: "live" },
      { name: "Public Callout System", col2: "+80 pts / win", howTo: "Challenge any player publicly through the app. If you win the resulting match, +80 points awarded.", status: "live" },
    ],
  },
  {
    id: "engagement", num: "13", title: "Rookie Engagement Mechanics",
    lead: "The 30 engagement features confirmed unchanged in the upgrade doc. Most are point-multiplier or credit-drop based.",
    col1: "Mechanic", col2: "Reward", col3: "How To Earn",
    rows: [
      { name: "Performance Bonus Roll", col2: "×1.15 – ×3.0", howTo: "Random multiplier on wins. Fires automatically after some win matches. Multiplier applied to credits/points earned that match.", status: "live" },
      { name: "Progressive Jackpot", col2: "Variable cash", howTo: "Shared prize pool that pays out every 50 matches. Players who participated in the 50-match window split the pot.", status: "live" },
      { name: "Surprise Performance Drop", col2: "Credits / cash", howTo: "8% chance of a random bonus after any match (win or loss). V2 converts cash drops to next-match credit multipliers.", status: "live" },
      { name: "Lucky Shift Indicator", col2: "Double-pay", howTo: "15% of matches are flagged as double-pay windows — credit and point earnings doubled. V2 converts cash to Lightning Win badge for most events.", status: "live" },
      { name: "Streak Shields (3-Pack)", col2: "Discount", howTo: "Purchase 3 streak shields at a discount instead of 1 at full price. Use to protect against multiple losses.", status: "live" },
      { name: "Inactivity Warning", col2: "42-hr notice", howTo: "Receive a 42-hour notification before your streak expires from inactivity. Gives time to play one more match and save the streak.", status: "live" },
      { name: "Rival System", col2: "Auto-match", howTo: "System auto-tracks your closest competitor by rank proximity. Notifications fire when they win, lose, or surpass/fall behind you.", status: "live" },
      { name: "Friend Leaderboard", col2: "Private", howTo: "Add friends from your hall. Private leaderboard tracks H2H stats between you and your friends only.", status: "live" },
      { name: "Hall vs Hall War", col2: "Team points", howTo: "Your match wins contribute to your hall's ranking. Halls battle each other through aggregated player performance.", status: "live" },
      { name: "Team Streak Bonus", col2: "+40 pts each", howTo: "If your hall gets 5 wins in a single day, every member at the hall that day receives +40 points.", status: "live" },
      { name: "Morning Power Hour", col2: "×1.30 pts", howTo: "Play matches between 7–9 AM local time. All points and credits earned multiplied by 1.30.", status: "live" },
      { name: "Evening Power Hour", col2: "×1.30 pts", howTo: "Play matches between 7–9 PM local time. 1.30× multiplier on all earnings.", status: "live" },
      { name: "Lightning Hour", col2: "+15 pts / match", howTo: "Randomly announced 60-minute window. Every match during the window earns +15 bonus points. V2 adds the Lightning Win badge for winners.", status: "live" },
      { name: "Weekend Rush", col2: "+20 pts / match", howTo: "Play matches on Saturday or Sunday. +20 bonus points per match all weekend.", status: "live" },
      { name: "Last Call Boost", col2: "×1.5 earnings", howTo: "Play matches in the final 3 hours of your weekly pay window. 1.5× multiplier on points and credits.", status: "live" },
      { name: "Legacy Record", col2: "Permanent", howTo: "Sustained dominance over multiple seasons. Your legacy record is permanently archived and contributes toward Hall of Fame eligibility.", status: "live" },
    ],
  },
  {
    id: "fame", num: "14", title: "Hall of Fame",
    lead: "Permanent legendary status. Once you're in, you're in forever. The hardest reaches on BilliardsLadder.",
    col1: "Honor", col2: "Type", col3: "How To Earn",
    rows: [
      { name: "Hall Throne", col2: "Permanent · per hall", howTo: "Most wins ever at one specific hall. Held until someone surpasses your count. Each hall has exactly one throne holder.", status: "proposed" },
      { name: "Champion of the Year", col2: "Annual", howTo: "Most total wins ladder-wide across a calendar year. Year-end ceremonial cash + permanent record.", status: "proposed" },
      { name: "BilliardsLadder Hall of Fame", col2: "Permanent · life", howTo: "Sustained dominance criteria — confidential. Inducted by the platform. The rarest mark on BilliardsLadder. Only certified by founder + platform leadership.", status: "live", legendary: true },
      { name: "Year-End Major Champion", col2: "Annual · legendary", howTo: "Win the year-end $10,000 major tournament. Permanent record on platform forever.", status: "hold", legendary: true },
    ],
  },
  {
    id: "tiers", num: "15", title: "Subscription Tier Perks",
    lead: "What you unlock just by paying for a tier. Every upgrade trades subscription cost for stake-fee reduction and feature access.",
    col1: "Tier", col2: "Price", col3: "How To Unlock",
    rows: [
      { name: "Trial (7-day)", col2: "Free · 7 days", howTo: "Sign up with a new account. Get 7 days of full platform access (no staking, no tournaments). Account locks after 7 days until paid plan selected.", status: "live" },
      { name: "Rookie Pass", col2: "$9.99/mo", howTo: "Subscribe to Rookie Pass. Access to Rookie ladder, quarterly cash prizes ($500–$10), mid-quarter checkpoint cash, $2 shift deposits per match, low-stakes matches.", status: "live" },
      { name: "Basic", col2: "$24.99/mo", howTo: "Subscribe to Basic. Unlimited challenges, 4% stake fee, $150 max stake, full open ladder, consistency bonuses, monthly tournament access.", status: "live" },
      { name: "Premium", col2: "$34.99/mo", howTo: "Subscribe to Premium. 3% stake fee, $1,000 max stake, AI Coach access, advanced analytics, priority matchmaking, 48-reward vault, $30 tournament entry, no ads, Verified Premium badge.", status: "live" },
      { name: "Family Plan", col2: "$44.99/mo", howTo: "Subscribe to Family Plan. Up to 4 player profiles on one account. Adults operate at Basic-level stakes. Kids 12 and under + Teens 13–17 are add-ons ($3.99–$4.99 each) and access drills/junior competitions only. Family Tournament access.", status: "live" },
      { name: "Elite Player", col2: "$99/mo", howTo: "Subscribe to Elite. 2% stake fee, $1,000+ max stake (operator approval above $1,000), travel/cross-region challenges, AI opponent scouting, VIP tournament seeding, dedicated support, Hall of Fame eligible, $0–$20 tournament entry scaled by prize pool.", status: "live", legendary: true },
    ],
  },
];

export default function EarningReference() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-green-950/40 to-transparent px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-green-400 mb-3">Earning Reference Guide · Internal · May 2026</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            How every reward is <span className="text-green-400">earned.</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed mb-6">
            Every title, badge, status drop, cash payout, credit, shop item, and ceremonial unlock currently in the BilliardsLadder system — with the exact trigger that earns it.
            Use this as the source of truth for operator training, player FAQ, and developer reference.
          </p>
          <div className="flex flex-wrap gap-5 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              Live in approved spec
            </div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
              Approved but deferred
            </div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              V2 proposed — pending sign-off
            </div>
          </div>
        </div>
      </div>

      {/* TOC */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-green-400 border border-white/10 hover:border-green-500/40 px-2.5 py-1.5 transition-colors"
            >
              {s.num} {s.title.split(" ")[0]}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-0">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="py-14 border-b border-white/10">
            <p className="text-green-400 font-mono text-base italic mb-1">{section.num}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{section.title}</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-2xl leading-relaxed">{section.lead}</p>
            <RewardTable col1={section.col1} col2={section.col2} col3={section.col3} rows={section.rows} />
            {section.kicker && (
              <div className="mt-6 border-l-2 border-green-500 pl-5 py-3 bg-green-950/20">
                <p className="text-[10px] font-mono uppercase tracking-widest text-green-400 mb-2">{section.kicker.label}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{section.kicker.body}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="text-center py-10 border-t border-white/10">
        <p className="text-xs font-mono uppercase tracking-widest text-gray-600">BilliardsLadder · Earning Reference · Confidential · May 2026</p>
      </footer>
    </div>
  );
}
