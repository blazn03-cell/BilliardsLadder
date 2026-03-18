import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target } from "lucide-react";

export default function LeagueProgressionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2" data-testid="text-league-progression-title">League Progression</h1>
        <p className="text-gray-400">Track your league advancement and seasonal progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0d1117] border-[#1a2332]">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Season
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">No active season. Join a league to start tracking your progression.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0d1117] border-[#1a2332]">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Complete matches and climb the ladder to unlock achievements.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
