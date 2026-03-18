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

function PoolhallMatches() {
  const { toast } = useToast();
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);

  const { data: hallMatches, isLoading } = useQuery<any>({
    queryKey: ["/api/poolhall-matches"],
  });

  const createMatchMutation = useMutation({
    mutationFn: (matchData: any) => apiRequest("/api/poolhall-matches", { 
      method: "POST", 
      body: JSON.stringify(matchData) 
    }),
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create poolhall match",
        variant: "destructive",
      });
    },
  });

  const handleCreateMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const matchData = {
      homeHallName: formData.get("homeHallName"),
      awayHallName: formData.get("awayHallName"),
      homeHallId: formData.get("homeHallId"),
      awayHallId: formData.get("awayHallId"),
      format: formData.get("format"),
      entryFee: parseInt(formData.get("entryFee") as string) * 100,
      scheduledAt: formData.get("scheduledAt") ? new Date(formData.get("scheduledAt") as string) : null,
    };
    
    createMatchMutation.mutate(matchData);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Poolhall vs Poolhall Matches
            </CardTitle>
            <CardDescription>
              Hall rivalry matches and inter-venue competitions
            </CardDescription>
          </div>
          <Dialog open={isCreateMatchOpen} onOpenChange={setIsCreateMatchOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-hall-match">
                <Plus className="mr-2 h-4 w-4" />
                New Hall Match
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-green-400">Create Poolhall Match</DialogTitle>
                <DialogDescription>
                  Set up a competition between two pool halls
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="homeHallName">Home Hall Name</Label>
                    <Input
                      id="homeHallName"
                      name="homeHallName"
                      required
                      placeholder="Home pool hall"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-home-hall-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="awayHallName">Away Hall Name</Label>
                    <Input
                      id="awayHallName"
                      name="awayHallName"
                      required
                      placeholder="Away pool hall"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-away-hall-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="homeHallId">Home Hall ID</Label>
                    <Input
                      id="homeHallId"
                      name="homeHallId"
                      placeholder="Home hall operator ID"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-home-hall-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="awayHallId">Away Hall ID</Label>
                    <Input
                      id="awayHallId"
                      name="awayHallId"
                      placeholder="Away hall operator ID"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-away-hall-id"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="format">Match Format</Label>
                    <Select name="format" required>
                      <SelectTrigger className="bg-gray-800 border-gray-600" data-testid="select-match-format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="3v3_team">3v3 Team Battle (Coming Soon)</SelectItem>
                        <SelectItem value="singles_bracket">Singles Bracket</SelectItem>
                        <SelectItem value="mixed_format">Mixed Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      name="entryFee"
                      type="number"
                      min="50"
                      max="1000"
                      required
                      placeholder="200"
                      className="bg-gray-800 border-gray-600"
                      data-testid="input-hall-match-fee"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="scheduledAt">Match Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    className="bg-gray-800 border-gray-600"
                    data-testid="input-hall-match-datetime"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateMatchOpen(false)}
                    data-testid="button-cancel-hall-match"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMatchMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-hall-match"
                  >
                    {createMatchMutation.isPending ? "Creating..." : "Create Match"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-purple-900/20 border border-purple-700 rounded">
            <h3 className="font-semibold text-purple-400 mb-2">Hall Battle Rules</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Home hall provides venue and table conditions</li>
              <li>• Away hall brings their best team</li>
              <li>• Winner takes 70% of Prize Pool, runner-up gets 30%</li>
              <li>• Live streaming encouraged for bragging rights</li>
              <li>• Annual championship between top performing halls</li>
            </ul>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-400">Loading hall matches...</div>
          ) : (
            <div className="grid gap-4">
              {(hallMatches as any[])?.map((match: any) => (
                <div key={match.id} className="p-4 bg-gray-800 rounded border border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-lg">
                        {match.homeHallName} vs {match.awayHallName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {match.format} • ${(match.entryFee / 100).toFixed(0)} entry
                      </div>
                      {match.scheduledAt && (
                        <div className="text-xs text-gray-500">
                          {new Date(match.scheduledAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        <span className="text-blue-400">{match.homeScore || 0}</span>
                        <span className="text-gray-500 mx-2">-</span>
                        <span className="text-red-400">{match.awayScore || 0}</span>
                      </div>
                      <Badge variant={match.status === "active" ? "default" : "secondary"}>
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-400">
                  No hall battles scheduled
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PoolhallMatches;
