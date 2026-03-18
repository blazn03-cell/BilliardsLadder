import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Calendar, Users } from "lucide-react";

export default function RecurringLeagues() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2" data-testid="text-recurring-leagues-title">Recurring Leagues</h1>
        <p className="text-gray-400">Weekly and monthly league schedules that repeat automatically</p>
      </div>

      <Card className="bg-[#0d1117] border-[#1a2332]">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Active Recurring Leagues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">No recurring leagues configured yet. Operators can set up weekly or monthly leagues that auto-renew.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Next league: Not scheduled</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="h-4 w-4" />
              <span className="text-sm">Enrolled players: 0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
