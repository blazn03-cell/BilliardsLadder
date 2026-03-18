import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar, BarChart3 } from "lucide-react";

export default function OrganizerHub() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2" data-testid="text-organizer-hub-title">Organizer Hub</h1>
        <p className="text-gray-400">Manage your events, leagues, and tournaments from one place</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-[#0d1117] border-[#1a2332]">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Active Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">No active events yet. Create your first tournament or league to get started.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0d1117] border-[#1a2332]">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Player Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">Track player signups and manage rosters for your events.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0d1117] border-[#1a2332]">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-sm">No upcoming events scheduled.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
