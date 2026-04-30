import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, Plus, Minus, Loader2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AdjustmentRow = {
  id: string;
  userId: string;
  delta: number;
  balanceAfter: number;
  metadata: { adminId?: string; note?: string | null } | null;
  createdAt: string;
  targetEmail: string | null;
  targetName: string | null;
};

type AdjustResponse = {
  ok: true;
  target: { id: string; email: string | null; name: string | null };
  delta: number;
  state: { rackPoints: number; streakDays: number; streakLastDay: string | null };
};

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function RackPointsAdminPanel() {
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");

  const { data: adjustments, isLoading } = useQuery<AdjustmentRow[]>({
    queryKey: ["/api/admin/rack-points/adjustments"],
    staleTime: 15 * 1000,
  });

  const adjustMutation = useMutation<
    AdjustResponse,
    Error,
    { userId: string; delta: number; note?: string }
  >({
    mutationFn: async (body) => {
      // apiRequest returns parsed JSON directly, not a Response.
      return (await apiRequest(
        "POST",
        "/api/admin/rack-points/adjust",
        body,
      )) as AdjustResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Adjustment applied",
        description: `${data.delta > 0 ? "+" : ""}${data.delta} for ${
          data.target.name || data.target.email || data.target.id
        } — new balance ${data.state.rackPoints}`,
      });
      setUserId("");
      setDelta("");
      setNote("");
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/rack-points/adjustments"],
      });
    },
    onError: (err: any) => {
      toast({
        title: "Adjustment failed",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = userId.trim();
    const parsedDelta = Number(delta);

    if (!trimmedId) {
      toast({ title: "User ID required", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(parsedDelta) || !Number.isInteger(parsedDelta)) {
      toast({ title: "Delta must be a whole number", variant: "destructive" });
      return;
    }
    if (parsedDelta === 0) {
      toast({ title: "Delta cannot be zero", variant: "destructive" });
      return;
    }
    if (Math.abs(parsedDelta) > 100_000) {
      toast({
        title: "Delta exceeds ±100,000",
        description: "Split large adjustments into multiple smaller ones.",
        variant: "destructive",
      });
      return;
    }

    adjustMutation.mutate({
      userId: trimmedId,
      delta: parsedDelta,
      note: note.trim() || undefined,
    });
  };

  const applyPreset = (n: number) => {
    setDelta(String(n));
  };

  const isPending = adjustMutation.isPending;

  return (
    <div className="space-y-6" data-testid="panel-rack-points-admin">
      <Card className="bg-black/60 border-emerald-600/30">
        <CardHeader>
          <CardTitle className="text-emerald-400 flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            Adjust Rack Points
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manually grant or revoke points for a player. Every adjustment is
            recorded with your admin ID and an optional note.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="adjust-user-id">Target user ID</Label>
                <Input
                  id="adjust-user-id"
                  placeholder="e.g. user_abc123"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="bg-black/40 border-emerald-600/40"
                  data-testid="input-adjust-user-id"
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="adjust-delta">Delta (signed)</Label>
                <Input
                  id="adjust-delta"
                  type="number"
                  step="1"
                  placeholder="+50 or -20"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  className="bg-black/40 border-emerald-600/40"
                  data-testid="input-adjust-delta"
                  disabled={isPending}
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {[10, 50, 100, -10, -50].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-emerald-600/30 text-emerald-300 hover:bg-emerald-600/10"
                      onClick={() => applyPreset(preset)}
                      disabled={isPending}
                      data-testid={`button-preset-${preset > 0 ? "plus" : "minus"}-${Math.abs(preset)}`}
                    >
                      {preset > 0 ? "+" : ""}
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="adjust-note">Note (optional, max 500 chars)</Label>
              <Textarea
                id="adjust-note"
                placeholder="Why this adjustment? (visible only to admins via the audit log)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-black/40 border-emerald-600/40 min-h-[60px]"
                maxLength={500}
                data-testid="textarea-adjust-note"
                disabled={isPending}
              />
            </div>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isPending}
              data-testid="button-submit-adjustment"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  {Number(delta) < 0 ? (
                    <Minus className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Apply adjustment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-emerald-600/30">
        <CardHeader>
          <CardTitle className="text-emerald-400 flex items-center">
            <History className="w-5 h-5 mr-2" />
            Recent admin adjustments
          </CardTitle>
          <CardDescription className="text-gray-300">
            Last 25 manual rack-points adjustments across all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex items-center gap-2 text-gray-400 py-4"
              data-testid="status-adjustments-loading"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : !adjustments || adjustments.length === 0 ? (
            <div
              className="text-gray-400 italic py-4"
              data-testid="status-adjustments-empty"
            >
              No admin adjustments have been made yet.
            </div>
          ) : (
            <ScrollArea className="h-[360px] pr-2">
              <div className="space-y-2">
                {adjustments.map((row) => {
                  const positive = row.delta > 0;
                  return (
                    <div
                      key={row.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-emerald-600/15 bg-black/40 px-3 py-2"
                      data-testid={`row-adjustment-${row.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-100 truncate">
                          {row.targetName || row.targetEmail || row.userId}
                        </div>
                        <div
                          className="text-xs text-gray-500 truncate"
                          data-testid={`text-adjustment-userid-${row.id}`}
                        >
                          {row.userId}
                        </div>
                        {row.metadata?.note ? (
                          <div className="text-xs text-gray-300 mt-1 italic line-clamp-2">
                            “{row.metadata.note}”
                          </div>
                        ) : null}
                        <div className="text-[10px] text-gray-500 mt-1">
                          {formatRelativeTime(row.createdAt)} · admin{" "}
                          {row.metadata?.adminId
                            ? row.metadata.adminId.slice(0, 8)
                            : "?"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge
                          variant="outline"
                          className={
                            positive
                              ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                              : "border-red-500/40 text-red-300 bg-red-500/10"
                          }
                          data-testid={`badge-adjustment-delta-${row.id}`}
                        >
                          {positive ? "+" : ""}
                          {row.delta}
                        </Badge>
                        <div className="text-[10px] text-gray-500 mt-1">
                          bal {row.balanceAfter}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
