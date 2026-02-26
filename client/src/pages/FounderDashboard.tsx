import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, Users, Shield, Settings, TrendingUp, DollarSign,
  UserPlus, CheckCircle, XCircle, Clock, Building2,
  Globe, BarChart2, Mail, Send, AlertTriangle, Layers,
  ArrowRight, Percent, CreditCard, Trophy, Star, Target
} from "lucide-react";

const MONEY_FLOW = {
  founderCut: 23,
  operatorCut: 33,
  playerPrizePot: 43,
  platformOps: 1,
};

const COMMISSION_RATES: Record<string, number> = {
  "Non-Member": 30,
  "Rookie Member": 18,
  "Standard Member": 24,
  "Premium Member": 34,
};

const MEMBERSHIP_PRICING = [
  { label: "Rookie", price: 20, perks: ["Reduced challenger fees", "Rookie ladder access"] },
  { label: "Standard", price: 30, perks: ["8ft & 9ft ladder access", "Challenge discounts", "Priority queue"] },
  { label: "Premium", price: 60, perks: ["All ladders", "Tournament seeding", "Coaching credits"] },
];

const OPERATOR_TIERS = [
  { label: "Small Hall",  price: 199, players: "Up to 15" },
  { label: "Medium Hall", price: 299, players: "Up to 25" },
  { label: "Large Hall",  price: 399, players: "Up to 40" },
  { label: "Mega Hall",   price: 799, players: "Unlimited" },
];

const ROLE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  OWNER:              { label: "Founder",         color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
  REGIONAL_OPERATOR:  { label: "Regional Op",     color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.3)" },
  POOL_HALL_OWNER:    { label: "Hall Owner",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)" },
  LOCAL_OPERATOR:     { label: "Local Operator",  color: "#14b8a6", bg: "rgba(20,184,166,0.1)",  border: "rgba(20,184,166,0.3)" },
  OPERATOR:           { label: "Operator",        color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)" },
  PLAYER:             { label: "Player",          color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)" },
  STAFF:              { label: "Staff",           color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)" },
  TRUSTEE:            { label: "Trustee",         color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)" },
};

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] || { label: role, color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.3)" };
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:4,
      background:meta.bg,border:`1px solid ${meta.border}`,color:meta.color,
      fontSize:11,fontWeight:600,letterSpacing:0.5
    }}>{meta.label}</span>
  );
}

function StatusDot({ status }: { status: string }) {
  const c: Record<string,string> = { active:"#22c55e", pending:"#f59e0b", rejected:"#ef4444", suspended:"#6b7280" };
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:c[status]||"#9ca3af"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:c[status]||"#9ca3af",display:"inline-block"}}/>
      {status.charAt(0).toUpperCase()+status.slice(1)}
    </span>
  );
}

interface PlatformUser {
  id: string; email: string; name?: string; nickname?: string;
  globalRole: string; accountStatus: string; hallName?: string; city?: string;
}

export default function FounderDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [exampleAmount, setExampleAmount] = useState(100);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("REGIONAL_OPERATOR");
  const [inviteRegion, setInviteRegion] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");

  const { data: pendingApprovals = [] } = useQuery<PlatformUser[]>({ queryKey:["/api/admin/pending-approvals"], retry:false });
  const { data: allUsers = [] } = useQuery<PlatformUser[]>({ queryKey:["/api/admin/users"], retry:false });
  const { data: stats } = useQuery<any>({ queryKey:["/api/admin/stats"], retry:false });

  const approveMutation = useMutation({
    mutationFn:(id:string)=>apiRequest(`/api/admin/approve-user/${id}`,{method:"POST"}),
    onSuccess:()=>{ toast({title:"Approved ✓"}); queryClient.invalidateQueries({queryKey:["/api/admin/pending-approvals"]}); queryClient.invalidateQueries({queryKey:["/api/admin/users"]}); },
    onError:()=>toast({title:"Error",variant:"destructive"}),
  });
  const rejectMutation = useMutation({
    mutationFn:(id:string)=>apiRequest(`/api/admin/reject-user/${id}`,{method:"POST"}),
    onSuccess:()=>{ toast({title:"Rejected"}); queryClient.invalidateQueries({queryKey:["/api/admin/pending-approvals"]}); },
    onError:()=>toast({title:"Error",variant:"destructive"}),
  });
  const inviteMutation = useMutation({
    mutationFn:(data:any)=>apiRequest("/api/admin/invite-operator",{method:"POST",body:JSON.stringify(data)}),
    onSuccess:(_,v)=>{ toast({title:"Invite Sent ✓",description:`${v.email} will receive the invite.`}); setInviteEmail(""); setInviteRegion(""); },
    onError:()=>toast({title:"Error",variant:"destructive"}),
  });

  const pending = Array.isArray(pendingApprovals) ? pendingApprovals : [];
  const users = Array.isArray(allUsers) ? allUsers : [];
  const pendingCount = pending.length;

  const roleGroups = {
    all:       users,
    pending:   pending,
    operators: users.filter(u=>["REGIONAL_OPERATOR","POOL_HALL_OWNER","LOCAL_OPERATOR","OPERATOR"].includes(u.globalRole)),
    players:   users.filter(u=>u.globalRole==="PLAYER"),
    staff:     users.filter(u=>["STAFF","TRUSTEE"].includes(u.globalRole)),
  };

  const visibleUsers = (roleGroups[filterRole as keyof typeof roleGroups] || users).filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name||"").toLowerCase().includes(search.toLowerCase()) ||
    (u.hallName||"").toLowerCase().includes(search.toLowerCase())
  );

  const founderGet  = (exampleAmount * MONEY_FLOW.founderCut / 100).toFixed(2);
  const operatorGet = (exampleAmount * MONEY_FLOW.operatorCut / 100).toFixed(2);
  const prizeGet    = (exampleAmount * MONEY_FLOW.playerPrizePot / 100).toFixed(2);
  const opsGet      = (exampleAmount * MONEY_FLOW.platformOps / 100).toFixed(2);
  const flowItems = [
    { label:"You (Founder)", pct:MONEY_FLOW.founderCut, amount:founderGet, color:"#f59e0b", desc:"Your share from every transaction" },
    { label:"Pool Hall Operators", pct:MONEY_FLOW.operatorCut, amount:operatorGet, color:"#3b82f6", desc:"Split among operators at that location" },
    { label:"Player Prize Pool", pct:MONEY_FLOW.playerPrizePot, amount:prizeGet, color:"#22c55e", desc:"Season pot paid out to ladder winners" },
    { label:"Platform Ops", pct:MONEY_FLOW.platformOps, amount:opsGet, color:"#6b7280", desc:"Stripe fees, server, maintenance" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
            <Crown className="h-7 w-7 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Founder Control Panel</h1>
            <p className="text-gray-400 text-sm mt-0.5">Billiards Ladder · Full Platform Authority</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
              <AlertTriangle className="h-4 w-4" />{pendingCount} awaiting approval
            </div>
          )}
          <Badge className="px-3 py-1.5 bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 text-xs">
            <Crown className="h-3 w-3 mr-1" /> FOUNDER
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:"Total Users", value:users.length||stats?.totalUsers||0, icon:Users, color:"#22c55e" },
          { label:"Pending Approvals", value:pendingCount, icon:Clock, color:"#f59e0b", alert:pendingCount>0 },
          { label:"Active Operators", value:stats?.operators||0, icon:Building2, color:"#3b82f6" },
          { label:"Revenue (MTD)", value:`$${stats?.revenue?.toLocaleString()||"0"}`, icon:DollarSign, color:"#f59e0b" },
        ].map(s=>(
          <Card key={s.label} className={`border ${(s as any).alert?"border-yellow-500/40 bg-yellow-900/10":"border-gray-700/50 bg-gray-900/60"}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">{s.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
                </div>
                <s.icon className="h-7 w-7 opacity-60" style={{color:s.color}} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="money" className="space-y-6">
        <TabsList className="bg-gray-900/70 border border-gray-700/50 flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="money" className="data-[state=active]:bg-yellow-900/50 data-[state=active]:text-yellow-300 text-xs md:text-sm">💰 Money Flow</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-900/50 data-[state=active]:text-emerald-300 text-xs md:text-sm relative">
            👥 Users & Roles
            {pendingCount>0&&<span className="ml-1.5 bg-red-600 text-white text-xs px-1 rounded-full">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="invite" className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-300 text-xs md:text-sm">✉️ Invite</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 text-xs md:text-sm">⚙️ Settings</TabsTrigger>
        </TabsList>

        {/* ── MONEY FLOW TAB ── */}
        <TabsContent value="money" className="space-y-6">
          {/* Main split */}
          <Card className="bg-gray-900/60 border border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-yellow-300 flex items-center gap-2">
                <DollarSign className="h-5 w-5"/>Revenue Split — How Every Dollar Is Divided
              </CardTitle>
              <CardDescription className="text-gray-400">Applied to every challenge fee, tournament entry, and commission collected.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-5 p-3 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
                <label className="text-emerald-300 text-sm whitespace-nowrap">Test amount: $</label>
                <Input type="number" value={exampleAmount} onChange={e=>setExampleAmount(Number(e.target.value)||0)} className="w-28 bg-black/40 border-emerald-500/30 text-white text-center h-8" />
                <span className="text-gray-400 text-xs">→ see the split below</span>
              </div>
              <div className="space-y-4">
                {flowItems.map(item=>(
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm font-medium">{item.label}</span>
                      <span className="flex gap-3 items-center">
                        <span className="text-gray-500 text-xs">{item.pct}%</span>
                        <span className="font-bold text-sm" style={{color:item.color}}>${item.amount}</span>
                      </span>
                    </div>
                    <div className="h-8 bg-gray-800/60 rounded-lg overflow-hidden">
                      <div className="h-full rounded-lg flex items-center pl-3 transition-all duration-500"
                        style={{width:`${item.pct}%`,background:`${item.color}20`,borderLeft:`3px solid ${item.color}`}}>
                        <span className="text-xs font-semibold" style={{color:item.color}}>{item.pct}%</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-800/40 rounded-lg flex justify-between border border-gray-700/40">
                <span className="text-gray-400 text-sm">Total (must = 100%)</span>
                <span className="text-white font-bold">{MONEY_FLOW.founderCut+MONEY_FLOW.operatorCut+MONEY_FLOW.playerPrizePot+MONEY_FLOW.platformOps}% ✓</span>
              </div>
            </CardContent>
          </Card>

          {/* Commission by tier */}
          <Card className="bg-gray-900/60 border border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2"><Percent className="h-5 w-5"/>Commission Rates by Player Tier</CardTitle>
              <CardDescription className="text-gray-400">% charged on challenge fees. Goes through the 23/33/43/1 split above.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(COMMISSION_RATES).map(([tier,rate])=>(
                  <div key={tier} className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/40 text-center">
                    <p className="text-gray-400 text-xs mb-2">{tier}</p>
                    <p className="text-2xl font-bold text-white">{rate}%</p>
                    <p className="text-gray-500 text-xs mt-1">of challenge fee</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Player membership */}
            <Card className="bg-gray-900/60 border border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2 text-base"><CreditCard className="h-4 w-4"/>Player Memberships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MEMBERSHIP_PRICING.map(m=>(
                  <div key={m.label} className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-semibold text-sm">{m.label}</span>
                      <span className="text-emerald-400 font-bold text-sm">${m.price}/mo</span>
                    </div>
                    {m.perks.map(p=>(
                      <div key={p} className="flex items-center gap-2 text-gray-400 text-xs">
                        <CheckCircle className="h-3 w-3 text-emerald-500"/>
                        {p}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="p-2 bg-gray-800/20 rounded text-xs text-gray-500">
                  $60 challenger fee: ONLY for Standard/Premium subscribers. Hidden from Rookie section. ✓
                </div>
              </CardContent>
            </Card>
            {/* Operator tiers */}
            <Card className="bg-gray-900/60 border border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-teal-300 flex items-center gap-2 text-base"><Building2 className="h-4 w-4"/>Operator Subscriptions</CardTitle>
                <CardDescription className="text-gray-400 text-xs">Monthly SaaS fee paid by each pool hall — separate from transaction split.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {OPERATOR_TIERS.map(t=>(
                  <div key={t.label} className="flex justify-between p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                    <div>
                      <p className="text-white text-sm font-medium">{t.label}</p>
                      <p className="text-gray-500 text-xs">{t.players} players</p>
                    </div>
                    <span className="text-teal-300 font-bold">${t.price}<span className="text-gray-500 text-xs">/mo</span></span>
                  </div>
                ))}
                <div className="p-2 bg-teal-900/10 border border-teal-500/10 rounded text-xs text-teal-400">
                  These fees go directly to you (Founder). Not subject to the 23/33/43/1 split.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── USERS TAB ── */}
        <TabsContent value="users" className="space-y-6">
          {/* Role summary */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              {label:"Founders",    count:users.filter(u=>u.globalRole==="OWNER").length,         color:"#f59e0b"},
              {label:"Regional",    count:users.filter(u=>u.globalRole==="REGIONAL_OPERATOR").length, color:"#a855f7"},
              {label:"Hall Owners", count:users.filter(u=>u.globalRole==="POOL_HALL_OWNER").length,   color:"#3b82f6"},
              {label:"Local Ops",   count:users.filter(u=>["LOCAL_OPERATOR","OPERATOR"].includes(u.globalRole)).length, color:"#14b8a6"},
              {label:"Players",     count:users.filter(u=>u.globalRole==="PLAYER").length,         color:"#22c55e"},
              {label:"Staff",       count:users.filter(u=>["STAFF","TRUSTEE"].includes(u.globalRole)).length, color:"#f97316"},
            ].map(s=>(
              <Card key={s.label} className="bg-gray-900/60 border border-gray-700/50">
                <CardContent className="pt-3 pb-3 text-center">
                  <p className="text-xl font-bold text-white">{s.count}</p>
                  <p className="text-xs mt-0.5" style={{color:s.color}}>{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending approvals */}
          {pendingCount > 0 && (
            <Card className="bg-yellow-900/10 border border-yellow-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-300 flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4"/> {pendingCount} Pending Approval{pendingCount>1?"s":""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pending.map(u=>(
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/40">
                    <div>
                      <p className="text-white text-sm font-medium">{u.name||u.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-gray-400 text-xs">{u.email}</p>
                        <RoleBadge role={u.globalRole}/>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={()=>approveMutation.mutate(u.id)} className="bg-emerald-700 hover:bg-emerald-600 h-7 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1"/>Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={()=>rejectMutation.mutate(u.id)} className="h-7 text-xs">
                        <XCircle className="h-3 w-3 mr-1"/>Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Filter & search */}
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {[
                {key:"all",label:`All (${users.length})`},
                {key:"pending",label:`Pending (${pendingCount})`},
                {key:"operators",label:"Operators"},
                {key:"players",label:"Players"},
                {key:"staff",label:"Staff"},
              ].map(f=>(
                <button key={f.key} onClick={()=>setFilterRole(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterRole===f.key?"bg-gray-600 text-white":"bg-gray-800/60 text-gray-400 hover:text-white"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <Input placeholder="Search email, name, hall..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-64 bg-gray-800/50 border-gray-600 text-white h-8 text-xs"/>
          </div>

          {/* User list */}
          <Card className="bg-gray-900/60 border border-gray-700/50">
            <CardContent className="pt-4">
              {visibleUsers.length===0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30"/>
                  <p className="text-sm">No users found. Data loads from your API.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {visibleUsers.map(u=>(
                    <div key={u.id} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700/60 flex items-center justify-center text-xs text-gray-300 font-bold">
                          {(u.name||u.email)?.[0]?.toUpperCase()||"?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{u.name||"—"}</p>
                            {u.nickname&&<span className="text-gray-500 text-xs">"{u.nickname}"</span>}
                          </div>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                          {u.hallName&&<p className="text-blue-400 text-xs">{u.hallName}{u.city?`, ${u.city}`:""}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <RoleBadge role={u.globalRole}/>
                        <StatusDot status={u.accountStatus||"active"}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── INVITE TAB ── */}
        <TabsContent value="invite">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/60 border border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2 text-base"><UserPlus className="h-5 w-5"/>Invite to Hierarchy</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  You invite Regional Operators. They invite Hall Owners. Hall Owners invite Local Operators. All require your final approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wide">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <Input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="operator@example.com"
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white"/>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wide">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="REGIONAL_OPERATOR">🌐 Regional Operator</SelectItem>
                      <SelectItem value="POOL_HALL_OWNER">🏢 Pool Hall Owner</SelectItem>
                      <SelectItem value="LOCAL_OPERATOR">🎱 Local Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300 text-xs uppercase tracking-wide">Region / Area</Label>
                  <Input value={inviteRegion} onChange={e=>setInviteRegion(e.target.value)} placeholder="e.g. Texas, Southwest USA"
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white"/>
                </div>
                <Button onClick={()=>inviteMutation.mutate({email:inviteEmail,role:inviteRole,region:inviteRegion})}
                  disabled={!inviteEmail||inviteMutation.isPending} className="w-full bg-purple-700 hover:bg-purple-600">
                  <Send className="h-4 w-4 mr-2"/>
                  {inviteMutation.isPending?"Sending...":"Send Invitation"}
                </Button>
                <div className="p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-xs text-yellow-300 flex gap-2">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5"/>
                  Invited users land in Pending Approvals. You must approve them before they gain any access.
                </div>
              </CardContent>
            </Card>

            {/* Hierarchy tree */}
            <div>
              <h3 className="text-white font-semibold mb-4">Access Chain</h3>
              <div className="space-y-2">
                {[
                  {role:"OWNER",            desc:"You — approve everyone, invite regional ops",     indent:0},
                  {role:"REGIONAL_OPERATOR",desc:"Manages a region — invites Hall Owners",          indent:20},
                  {role:"POOL_HALL_OWNER",  desc:"Owns venue — invites Local Operators",            indent:40},
                  {role:"LOCAL_OPERATOR",   desc:"Day-to-day ops — runs events & players",          indent:60},
                  {role:"PLAYER",           desc:"Compete, climb the ladder, win prizes",           indent:80},
                ].map(item=>{
                  const meta = ROLE_META[item.role]||{label:item.role,color:"#9ca3af",bg:"rgba(156,163,175,0.1)",border:"rgba(156,163,175,0.3)"};
                  return (
                    <div key={item.role} className="flex items-start gap-2" style={{paddingLeft:item.indent}}>
                      {item.indent>0&&<div style={{width:12,height:1,background:"rgba(107,114,128,0.5)",marginTop:16,flexShrink:0}}/>}
                      <div className="p-3 rounded-lg flex-1" style={{background:meta.bg,border:`1px solid ${meta.border}`}}>
                        <p className="text-sm font-semibold" style={{color:meta.color}}>{meta.label}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-xs text-red-300">
                🔒 Admin final approval at every level — no exceptions.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── SETTINGS TAB ── */}
        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/60 border border-gray-700/50">
              <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Settings className="h-4 w-4 text-gray-400"/>Ladder Rules</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  {label:"Challenge Range A",        value:"730–600 Fargo"},
                  {label:"Challenge Range B",        value:"599–500 Fargo"},
                  {label:"Challenge Range C",        value:"499–300 Fargo"},
                  {label:"Auto-Bump (#1 stagnant)", value:"Enabled — bumped after 30 days at #1"},
                  {label:"8ft Ladder Access",        value:"Open — no lock ✓"},
                  {label:"7ft (Barbox) Subscription",value:"First in membership flow ✓"},
                  {label:"$60 Fee in Rookie",        value:"Removed — subscribers only ✓"},
                ].map(item=>(
                  <div key={item.label} className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.value}</p>
                    </div>
                    <span className="text-emerald-400 text-xs flex-shrink-0 ml-2">Active</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border border-gray-700/50">
              <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-gray-400"/>Tournament & League</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  {label:"Single Elimination",    value:"Enabled"},
                  {label:"Double Elimination",    value:"Enabled"},
                  {label:"Round Robin",           value:"Enabled"},
                  {label:"Pod Round Robin",       value:"Enabled (New) ✓"},
                  {label:"Calcutta Add-on",       value:"Optional toggle"},
                  {label:"Table Count + Numbers", value:"Required in listings ✓"},
                  {label:"League Ladder Standing",value:"Renamed with Singles/Teams filters ✓"},
                  {label:"Special Games",         value:"Restored — check API endpoints"},
                ].map(item=>(
                  <div key={item.label} className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                    <p className="text-white text-sm">{item.label}</p>
                    <span className="text-emerald-400 text-xs ml-2">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
