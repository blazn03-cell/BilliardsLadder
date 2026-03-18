import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Clock, MapPin } from "lucide-react";

export default function TournamentEventPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-400 mb-2" data-testid="text-event-page-title">Tournament Events</h1>
        <p className="text-gray-400">View and manage tournament event details</p>
      </div>

      <Card className="bg-[#0d1117] border-[#1a2332]">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-400">No event selected. Browse tournaments to view event details.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <span className="text-sm">Participants: --</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Status: Pending</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location: TBD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
