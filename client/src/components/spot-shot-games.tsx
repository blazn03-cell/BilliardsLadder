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

function SpotShotGames() {
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState("classic");

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Spot Shot Challenges
        </CardTitle>
        <CardDescription>
          Precision spot shot variations for skilled players
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Spot Shot Variant Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={selectedVariant === "classic" ? "default" : "outline"}
              onClick={() => setSelectedVariant("classic")}
              className={selectedVariant === "classic" ? "bg-green-600" : ""}
              data-testid="button-classic-spot"
            >
              Classic Spot
            </Button>
            <Button
              variant={selectedVariant === "bank" ? "default" : "outline"}
              onClick={() => setSelectedVariant("bank")}
              className={selectedVariant === "bank" ? "bg-green-600" : ""}
              data-testid="button-bank-spot"
            >
              Bank Spot
            </Button>
            <Button
              variant={selectedVariant === "call-pocket" ? "default" : "outline"}
              onClick={() => setSelectedVariant("call-pocket")}
              className={selectedVariant === "call-pocket" ? "bg-green-600" : ""}
              data-testid="button-call-pocket-spot"
            >
              Call Pocket
            </Button>
            <Button
              variant={selectedVariant === "rotation" ? "default" : "outline"}
              onClick={() => setSelectedVariant("rotation")}
              className={selectedVariant === "rotation" ? "bg-green-600" : ""}
              data-testid="button-rotation-spot"
            >
              Rotation Spot
            </Button>
          </div>

          {/* Game Rules Display */}
          {selectedVariant === "classic" && (
            <div className="p-4 bg-green-900/20 border border-green-700 rounded">
              <h3 className="font-semibold text-green-400 mb-2">The Spot Shot</h3>
              <p className="text-gray-300 mb-3">Ball on the dot and shoot any corner</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Place object ball on the foot spot (dot)</li>
                <li>• Cue ball can be placed anywhere behind the head string</li>
                <li>• Must pocket the spotted ball in any corner pocket</li>
                <li>• Both players alternate attempts</li>
                <li>• First to make the shot wins the challenge</li>
              </ul>
            </div>
          )}

          {selectedVariant === "bank" && (
            <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
              <h3 className="font-semibold text-blue-400 mb-2">Bank Spot Shot</h3>
              <p className="text-gray-300 mb-3">Ball must be banked off a cushion before being pocketed</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Place object ball on the foot spot (dot)</li>
                <li>• Ball must hit at least one cushion before going in pocket</li>
                <li>• Can be pocketed in any corner pocket after banking</li>
                <li>• Direct shots (no bank) are automatic misses</li>
                <li>• Requires advanced cue ball control and angles</li>
              </ul>
            </div>
          )}

          {selectedVariant === "call-pocket" && (
            <div className="p-4 bg-purple-900/20 border border-purple-700 rounded">
              <h3 className="font-semibold text-purple-400 mb-2">Call-the-Pocket Spot Shot</h3>
              <p className="text-gray-300 mb-3">Players must call the exact pocket before shooting</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Place object ball on the foot spot (dot)</li>
                <li>• Player must declare which corner pocket before shooting</li>
                <li>• Ball must go in the called pocket to count</li>
                <li>• Wrong pocket or scratch is automatic miss</li>
                <li>• Strategic pocket selection is key to victory</li>
              </ul>
            </div>
          )}

          {selectedVariant === "rotation" && (
            <div className="p-4 bg-orange-900/20 border border-orange-700 rounded">
              <h3 className="font-semibold text-orange-400 mb-2">Rotation Spot Shot</h3>
              <p className="text-gray-300 mb-3">Players move the spotted ball to different spots for tougher shots</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Start with ball on foot spot, then rotate positions</li>
                <li>• Move to side spots (left and right)</li>
                <li>• Progress to head spot for maximum difficulty</li>
                <li>• Must make from each position to advance</li>
                <li>• First to complete all spots wins the challenge</li>
              </ul>
            </div>
          )}

          {/* Create Challenge Section */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-300 mb-4">Start a Spot Shot Challenge</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-400">Classic precision shooting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-sm text-gray-400">Bank shot mastery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📞</div>
                <div className="text-sm text-gray-400">Called pocket accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-sm text-gray-400">Progressive difficulty</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-spot-challenge">
                <Plus className="mr-2 h-4 w-4" />
                Create Spot Shot Challenge
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Tournament Calcutta Component - Bidding on tournament participants
export default SpotShotGames;
