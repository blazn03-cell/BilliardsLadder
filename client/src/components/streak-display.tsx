
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SafeText } from "@/components/SafeText";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  totalRewardsEarned: number;
  nextMilestone?: number;
}

interface StreakTitle {
  threshold: number;
  name: string;
  color: string;
  emoji: string;
}

const STREAK_TITLES: StreakTitle[] = [
  { threshold: 15, name: "Legend",       color: "text-yellow-300", emoji: "👑" },
  { threshold: 10, name: "Assassin",     color: "text-red-400",    emoji: "🎯" },
  { threshold: 7,  name: "Untouchable",  color: "text-purple-400", emoji: "⚡" },
  { threshold: 5,  name: "Predator",     color: "text-orange-400", emoji: "🦈" },
  { threshold: 3,  name: "Heater",       color: "text-green-400",  emoji: "🔥" },
];

const STREAK_MILESTONES = [3, 5, 7, 10, 15];

function getActiveTitle(streak: number): StreakTitle | null {
  return STREAK_TITLES.find(t => streak >= t.threshold) || null;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  totalRewardsEarned,
}: StreakDisplayProps) {
  const activeTitle = getActiveTitle(currentStreak);
  const nextMilestoneVal = STREAK_MILESTONES.find(m => m > currentStreak) ?? 3;
  const progressToNext = Math.min(100, (currentStreak / nextMilestoneVal) * 100);

  return (
    <Card className="bg-gray-900 border-green-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 flex items-center gap-2">
          🔥 Win Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current streak + active title */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{currentStreak}</div>
          <SafeText className="text-sm text-gray-400">wins in a row</SafeText>
          {activeTitle && (
            <div className={`text-sm font-bold mt-1 ${activeTitle.color}`}>
              {activeTitle.emoji} {activeTitle.name}
            </div>
          )}
          {longestStreak > currentStreak && (
            <div className="text-xs text-yellow-400 mt-1">
              Personal best: {longestStreak}
            </div>
          )}
        </div>

        {/* Progress to next title */}
        {currentStreak < 15 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Next title at {nextMilestoneVal} wins</span>
              <span className="text-xs text-green-400">{nextMilestoneVal - currentStreak} away</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Title milestones */}
        <div className="grid grid-cols-5 gap-1">
          {[...STREAK_TITLES].reverse().map(t => {
            const achieved = currentStreak >= t.threshold;
            const isActive = activeTitle?.threshold === t.threshold;
            return (
              <div
                key={t.threshold}
                className={`text-center p-1.5 rounded border ${
                  isActive
                    ? "border-green-500 bg-green-900/30"
                    : achieved
                    ? "border-gray-500 bg-gray-800/50"
                    : "border-gray-700 opacity-40"
                }`}
              >
                <div className="text-sm">{t.emoji}</div>
                <div className={`text-[10px] font-bold leading-tight ${achieved ? t.color : "text-gray-500"}`}>
                  {t.name}
                </div>
                <div className="text-[9px] text-gray-500">{t.threshold}W</div>
              </div>
            );
          })}
        </div>

        {/* Total rewards earned */}
        {totalRewardsEarned > 0 && (
          <div className="text-center pt-2 border-t border-gray-700">
            <SafeText className="text-xs text-gray-400">Total streak bonuses earned</SafeText>
            <div className="text-lg font-bold text-green-400">
              ${(totalRewardsEarned / 100).toFixed(2)}
            </div>
          </div>
        )}

        {/* Motivation */}
        <div className="text-center text-xs text-gray-500">
          {currentStreak === 0 && "Win 3 in a row to earn Heater status 🔥"}
          {currentStreak >= 1 && currentStreak < 3 && `${3 - currentStreak} more win${3 - currentStreak > 1 ? "s" : ""} to Heater 🔥`}
          {currentStreak >= 3 && currentStreak < 15 && `Defend your ${activeTitle?.name} title! 💪`}
          {currentStreak >= 15 && "You are Legend. The rarest streak title. 👑"}
        </div>
      </CardContent>
    </Card>
  );
}
