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

function GameOfTheMonthVoting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateVoteOpen, setIsCreateVoteOpen] = useState(false);

  const { data: currentVoting, isLoading } = useQuery<any>({
    queryKey: ["/api/game-voting/current"],
  });

  const { data: votingHistory } = useQuery<any>({
    queryKey: ["/api/game-voting/history"],
  });

  const submitVoteMutation = useMutation({
    mutationFn: ({ gameType, vote }: { gameType: string; vote: "up" | "down" }) => 
      apiRequest("/api/game-voting/vote", { 
        method: "POST", 
        body: JSON.stringify({ gameType, vote }) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-voting"] });
      toast({
        title: "Vote Recorded",
        description: "Your vote has been counted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  const createVotingMutation = useMutation({
    mutationFn: (votingData: any) => apiRequest("/api/game-voting", { 
      method: "POST", 
      body: JSON.stringify(votingData) 
    }),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create voting session",
        variant: "destructive",
      });
    },
  });

  const gameVariants = [
    { id: "money_ball", name: "Money Ball", description: "Cue ball lands on cash" },
    { id: "object_carom", name: "Object Ball Carom", description: "Hit object → carom cue ball" },
    { id: "kelly_pool", name: "Kelly Pool", description: "Numbers game with elimination" },
    { id: "speed_ball", name: "Speed Ball", description: "Timed shot challenges" },
    { id: "trick_shots", name: "Trick Shots", description: "Creative shot competitions" },
    { id: "bank_pool", name: "Bank Pool", description: "All shots must bank" },
  ];

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Game of the Month Voting
            </CardTitle>
            <CardDescription>
              Community votes on featured game variants
            </CardDescription>
          </div>
          <Dialog open={isCreateVoteOpen} onOpenChange={setIsCreateVoteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-voting">
                <Plus className="mr-2 h-4 w-4" />
                New Voting
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-green-400">Create Voting Session</DialogTitle>
                <DialogDescription>
                  Start a new Game of the Month voting period
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="votingTitle">Voting Title</Label>
                  <Input
                    id="votingTitle"
                    name="votingTitle"
                    required
                    placeholder="January 2025 Game of the Month"
                    className="bg-gray-800 border-gray-600"
                    data-testid="input-voting-title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateVoteOpen(false)}
                    data-testid="button-cancel-voting"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createVotingMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-voting"
                  >
                    {createVotingMutation.isPending ? "Creating..." : "Start Voting"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Voting */}
          {(currentVoting as any) && (
            <div className="p-4 bg-green-900/20 border border-green-700 rounded">
              <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Current Voting: {(currentVoting as any).title}
              </h3>
              <div className="grid gap-3">
                {gameVariants.map((game) => {
                  const votes = (currentVoting as any).votes?.[game.id] || { up: 0, down: 0 };
                  const totalVotes = votes.up + votes.down;
                  const percentage = totalVotes > 0 ? (votes.up / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-gray-400">{game.description}</div>
                        <div className="text-xs text-gray-500">
                          {votes.up} up • {votes.down} down • {percentage.toFixed(0)}% approval
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitVoteMutation.mutate({ gameType: game.id, vote: "up" })}
                          className="text-green-400 hover:bg-green-900/30"
                          data-testid={`button-vote-up-${game.id}`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitVoteMutation.mutate({ gameType: game.id, vote: "down" })}
                          className="text-red-400 hover:bg-red-900/30"
                          data-testid={`button-vote-down-${game.id}`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">
                  Voting ends: {new Date((currentVoting as any).endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Previous Winners */}
          {(votingHistory as any[])?.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Previous Winners
              </h3>
              <div className="space-y-2">
                {(votingHistory as any[]).slice(0, 5).map((winner: any) => (
                  <div key={winner.id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div>
                      <div className="font-medium">{winner.winningGame}</div>
                      <div className="text-sm text-gray-400">{winner.month}</div>
                    </div>
                    <Badge className="bg-yellow-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentVoting && (
            <div className="text-center py-8">
              <Vote className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-4">No active voting session</p>
              <Button
                onClick={() => setIsCreateVoteOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-start-voting"
              >
                Start Monthly Voting
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default GameOfTheMonthVoting;
