"use client";

import { useState } from "react";
import { Users, Package, Settings as SettingsIcon, Shield, Check, X, Edit2, Save, Trash2, Mail, Calendar, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ADMIN_USERS_FULL } from "@/constants/mock-data";
import { ADMIN_PLAN_CONFIGS } from "@/constants/plans";
import type { AdminTab } from "@/types";

interface AdminPortalProps {
  adminStats: any[];
  activeTab: AdminTab;
}

export function AdminPortal({ adminStats, activeTab }: AdminPortalProps) {
  const [siteSettings, setSiteSettings] = useState({
    name: "PageRoast AI",
    supportEmail: "support@pageroast.ai",
    maintenanceMode: false,
    publicSignup: true,
  });

  const [savingSettings, setSavingSettings] = useState(false);

  function handleSaveSettings() {
    setSavingSettings(true);
    setTimeout(() => setSavingSettings(false), 1500);
  }

  const [editingPlan, setEditingPlan] = useState<any>(null);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-1 capitalize">{activeTab} management and overview.</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 py-1 px-3">
          <Shield className="h-3 w-3 mr-1.5" />
          Super Admin
        </Badge>
      </div>

      {activeTab === "dashboard" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, i) => (
              <Card key={i} className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest actions performed across the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { user: "Dan R.", action: "upgraded to", target: "Agency Plan", time: "2 mins ago", icon: Package, color: "text-indigo-400" },
                  { user: "Priya K.", action: "ran an audit for", target: "flowbase.io", time: "15 mins ago", icon: Calendar, color: "text-violet-400" },
                  { user: "System", action: "processed", target: "12 recurring payments", time: "1 hour ago", icon: Key, color: "text-green-400" },
                ].map((act, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className={`p-2 rounded-lg bg-background ${act.color}`}>
                      <act.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-bold">{act.user}</span> {act.action} <span className="font-bold">{act.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{act.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
                <CardDescription>Live status of your core services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { service: "API Engine", status: "Operational", health: 100, color: "bg-green-500" },
                  { service: "AI Roaster", status: "High Load", health: 85, color: "bg-amber-500" },
                  { service: "Database", status: "Operational", health: 99, color: "bg-green-500" },
                  { service: "Storage", status: "Operational", health: 100, color: "bg-green-500" },
                ].map((srv, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{srv.service}</span>
                      <span className="text-muted-foreground text-xs">{srv.status}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${srv.color}`} style={{ width: `${srv.health}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <Card className="border-border bg-card/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search, view, and manage your users.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search users..." className="w-64 bg-background/50 h-9" />
              <Button size="sm" variant="outline" className="h-9">Export CSV</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Audits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ADMIN_USERS_FULL.map((u, i) => (
                  <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.plan === "Agency" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : ""}>
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{u.audits}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{u.joined}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-xs">{u.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="py-4 bg-muted/20 border-t border-border flex justify-between text-xs text-muted-foreground">
            Showing 10 of {ADMIN_USERS_FULL.length} users
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 px-2" disabled>Prev</Button>
              <Button variant="outline" size="sm" className="h-7 px-2">Next</Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {activeTab === "plans" && (
        <div className="relative">
          {editingPlan ? (
            <Card className="border-indigo-500/50 bg-card max-w-xl mx-auto animate-in zoom-in-95 duration-300">
              <CardHeader>
                <CardTitle>Edit Plan: {editingPlan.name}</CardTitle>
                <CardDescription>Update plan details and pricing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Plan Name</Label>
                    <Input defaultValue={editingPlan.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input defaultValue={editingPlan.price} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <textarea 
                    className="w-full min-h-[100px] bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    defaultValue={editingPlan.features.join("\n")}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-border mt-4 pt-6">
                <Button variant="ghost" onClick={() => setEditingPlan(null)}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-500 px-8" onClick={() => setEditingPlan(null)}>
                  Save Plan
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADMIN_PLAN_CONFIGS.map((p) => (
                <Card key={p.id} className="border-border bg-card/50 flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{p.name}</CardTitle>
                      <p className="text-2xl font-bold text-indigo-400">{p.price}<span className="text-xs text-muted-foreground">/mo</span></p>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
                      <Users className="h-4 w-4" />
                      {p.subscribers}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 mt-4">
                      {p.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-6 border-t border-border/50">
                    <Button onClick={() => setEditingPlan(p)} className="w-full bg-indigo-600 hover:bg-indigo-500 h-10 gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Plan Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="border-dashed border-2 border-border bg-transparent flex flex-col items-center justify-center p-8 text-center hover:bg-muted/20 transition-colors cursor-pointer group">
                <div className="h-12 w-12 rounded-full border border-dashed border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground">Create New Plan</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-[150px]">Define a new pricing tier for your users</p>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6 max-w-2xl">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                  <SettingsIcon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <CardTitle>Global Site Settings</CardTitle>
                  <CardDescription>Configure basic platform behavior and branding.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Application Name</Label>
                <Input 
                  id="site-name" 
                  value={siteSettings.name} 
                  onChange={(e) => setSiteSettings({...siteSettings, name: e.target.value})}
                  className="bg-background/50" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email Address</Label>
                <div className="relative">
                  <Input 
                    id="support-email" 
                    type="email" 
                    value={siteSettings.supportEmail} 
                    onChange={(e) => setSiteSettings({...siteSettings, supportEmail: e.target.value})}
                    className="bg-background/50 pl-10" 
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Block non-admin users from accessing the app.</p>
                </div>
                <Switch 
                  checked={siteSettings.maintenanceMode} 
                  onCheckedChange={(val) => setSiteSettings({...siteSettings, maintenanceMode: val})} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Registrations</Label>
                  <p className="text-xs text-muted-foreground">Allow new users to create accounts without invite.</p>
                </div>
                <Switch 
                  checked={siteSettings.publicSignup} 
                  onCheckedChange={(val) => setSiteSettings({...siteSettings, publicSignup: val})} 
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t border-border/50 flex justify-end gap-3">
              <Button variant="ghost">Discard Changes</Button>
              <Button 
                onClick={handleSaveSettings} 
                className="bg-indigo-600 hover:bg-indigo-500 min-w-[140px] gap-2"
                disabled={savingSettings}
              >
                {savingSettings ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive font-bold">Danger Zone</CardTitle>
              <CardDescription className="text-destructive/80">Irreversible actions for your dataset.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive text-sm h-10 gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Audit History
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
