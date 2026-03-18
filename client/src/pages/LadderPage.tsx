// DEV NOTE: "Kiddie Box King" is a humorous/playful name for the 7ft barbox division.
// It is a tongue-in-cheek joke about the smaller table size — nothing more.
// It has NO relationship to children, kids, or any children's subscription tier.

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import type { Player, Match, Bounty } from '../../../shared/schema';
import { WeightRulesDisplay } from '@/components/weight-rules-display';

// ─── Table config per division ────────────────────────────────────────────────
export type TableType = '9ft' | '8ft' | 'barbox';

const TABLE_CONFIG: Record<TableType, {
  title: string;
  subtitle: string;
  tagline: string;
  tableEmoji: string;
  ratingKey: string;
  pointsKey: string;
  contenderMax: number;
  eliteMin: number;
}> = {
  '9ft': {
    title: 'BIG DOG THRONE',
    subtitle: '📏 9ft Tables Only',
    tagline: "First rule of the hustle: You don't tell 'em where the bread came from. Just eat",
    tableEmoji: '🥇',
    ratingKey: 'rating',
    pointsKey: 'points',
    contenderMax: 650,
    eliteMin: 651,
  },
  '8ft': {
    title: 'ALMOST BIG TIME',
    subtitle: '📐 8ft Tables',
    tagline: 'Almost there — sharpen your game before you move up',
    tableEmoji: '🥈',
    ratingKey: 'rating',
    pointsKey: 'points',
    contenderMax: 650,
    eliteMin: 651,
  },
  'barbox': {
    title: 'KIDDIE BOX KING',
    subtitle: '📦 7ft Barbox Tables',
    tagline: 'Lock into the bonus pool before the break',
    tableEmoji: '🥉',
    ratingKey: 'rating',
    pointsKey: 'points',
    contenderMax: 599,
    eliteMin: 600,
  },
};

// ─── VIP tier ─────────────────────────────────────────────────────────────────
const VIP_TIERS: Record<string, { color: string; glow: string; icon: string }> = {
  LEGEND: { color: '#ffd700', glow: 'rgba(255,215,0,0.35)',  icon: '👑' },
  GOLD:   { color: '#f59e0b', glow: 'rgba(245,158,11,0.25)', icon: '🥇' },
  SILVER: { color: '#9ca3af', glow: 'rgba(156,163,175,0.2)', icon: '🥈' },
  BRONZE: { color: '#78350f', glow: 'rgba(120,53,15,0.15)',  icon: '🥉' },
};

function getVip(points: number, wins: number) {
  if (points >= 5000 || wins >= 50) return 'LEGEND';
  if (points >= 2500 || wins >= 25) return 'GOLD';
  if (points >= 1000 || wins >= 10) return 'SILVER';
  return 'BRONZE';
}

function getWins(playerId: string, matches: any[]): number {
  return matches.filter((m) => m.winnerId === playerId).length;
}

function getWinRate(playerId: string, matches: any[]): number {
  const w = matches.filter((m) => m.winnerId === playerId).length;
  const l = matches.filter((m) => m.loserId  === playerId).length;
  return w + l > 0 ? Math.round((w / (w + l)) * 100) : 0;
}

function getStreak(playerId: string, matches: any[]): { count: number; type: 'W' | 'L' | '-' } {
  const sorted = [...matches]
    .filter((m) => m.winnerId === playerId || m.loserId === playerId)
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  if (!sorted.length) return { count: 0, type: '-' };
  const type: 'W' | 'L' = sorted[0].winnerId === playerId ? 'W' : 'L';
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    const won = sorted[i].winnerId === playerId;
    if ((type === 'W' && won) || (type === 'L' && !won)) count++;
    else break;
  }
  return { count, type };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🏆</span>;
  if (rank === 2) return <span style={{ fontSize: 18 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 18 }}>🥉</span>;
  return <span style={{ minWidth: 28, display: 'inline-block', textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#6ee7b7' }}>#{rank}</span>;
}

function VipChip({ tier }: { tier: string }) {
  const cfg = VIP_TIERS[tier] ?? VIP_TIERS.BRONZE;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '1px 7px', borderRadius: 4,
      border: `1px solid ${cfg.color}55`, background: cfg.glow,
      color: cfg.color, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {cfg.icon} {tier}
    </span>
  );
}

function WinBar({ pct }: { pct: number }) {
  const color = pct >= 65 ? '#22c55e' : pct >= 50 ? '#86efac' : pct >= 35 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 90 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 30 }}>{pct}%</span>
    </div>
  );
}

function StreakBadge({ streak }: { streak: { count: number; type: 'W' | 'L' | '-' } }) {
  if (!streak.count || streak.type === '-') return <span style={{ color: '#4b5563', fontSize: 11 }}>—</span>;
  return (
    <span style={{ color: streak.type === 'W' ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: 700 }}>
      {streak.type === 'W' ? '🔥' : '🧊'} {streak.count}{streak.type}
    </span>
  );
}

// ─── Division section (contenders / elite) ────────────────────────────────────
function DivisionSection({
  title, players, matches, onPlayerClick, accentColor,
}: {
  title: string;
  players: any[];
  matches: any[];
  onPlayerClick: (id: string) => void;
  accentColor: string;
}) {
  if (!players.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        color: accentColor, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
        {title}
        <div style={{ flex: 1, height: 1, background: `${accentColor}33` }} />
      </div>
      <div style={{
        background: 'linear-gradient(180deg,#0d1117,#060a0d)',
        border: '1px solid #ffffff11', borderRadius: 10, overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '48px 1fr 90px 100px 110px 90px 70px',
          padding: '8px 16px', background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid #ffffff0a',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#4b5563',
        }}>
          <span>#</span><span>Player</span><span style={{ textAlign: 'center' }}>VIP</span>
          <span style={{ textAlign: 'right' }}>ELO</span>
          <span>Win Rate</span>
          <span style={{ textAlign: 'center' }}>Streak</span>
          <span style={{ textAlign: 'center' }}>W/L</span>
        </div>
        {players.map((p) => {
          const wins    = getWins(p.id, matches);
          const losses  = matches.filter((m) => m.loserId === p.id).length;
          const winRate = getWinRate(p.id, matches);
          const streak  = getStreak(p.id, matches);
          const vip     = getVip(p.points, wins);
          return (
            <div key={p.id}
              onClick={() => onPlayerClick(p.id)}
              style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 90px 100px 110px 90px 70px',
                padding: '11px 16px', borderBottom: '1px solid #ffffff06',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <RankBadge rank={p.rank} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#16a34a,#065f46)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#f0fdf4',
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: '#f0fdf4', fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                  <div style={{ color: '#4b5563', fontSize: 10 }}>{p.points} pts</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}><VipChip tier={vip} /></div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#86efac', fontWeight: 700, fontSize: 14 }}>{p.rating ?? 500}</span>
              </div>
              <WinBar pct={winRate} />
              <div style={{ textAlign: 'center' }}><StreakBadge streak={streak} /></div>
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 11 }}>
                <span style={{ color: '#22c55e' }}>{wins}</span>{' / '}<span style={{ color: '#ef4444' }}>{losses}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main LadderPage ──────────────────────────────────────────────────────────

interface LadderPageProps {
  tableType?: TableType;
}

const LadderPage: React.FC<LadderPageProps> = ({ tableType = '9ft' }) => {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'winrate' | 'rating'>('rank');

  const cfg = TABLE_CONFIG[tableType];

  const { data: players = [], isLoading } = useQuery<Player[]>({ queryKey: ['/api/players'] });
  const { data: matches = [] }            = useQuery<any[]>({ queryKey: ['/api/matches'] });
  const { data: bounties = [] }           = useQuery<any[]>({ queryKey: ['/api/bounties'] });

  const activeBounties = bounties.filter((b) => b.active);

  const ranked = useMemo(() => {
    const pointsKey = cfg.pointsKey as keyof Player;
    const ratingKey = cfg.ratingKey as keyof Player;
    return [...players]
      .sort((a, b) => ((b[pointsKey] as number) ?? 0) - ((a[pointsKey] as number) ?? 0))
      .map((p, i) => ({
        ...p,
        rank: i + 1,
        _rating: (p[ratingKey] as number) ?? p.rating ?? 500,
        _points: (p[pointsKey] as number) ?? p.points ?? 0,
      }));
  }, [players, cfg]);

  const filtered = useMemo(() => {
    let list = ranked.filter((p) =>
      !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === 'winrate') list = [...list].sort((a, b) => getWinRate(b.id, matches) - getWinRate(a.id, matches));
    if (sortBy === 'rating')  list = [...list].sort((a, b) => b._rating - a._rating);
    return list;
  }, [ranked, search, sortBy, matches]);

  const top3        = ranked.slice(0, 3);
  const contenders  = filtered.filter((p) => p._rating <= cfg.contenderMax);
  const elite       = filtered.filter((p) => p._rating >= cfg.eliteMin);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{
          display: 'inline-block', width: 40, height: 40, borderRadius: '50%',
          border: '3px solid #16a34a', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: '#4b5563', marginTop: 12 }}>Loading {cfg.subtitle}…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px', fontFamily: 'inherit' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>

      {/* ── Table-type switcher ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {(['9ft', '8ft', 'barbox'] as TableType[]).map((t) => (
          <button key={t} onClick={() => navigate(`/app?tab=${t === '9ft' ? 'ladder' : t === '8ft' ? 'eightfoot-ladder' : 'barbox-ladder'}`)}
            style={{
              padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: tableType === t ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)',
              color: tableType === t ? '#22c55e' : '#6b7280',
              border: `1px solid ${tableType === t ? '#16a34a66' : '#ffffff11'}`,
              transition: 'all 0.15s',
            }}>
            {TABLE_CONFIG[t].tableEmoji} {t === 'barbox' ? '7ft' : t}
          </button>
        ))}
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center', padding: '36px 20px 28px',
        background: 'linear-gradient(180deg,#0d2416,#060e09)',
        borderRadius: 12, border: '1px solid #16a34a33', marginBottom: 22,
        animation: 'fadeIn 0.35s ease',
      }}>
        <div style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 20,
          background: 'rgba(34,197,94,0.12)', border: '1px solid #16a34a55',
          color: '#86efac', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14,
        }}>
          🎱 {cfg.subtitle}
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 900, color: '#f0fdf4', margin: '0 0 8px',
          textShadow: '0 0 40px rgba(34,197,94,0.35)', letterSpacing: '-0.02em',
        }}>
          {cfg.title}
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: 14 }}>{cfg.tagline}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Players', value: players.length },
            { label: 'Matches', value: matches.length },
            { label: 'Bounties', value: activeBounties.length },
          ].map((s) => (
            <div key={s.label} style={{
              padding: '6px 18px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff11', color: '#d1fae5',
            }}>
              <span style={{ fontWeight: 800, fontSize: 20 }}>{s.value}</span>
              <span style={{ color: '#4b5563', fontSize: 11, marginLeft: 6 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bounties ─────────────────────────────────────────────────────── */}
      {activeBounties.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em' }}>🎯 ACTIVE BOUNTIES</span>
          {activeBounties.map((b: any) => (
            <span key={b.id} style={{
              background: 'rgba(239,68,68,0.15)', padding: '2px 10px', borderRadius: 4,
              color: '#fca5a5', fontSize: 11, fontWeight: 600,
            }}>
              ${b.prize} on {b.type === 'onRank' ? `Rank #${b.rank}` : 'target'}
            </span>
          ))}
        </div>
      )}

      {/* ── Handicap rules ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <WeightRulesDisplay weightOwed={false} consecutiveLosses={0} weightMultiplier={1.0} />
      </div>

      {/* ── Top 3 Podium ─────────────────────────────────────────────────── */}
      {top3.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#86efac', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            🏆 Top Ranked
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(195px,1fr))', gap: 10 }}>
            {top3.map((p, i) => {
              const wins    = getWins(p.id, matches);
              const winRate = getWinRate(p.id, matches);
              const vip     = getVip(p.points, wins);
              return (
                <div key={p.id} onClick={() => navigate(`/player/career?playerId=${p.id}`)}
                  style={{
                    padding: '16px 14px',
                    background: i === 0 ? 'linear-gradient(135deg,#1c1000,#0a0700)' : 'linear-gradient(135deg,#0d1117,#060a0d)',
                    border: `1px solid ${i === 0 ? '#ffd70055' : '#ffffff11'}`,
                    borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                    boxShadow: i === 0 ? '0 0 28px rgba(255,215,0,0.1)' : 'none',
                    animation: `fadeIn ${0.2 + i * 0.08}s ease`,
                  }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'}</div>
                  <div style={{ color: '#f0fdf4', fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{p.name}</div>
                  <VipChip tier={vip} />
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <div><div style={{ color: VIP_TIERS[vip]?.color ?? '#86efac', fontWeight: 800, fontSize: 17 }}>{p._points}</div><div style={{ color: '#4b5563', fontSize: 10 }}>pts</div></div>
                    <div><div style={{ color: '#86efac', fontWeight: 800, fontSize: 17 }}>{winRate}%</div><div style={{ color: '#4b5563', fontSize: 10 }}>W/R</div></div>
                    <div><div style={{ color: '#d1d5db', fontWeight: 800, fontSize: 17 }}>{p._rating}</div><div style={{ color: '#4b5563', fontSize: 10 }}>ELO</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Search + Sort ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input type="text" placeholder="🔍  Search player…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 160, padding: '8px 14px', borderRadius: 7,
            background: 'rgba(255,255,255,0.04)', border: '1px solid #ffffff18',
            color: '#f0fdf4', fontSize: 13, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['rank', 'winrate', 'rating'] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              padding: '8px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: sortBy === s ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.04)',
              color: sortBy === s ? '#22c55e' : '#6b7280',
              border: `1px solid ${sortBy === s ? '#16a34a55' : '#ffffff11'}`,
              transition: 'all 0.15s',
            }}>
              {s === 'rank' ? 'By Rank' : s === 'winrate' ? 'Win Rate' : 'ELO'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Player rows by division ──────────────────────────────────────── */}
      {search.trim() ? (
        <DivisionSection title="Search Results" players={filtered} matches={matches} onPlayerClick={(id) => navigate(`/player/career?playerId=${id}`)} accentColor="#22c55e" />
      ) : (
        <>
          <DivisionSection title="Elite Division" players={elite} matches={matches} onPlayerClick={(id) => navigate(`/player/career?playerId=${id}`)} accentColor="#ffd700" />
          <DivisionSection title="Contenders" players={contenders} matches={matches} onPlayerClick={(id) => navigate(`/player/career?playerId=${id}`)} accentColor="#86efac" />
        </>
      )}

      {/* ── Join CTA ─────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={() => navigate('/join')}
          style={{
            padding: '12px 32px', borderRadius: 9, cursor: 'pointer',
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            border: 'none', color: '#f0fdf4', fontWeight: 700, fontSize: 14,
            boxShadow: '0 0 24px rgba(34,197,94,0.25)', transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
        >
          Join the Queue →
        </button>
      </div>
    </div>
  );
};

export default LadderPage;
