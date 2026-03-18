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

function SeasonPredictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPrediction, setSelectedPrediction] = useState<string>("");
  const [firstPlace, setFirstPlace] = useState<string>("");
  const [secondPlace, setSecondPlace] = useState<string>("");
  const [thirdPlace, setThirdPlace] = useState<string>("");

  // Fetch season predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery<any>({
    queryKey: ["/api/season-predictions"],
  });

  // Fetch players for prediction selection
  const { data: players } = useQuery<any>({
    queryKey: ["/api/players"],
  });

  // Fetch prediction entries
  const { data: entries } = useQuery<any>({
    queryKey: ["/api/prediction-entries"],
  });

  const submitPredictionMutation = useMutation({
    mutationFn: (entryData: any) => apiRequest("/api/prediction-entries", {
      method: "POST",
      body: JSON.stringify(entryData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prediction-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/season-predictions"] });
      toast({
        title: "Success",
        description: "Your season prediction has been submitted!",
      });
      setFirstPlace("");
      setSecondPlace("");
      setThirdPlace("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit prediction",
        variant: "destructive",
      });
    },
  });

  const handleSubmitPrediction = () => {
    if (!selectedPrediction || !firstPlace || !secondPlace || !thirdPlace) {
      toast({
        title: "Error",
        description: "Please select a prediction category and all three places",
        variant: "destructive",
      });
      return;
    }

    if (firstPlace === secondPlace || firstPlace === thirdPlace || secondPlace === thirdPlace) {
      toast({
        title: "Error",
        description: "Please select different players for each position",
        variant: "destructive",
      });
      return;
    }

    const prediction = predictions?.find((p: any) => p.id === selectedPrediction);
    if (!prediction) return;

    submitPredictionMutation.mutate({
      predictionId: selectedPrediction,
      predictorId: "current-user-id", // Replace with actual user ID
      firstPlacePick: firstPlace,
      secondPlacePick: secondPlace,
      thirdPlacePick: thirdPlace,
      entryFee: prediction.entryFee,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPlayerName = (playerId: string) => {
    const player = players?.find((p: any) => p.id === playerId);
    return player ? player.name : playerId;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Season Championship Predictions
          </CardTitle>
          <CardDescription>
            Predict the top 3 players by wins at season end. Must have 3+ matches played to qualify.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Predictions */}
          <div className="grid gap-4">
            {predictionsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading predictions...</div>
            ) : predictions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No active season predictions available.
              </div>
            ) : (
              predictions?.filter((p: any) => p.predictionsOpen)?.map((prediction: any) => (
                <Card key={prediction.id} className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-lg">{prediction.name}</CardTitle>
                    <CardDescription>{prediction.description}</CardDescription>
                    <div className="flex justify-between text-sm">
                      <span>Entry Fee: {formatCurrency(prediction.entryFee)}</span>
                      <span>Prize Pool: {formatCurrency(prediction.prizePool || 0)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setSelectedPrediction(prediction.id)}
                      variant={selectedPrediction === prediction.id ? "default" : "outline"}
                      data-testid={`button-select-prediction-${prediction.id}`}
                    >
                      {selectedPrediction === prediction.id ? "Selected" : "Make Prediction"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Prediction Form */}
          {selectedPrediction && (
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-green-400">Make Your Prediction</CardTitle>
                <CardDescription>
                  Select the top 3 players you think will have the most wins this season
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>1st Place (70% Performance Bonus)</Label>
                    <Select value={firstPlace} onValueChange={setFirstPlace}>
                      <SelectTrigger data-testid="select-first-place">
                        <SelectValue placeholder="Select player..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>2nd Place (20% Performance Bonus)</Label>
                    <Select value={secondPlace} onValueChange={setSecondPlace}>
                      <SelectTrigger data-testid="select-second-place">
                        <SelectValue placeholder="Select player..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>3rd Place (10% Performance Bonus)</Label>
                    <Select value={thirdPlace} onValueChange={setThirdPlace}>
                      <SelectTrigger data-testid="select-third-place">
                        <SelectValue placeholder="Select player..." />
                      </SelectTrigger>
                      <SelectContent>
                        {players?.map((player: any) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitPrediction}
                  disabled={submitPredictionMutation.isPending || !firstPlace || !secondPlace || !thirdPlace}
                  className="w-full"
                  data-testid="button-submit-prediction"
                >
                  {submitPredictionMutation.isPending ? "Submitting..." : "Submit Prediction"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Entries */}
          {entries && entries.length > 0 && (
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-green-400">Recent Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.slice(0, 5).map((entry: any) => (
                    <div key={entry.id} className="flex justify-between text-sm border-b border-gray-700 pb-2">
                      <span className="text-gray-400">Predictor</span>
                      <span>
                        1st: {getPlayerName(entry.firstPlacePick)} | 
                        2nd: {getPlayerName(entry.secondPlacePick)} | 
                        3rd: {getPlayerName(entry.thirdPlacePick)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default SeasonPredictions;
