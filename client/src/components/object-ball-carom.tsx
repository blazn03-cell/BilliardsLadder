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

function ObjectBallCarom() {
  const { toast } = useToast();
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  const { data: caromGames, isLoading } = useQuery<any>({
    queryKey: ["/api/object-carom-games"],
  });

  const createGameMutation = useMutation({
    mutationFn: (gameData: any) => apiRequest("/api/object-carom-games", { 
      method: "POST", 
      body: JSON.stringify(gameData) 
    }),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create Object Ball Carom game",
        variant: "destructive",
      });
    },
  });

  const handleCreateGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const gameData = {
      player1Id: formData.get("player1Id"),
      player2Id: formData.get("player2Id"),
      entryFee: parseInt(formData.get("entryFee") as string) * 100, // Convert to cents
      targetBalls: parseInt(formData.get("targetBalls") as string),
      description: formData.get("description"),
    };
    
    createGameMutation.mutate(gameData);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Object Ball Carom
            </CardTitle>
            <CardDescription>
              Hit object ball → carom cue ball challenge
            </CardDescription>
          </div>
          <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-carom-game">
                <Plus className="mr-2 h-4 w-4" />
                New Game
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-green-400">Create Object Ball Carom Challenge</DialogTitle>
                <DialogDescription>
                  Set up a precision carom shot challenge
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="player1Id">Player 1</Label>
                    <Input
                      id="player1Id"
                      name="player1Id"
                      required
                      placeholder="Player 1 ID"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-player1-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="player2Id">Player 2</Label>
                    <Input
                      id="player2Id"
                      name="player2Id"
                      required
                      placeholder="Player 2 ID"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-player2-id"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      name="entryFee"
                      type="number"
                      min="5"
                      max="500"
                      required
                      placeholder="50"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-entry-fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetBalls">Target Balls</Label>
                    <Input
                      id="targetBalls"
                      name="targetBalls"
                      type="number"
                      min="3"
                      max="15"
                      defaultValue="5"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-target-balls"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Game Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Carom challenge details..."
                    className="bg-gray-800 border-gray-600"
                    data-testid="input-game-description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateGameOpen(false)}
                    data-testid="button-cancel-carom-game"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createGameMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-carom-game"
                  >
                    {createGameMutation.isPending ? "Creating..." : "Create Challenge"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
            <h3 className="font-semibold text-blue-400 mb-2">Game Rules</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Player shoots object ball first</li>
              <li>• Cue ball must carom off object ball to hit target</li>
              <li>• Both players alternate attempts</li>
              <li>• First to complete required caroms wins Prize Pool</li>
              <li>• Failed attempts result in ball-in-hand for opponent</li>
            </ul>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-400">Loading carom games...</div>
          ) : (
            <div className="grid gap-4">
              {(caromGames as any[])?.map((game: any) => (
                <div key={game.id} className="p-4 bg-gray-800 rounded border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{game.player1Name} vs {game.player2Name}</div>
                      <div className="text-sm text-gray-400">
                        ${(game.entryFee / 100).toFixed(0)} entry • {game.targetBalls} target balls
                      </div>
                    </div>
                    <Badge variant={game.status === "active" ? "default" : "secondary"}>
                      {game.status}
                    </Badge>
                  </div>
                </div>
              )) || []}
              {(!caromGames || (caromGames as any[])?.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  No Object Ball Carom games active
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ObjectBallCarom;
