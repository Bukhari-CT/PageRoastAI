"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Check, Edit2, Package } from "lucide-react";
import { ADMIN_PLAN_CONFIGS } from "@/constants/plans";
import type { PlanConfig } from "@/types";

export function AdminPlansTab() {
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

  return (
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
  );
}
