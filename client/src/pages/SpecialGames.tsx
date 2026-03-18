import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Target, Building2, Vote, Trophy, Zap, Crown, Calendar } from "lucide-react";
import MoneyOnTable from "@/components/money-on-table";
import KellyPool from "@/components/kelly-pool";
import ObjectBallCarom from "@/components/object-ball-carom";
import PoolhallMatches from "@/components/poolhall-matches";
import GameOfTheMonthVoting from "@/components/game-of-month-voting";
import SpotShotGames from "@/components/spot-shot-games";
import TournamentCalcutta from "@/components/tournament-calcutta";
import SeasonPredictions from "@/components/season-predictions";

export default function SpecialGames() {
  const [activeTab, setActiveTab] = useState("money-ball");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Special Games</h1>
        <p className="text-gray-400">Unique game variants and special challenge formats</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-gray-900 border border-gray-700">
          <TabsTrigger value="money-ball" className="data-[state=active]:bg-green-600 data-[state=active]:text-white" data-testid="tab-money-ball">
            <DollarSign className="mr-1 h-4 w-4" /> Money Ball
          </TabsTrigger>
          <TabsTrigger value="kelly-pool" className="data-[state=active]:bg-green-600 data-[state=active]:text-white" data-testid="tab-kelly-pool">
            <Trophy className="mr-1 h-4 w-4" /> Kelly Pool
          </TabsTrigger>
          <TabsTrigger value="object-carom" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Zap className="mr-1 h-4 w-4" /> Object Carom
          </TabsTrigger>
          <TabsTrigger value="poolhall-matches" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Building2 className="mr-1 h-4 w-4" /> Hall Matches
          </TabsTrigger>
          <TabsTrigger value="game-voting" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Vote className="mr-1 h-4 w-4" /> Game Voting
          </TabsTrigger>
          <TabsTrigger value="spot-shots" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Target className="mr-1 h-4 w-4" /> Spot Shots
          </TabsTrigger>
          <TabsTrigger value="calcutta" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Crown className="mr-1 h-4 w-4" /> Player Auction
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Calendar className="mr-1 h-4 w-4" /> Season Picks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="money-ball"><MoneyOnTable /></TabsContent>
        <TabsContent value="kelly-pool"><KellyPool /></TabsContent>
        <TabsContent value="object-carom"><ObjectBallCarom /></TabsContent>
        <TabsContent value="poolhall-matches"><PoolhallMatches /></TabsContent>
        <TabsContent value="game-voting"><GameOfTheMonthVoting /></TabsContent>
        <TabsContent value="spot-shots"><SpotShotGames /></TabsContent>
        <TabsContent value="calcutta"><TournamentCalcutta /></TabsContent>
        <TabsContent value="predictions"><SeasonPredictions /></TabsContent>
      </Tabs>
    </div>
  );
}
