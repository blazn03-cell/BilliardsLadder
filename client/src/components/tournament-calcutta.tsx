import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Target, Building2, Vote, Trophy, Zap, Plus, Eye, ThumbsUp, ThumbsDown, Crown, Users, Calendar } from "lucide-react";

function TournamentCalcutta() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [bidAmount, setBidAmount] = useState<string>("");

  // Fetch tournaments with calcutta enabled
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery<any>({
    queryKey: ["/api/tournaments"],
  });

  // Fetch calcuttas for selected tournament
  const { data: calcuttas, isLoading: calcuttasLoading } = useQuery<any>({
    queryKey: ["/api/tournaments", selectedTournament, "calcuttas"],
    enabled: !!selectedTournament,
  });

  // Fetch bids for selected calcuttas
  const { data: allBids } = useQuery<any>({
    queryKey: ["/api/calcutta-bids"],
  });

  const placeBidMutation = useMutation({
    mutationFn: (bidData: any) => apiRequest("/api/calcutta-bids", {
      method: "POST",
      body: JSON.stringify(bidData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calcutta-bids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournament-calcuttas"] });
      toast({
        title: "Success",
        description: "Your bid has been placed successfully!",
      });
      setBidAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place bid",
        variant: "destructive",
      });
    },
  });

  const handlePlaceBid = (calcuttaId: string) => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate({
      calcuttaId,
      bidderId: "current-user-id", // Replace with actual user ID
      bidAmount: Math.floor(amount * 100), // Convert to cents
      isWinning: false,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Player Auction - Sponsor Tournament Participants
          </CardTitle>
          <CardDescription>
            Sponsor tournament players before events start. Sponsors split the prize pool!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tournament Selection */}
          <div className="space-y-2">
            <Label>Select Tournament</Label>
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger data-testid="select-tournament">
                <SelectValue placeholder="Choose a tournament..." />
              </SelectTrigger>
              <SelectContent>
                {tournaments?.filter((t: any) => t.calcuttaEnabled)?.map((tournament: any) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name} - {formatCurrency(tournament.entry)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTournament && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Available Participants</h3>
              
              {calcuttasLoading ? (
                <div className="text-center py-8 text-gray-400">Loading participants...</div>
              ) : calcuttas?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No participants available for bidding yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {calcuttas?.map((calcutta: any) => {
                    const participantBids = allBids?.filter((bid: any) => bid.calcuttaId === calcutta.id) || [];
                    const highestBid = participantBids.reduce((max: any, bid: any) => 
                      bid.bidAmount > (max?.bidAmount || 0) ? bid : max, null);

                    return (
                      <Card key={calcutta.id} className="bg-gray-800 border-gray-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-green-400">
                            Participant: {calcutta.participantId}
                          </CardTitle>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">
                              Current Offer: {calcutta.currentBid ? formatCurrency(calcutta.currentBid) : "No offers yet"}
                            </span>
                            <Badge variant={calcutta.biddingOpen ? "default" : "secondary"}>
                              {calcutta.biddingOpen ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        {calcutta.biddingOpen && (
                          <CardContent className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Sponsor amount ($)"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                min="1"
                                step="0.01"
                                data-testid={`input-bid-${calcutta.id}`}
                              />
                              <Button
                                onClick={() => handlePlaceBid(calcutta.id)}
                                disabled={placeBidMutation.isPending}
                                data-testid={`button-place-bid-${calcutta.id}`}
                              >
                                Sponsor
                              </Button>
                            </div>
                            
                            {participantBids.length > 0 && (
                              <div className="text-xs text-gray-400">
                                {participantBids.length} offer(s) placed
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Season Predictions Component - Championship prediction markets
export default TournamentCalcutta;
