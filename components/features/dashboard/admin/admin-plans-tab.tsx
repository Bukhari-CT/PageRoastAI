"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Check, Edit2, Package, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAdminPlans, type Plan } from "@/hooks/useAdminPlans";

export function AdminPlansTab() {
  const { plans, isLoading, createPlan, updatePlan, togglePlan } = useAdminPlans();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  function handleEditPlan(p: Plan) {
    setEditingPlan(p);
    setEditForm(p);
    setIsCreating(false);
  }

  function handleCreatePlan() {
    setEditingPlan(null);
    setEditForm({ name: "", price: "", features: [], monthlyAudits: 0 });
    setIsCreating(true);
  }

  async function handleSave() {
    if (!editForm || !editForm.name || !editForm.price) return;
    setIsSaving(true);
    let success = false;
    
    if (isCreating) {
      success = await createPlan(editForm.name, editForm.price, editForm.features || [], editForm.enabled ?? true, editForm.monthlyAudits ?? 0);
    } else if (editingPlan) {
      success = await updatePlan(editingPlan.id, editForm.name, editForm.price, editForm.features || [], editForm.enabled ?? true, editForm.monthlyAudits ?? 0);
    }
    
    setIsSaving(false);
    if (success) {
      setEditingPlan(null);
      setEditForm(null);
      setIsCreating(false);
    }
  }

  return (
    <div className="relative">
      {(editingPlan || isCreating) ? (
        <Card className="border-indigo-500/50 bg-card max-w-xl mx-auto animate-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle>{isCreating ? "Create New Plan" : `Edit Plan: ${editingPlan?.name}`}</CardTitle>
            <CardDescription>{isCreating ? "Define a new pricing tier." : "Update plan details and pricing."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={editForm?.name || ""} onChange={(e) => setEditForm(editForm ? { ...editForm, name: e.target.value } : null)} />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input value={editForm?.price || ""} onChange={(e) => setEditForm(editForm ? { ...editForm, price: e.target.value } : null)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Monthly Audits</Label>
                <Input 
                  type="number" 
                  value={editForm?.monthlyAudits || 0} 
                  onChange={(e) => setEditForm(editForm ? { ...editForm, monthlyAudits: parseInt(e.target.value) || 0 } : null)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <textarea 
                className="w-full min-h-[100px] bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={editForm?.features?.join("\n") || ""}
                onChange={(e) => setEditForm(editForm ? { ...editForm, features: e.target.value.split("\n") } : null)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Plan</Label>
                <p className="text-xs text-muted-foreground">Allow users to subscribe to this plan.</p>
              </div>
              <Switch 
                checked={editForm?.enabled ?? true} 
                onCheckedChange={(val) => setEditForm(editForm ? { ...editForm, enabled: val } : null)} 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-border mt-4 pt-6">
            <Button variant="ghost" onClick={() => { setEditingPlan(null); setEditForm(null); setIsCreating(false); }} disabled={isSaving}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 px-8" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Plan"}
            </Button>
          </CardFooter>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => (
            <Card key={p.id} className={`border-border bg-card/50 flex flex-col ${!p.enabled && 'opacity-60 grayscale-[0.5]'}`}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  <p className="text-2xl font-bold text-indigo-400">{p.price}<span className="text-xs text-muted-foreground">/mo</span></p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <CardDescription className="flex items-center gap-2 text-foreground font-semibold">
                    <Users className="h-4 w-4" />
                    --
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${p.enabled ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {p.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/20 w-fit mb-4">
                    <span className="text-indigo-500 font-bold">{p.monthlyAudits}</span> Monthly Audits
                  </div>
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-6 border-t border-border/50">
                <Button onClick={() => handleEditPlan(p)} className="w-full bg-indigo-600 hover:bg-indigo-500 h-10 gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Plan Details
                </Button>
              </CardFooter>
            </Card>
          ))}
          <Card 
            onClick={handleCreatePlan}
            className="border-dashed border-2 border-border bg-transparent flex flex-col items-center justify-center p-8 text-center hover:bg-muted/20 transition-colors cursor-pointer group"
          >
            <div className="h-12 w-12 rounded-full border border-dashed border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground">Create New Plan</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-[150px]">Define a new pricing tier for your users</p>
          </Card>
        </div>
      )}
    </div>
  );
}
