import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Globe, Building2, Users, UserPlus, Send, Mail,
  CheckCircle, Clock, TrendingUp, AlertTriangle, Layers
} from "lucide-react";

interface HallOwner {
  id: string;
  email: string;
  name?: string;
  hallName?: string;
  globalRole: string;
  accountStatus: string;
  createdAt: string;
}

export default function RegionalOperatorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteHallName, setInviteHallName] = useState("");
  const [inviteCity, setInviteCity] = useState("");

  const { data: myHalls = [] } = useQuery<HallOwner[]>({
    queryKey: ["/api/regional/my-halls"],
    retry: false,
  });

  const { data: regionStats } = useQuery({
    queryKey: ["/api/regional/stats"],
    retry: false,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; hallName: string; city: string }) =>
      apiRequest("/api/regional/invite-hall-owner", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: `Invite sent to ${inviteEmail}. They need Admin approval before gaining access.`,
      });
      setInviteEmail("");
      setInviteHallName("");
      setInviteCity("");
      queryClient.invalidateQueries({ queryKey: ["/api/regional/my-halls"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to send invitation.", variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-900/40 rounded-xl border border-purple-500/30">
            <Globe className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Regional Operator Dashboard</h1>
            <p className="text-gray-400 mt-1">Billiards Ladder — Regional Management</p>
          </div>
        </div>
        <Badge className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-4 py-2 text-sm font-semibold">
          <Globe className="h-4 w-4 mr-2 inline" /> REGIONAL OPERATOR
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pool Halls in Region", value: (regionStats as any)?.hallCount ?? myHalls.length, icon: Building2 },
          { label: "Active Players", value: (regionStats as any)?.playerCount ?? 0, icon: Users },
          { label: "Pending Approvals", value: (regionStats as any)?.pendingCount ?? 0, icon: Clock },
        ].map((s) => (
          <Card key={s.label} className="bg-gray-900/60 border border-gray-700/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-purple-400 opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="halls" className="space-y-6">
        <TabsList className="bg-gray-900/70 border border-gray-700/50 h-auto p-1">
          <TabsTrigger value="halls" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-300">
            My Hall Owners
          </TabsTrigger>
          <TabsTrigger value="invite" className="data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-300">
            Invite Hall Owner
          </TabsTrigger>
          <TabsTrigger value="region" className="data-[state=active]:bg-teal-900/50 data-[state=active]:text-teal-300">
            Region Overview
          </TabsTrigger>
        </TabsList>

        {/* My Halls Tab */}
        <TabsContent value="halls">
          <Card className="bg-gray-900/60 border border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-300 flex items-center gap-2">
                <Building2 className="h-5 w-5" /> Pool Halls in Your Region
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pool Hall Owners you've invited and their approval status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myHalls.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No hall owners yet. Use the Invite tab to add pool halls to your region.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myHalls.map((hall) => (
                    <div key={hall.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        <div>
                          <p className="font-semibold text-white">{hall.hallName || hall.name || hall.email}</p>
                          <p className="text-sm text-gray-400">{hall.email} • {hall.hallName}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${hall.accountStatus === "active" ? "bg-emerald-900/40 text-emerald-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                        {hall.accountStatus === "active" ? <CheckCircle className="h-3 w-3 mr-1 inline" /> : <Clock className="h-3 w-3 mr-1 inline" />}
                        {hall.accountStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Tab */}
        <TabsContent value="invite">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/60 border border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Invite Pool Hall Owner
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Invite a pool hall owner to join your region. They'll need Admin approval before accessing the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Owner's Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="hallowner@example.com"
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Pool Hall Name</Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={inviteHallName}
                      onChange={(e) => setInviteHallName(e.target.value)}
                      placeholder="e.g. Austin Billiards Club"
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">City</Label>
                  <Input
                    value={inviteCity}
                    onChange={(e) => setInviteCity(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail, hallName: inviteHallName, city: inviteCity })}
                  disabled={!inviteEmail || !inviteHallName || inviteMutation.isPending}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>

                <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-sm text-yellow-300 flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Admin must approve all new users before they gain platform access.</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Your Role in the Hierarchy</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 opacity-60">
                  <p className="text-yellow-300 text-sm font-semibold">↑ Founder / Admin</p>
                  <p className="text-gray-500 text-xs">Invited you. Has final approval on everything.</p>
                </div>
                <div className="p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
                  <p className="text-purple-300 text-sm font-semibold">→ You (Regional Operator)</p>
                  <p className="text-gray-400 text-xs">Manage your region. Invite Pool Hall Owners.</p>
                </div>
                <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 opacity-70">
                  <p className="text-blue-300 text-sm font-semibold">↓ Pool Hall Owners</p>
                  <p className="text-gray-500 text-xs">You invite these. They invite Local Operators.</p>
                </div>
                <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 opacity-60">
                  <p className="text-teal-300 text-sm font-semibold">↓↓ Local Operators</p>
                  <p className="text-gray-500 text-xs">Invited by Pool Hall Owners. Day-to-day ops.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Region Overview Tab */}
        <TabsContent value="region">
          <Card className="bg-gray-900/60 border border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-teal-300 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Region Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Total Halls", value: (regionStats as any)?.hallCount ?? 0 },
                  { label: "Active Players", value: (regionStats as any)?.playerCount ?? 0 },
                  { label: "Monthly Revenue", value: `$${(regionStats as any)?.revenue ?? 0}` },
                  { label: "Tournaments Run", value: (regionStats as any)?.tournamentCount ?? 0 },
                  { label: "Challenges Completed", value: (regionStats as any)?.challengeCount ?? 0 },
                  { label: "Avg Player Rating", value: (regionStats as any)?.avgRating ?? "N/A" },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-gray-800/40 rounded-xl text-center">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
