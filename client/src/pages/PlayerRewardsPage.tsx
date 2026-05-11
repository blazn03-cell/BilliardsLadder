import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface CreditsData {
  balance: number;
  progressPoints: number;
  currentStreak: number;
  longestStreak: number;
  earnRates: {
    win: number;
    loss: number;
    loginStreak3: number;
    loginStreak7: number;
    mysteryChestBase: number;
    dailyMissionComplete: number;
  };
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  emoji: string;
  category: string;
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  difficulty: string;
  earned: boolean;
}

interface DailyMission {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: string;
}

const DEMO_PLAYER_ID = "player-demo";

const difficultyColor: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  legendary: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function CreditsTab({ playerId }: { playerId: string }) {
  const { data: credits, isLoading } = useQuery<CreditsData>({
    queryKey: ["/api/player/credits", playerId],
    queryFn: () => fetch(`/api/player/credits?playerId=${playerId}`).then((r) => r.json()),
  });

  const { data: missions = [] } = useQuery<DailyMission[]>({
    queryKey: ["/api/player/daily-missions"],
    queryFn: () => fetch("/api/player/daily-missions").then((r) => r.json()),
  });

  if (isLoading) {
    return <div className="text-green-400 text-center py-12">Loading credits...</div>;
  }

  const balance = credits?.balance ?? 0;

  return (
    <div className="space-y-6">
      {/* Balance Hero */}
      <div className="felt-bg rounded-lg border border-green-700/30 p-8 text-center">
        <div className="text-6xl font-bold cash-glow mb-2">{balance.toLocaleString()}</div>
        <div className="text-green-500 text-lg">Shop Credits</div>
        <div className="mt-4 flex justify-center gap-8 text-sm">
          <div>
            <div className="text-green-400 font-bold">{credits?.currentStreak ?? 0}</div>
            <div className="text-green-600">Current Streak</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">{credits?.longestStreak ?? 0}</div>
            <div className="text-green-600">Best Streak</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">{credits?.progressPoints ?? 0}</div>
            <div className="text-green-600">Progress Points</div>
          </div>
        </div>
      </div>

      {/* Earn Rates */}
      <Card className="bg-black/60 border border-green-700/30">
        <CardHeader>
          <CardTitle className="text-green-400">How to Earn Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Win a Match", value: `+${credits?.earnRates.win ?? 15} cr` },
              { label: "Lose a Match", value: `+${credits?.earnRates.loss ?? 5} cr` },
              { label: "3-Day Login Streak", value: `+${credits?.earnRates.loginStreak3 ?? 10} cr` },
              { label: "7-Day Login Streak", value: `+${credits?.earnRates.loginStreak7 ?? 25} cr` },
              { label: "Open Mystery Pack", value: `+${credits?.earnRates.mysteryChestBase ?? 20}+ cr` },
              { label: "Daily Mission Complete", value: `+${credits?.earnRates.dailyMissionComplete ?? 30} cr` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center p-3 bg-black/30 rounded border border-green-800/30"
              >
                <span className="text-green-600 text-sm">{row.label}</span>
                <span className="text-green-400 font-bold text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Missions */}
      <Card className="bg-black/60 border border-green-700/30">
        <CardHeader>
          <CardTitle className="text-green-400">Today's Missions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center justify-between p-3 bg-black/30 rounded border border-green-800/30"
              >
                <div>
                  <div className="font-medium text-white">{mission.title}</div>
                  <div className="text-sm text-green-600">{mission.description}</div>
                </div>
                <div className="text-green-400 font-bold text-sm whitespace-nowrap ml-4">
                  +{mission.reward} cr
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShopTab({ playerId }: { playerId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/player/shop"],
    queryFn: () => fetch("/api/player/shop").then((r) => r.json()),
  });

  const { data: credits } = useQuery<CreditsData>({
    queryKey: ["/api/player/credits", playerId],
    queryFn: () => fetch(`/api/player/credits?playerId=${playerId}`).then((r) => r.json()),
  });

  const purchase = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("/api/player/shop/purchase", {
        method: "POST",
        body: JSON.stringify({ playerId, itemId }),
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/credits", playerId] });
      toast({ title: "Purchase Successful", description: data?.message ?? "Item redeemed!" });
    },
    onError: (err: any) => {
      toast({
        title: "Purchase Failed",
        description: err?.message ?? "Not enough credits or item unavailable.",
        variant: "destructive",
      });
    },
  });

  const balance = credits?.balance ?? 0;

  if (isLoading) {
    return <div className="text-green-400 text-center py-12">Loading shop...</div>;
  }

  const categoryOrder = ["protection", "loot", "boost", "entry", "billing"];
  const grouped = categoryOrder.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  }));

  const categoryLabels: Record<string, string> = {
    protection: "🛡️ Protection",
    loot: "🎁 Loot",
    boost: "⚡ Boosts",
    entry: "🏆 Entries",
    billing: "💳 Billing",
  };

  return (
    <div className="space-y-6">
      {/* Balance */}
      <div className="text-right text-green-400 font-bold">
        Balance: <span className="cash-glow">{balance.toLocaleString()} credits</span>
      </div>

      {grouped.map(({ cat, items: catItems }) =>
        catItems.length === 0 ? null : (
          <div key={cat}>
            <h3 className="text-green-400 font-bold mb-3">{categoryLabels[cat] ?? cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catItems.map((item) => {
                const canAfford = balance >= item.cost;
                return (
                  <Card
                    key={item.id}
                    className={`bg-black/60 border transition-colors ${
                      canAfford ? "border-green-700/30 hover:border-green-500/50" : "border-gray-700/30 opacity-60"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="font-bold text-white mb-1">{item.name}</div>
                      <div className="text-sm text-green-600 mb-4">{item.description}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">{item.cost.toLocaleString()} cr</span>
                        <Button
                          size="sm"
                          disabled={!canAfford || purchase.isPending}
                          onClick={() => purchase.mutate(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-black font-bold"
                          data-testid={`button-buy-${item.id}`}
                        >
                          {purchase.isPending ? "..." : "Buy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function BadgesTab({ playerId }: { playerId: string }) {
  const { data: badges = [], isLoading } = useQuery<BadgeData[]>({
    queryKey: ["/api/player/badges", playerId],
    queryFn: () => fetch(`/api/player/badges?playerId=${playerId}`).then((r) => r.json()),
  });

  if (isLoading) {
    return <div className="text-green-400 text-center py-12">Loading badges...</div>;
  }

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      {earned.length > 0 && (
        <div>
          <h3 className="text-green-400 font-bold mb-3">Earned ({earned.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earned.map((badge) => (
              <Card key={badge.id} className="bg-green-900/20 border border-green-500/40">
                <CardContent className="p-5">
                  <div className="text-3xl mb-2">{badge.emoji}</div>
                  <div className="font-bold text-green-300 mb-1">{badge.name}</div>
                  <div className="text-sm text-green-600 mb-2">{badge.description}</div>
                  <Badge className={`text-xs border ${difficultyColor[badge.difficulty] ?? ""}`}>
                    {badge.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-green-600 font-bold mb-3">Locked ({locked.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locked.map((badge) => (
            <Card key={badge.id} className="bg-black/40 border border-gray-700/30 opacity-60">
              <CardContent className="p-5">
                <div className="text-3xl mb-2 grayscale">{badge.emoji}</div>
                <div className="font-bold text-gray-400 mb-1">{badge.name}</div>
                <div className="text-sm text-gray-600 mb-2">{badge.description}</div>
                <Badge className={`text-xs border ${difficultyColor[badge.difficulty] ?? ""}`}>
                  {badge.difficulty}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlayerRewardsPage() {
  // In production this would come from auth context; using query param as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const playerId = urlParams.get("playerId") || DEMO_PLAYER_ID;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-10 felt-bg rounded-lg border border-green-700/30">
        <h1 className="text-5xl font-bold text-green-400 neon-glow mb-3">REWARDS & SHOP</h1>
        <p className="text-green-500 text-lg">Earn credits. Spend smart. Look legendary.</p>
      </div>

      <Tabs defaultValue="credits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credits">💰 Credits</TabsTrigger>
          <TabsTrigger value="shop">🛒 Shop</TabsTrigger>
          <TabsTrigger value="badges">🏅 Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <CreditsTab playerId={playerId} />
        </TabsContent>

        <TabsContent value="shop">
          <ShopTab playerId={playerId} />
        </TabsContent>

        <TabsContent value="badges">
          <BadgesTab playerId={playerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
