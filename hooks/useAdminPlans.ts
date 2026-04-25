"use client";

import { useState, useEffect, useCallback } from "react";
import { getPlansAction, createPlanAction, updatePlanAction, togglePlanAction } from "@/app/actions/plan.actions";
import { useToast } from "@/hooks/useToast";

export type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  enabled: boolean;
  monthlyAudits: number;
};

export function useAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await getPlansAction();
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else if (data) {
      setPlans(data as Plan[]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (name: string, price: string, features: string[], enabled?: boolean, monthlyAudits?: number) => {
    const { data, error } = await createPlanAction({ name, price, features, enabled, monthlyAudits });
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      return false;
    } else if (data) {
      setPlans((prev) => [...prev, data as Plan]);
      toast({ title: "Success", description: "Plan created successfully" });
      return true;
    }
    return false;
  };

  const updatePlan = async (id: string, name: string, price: string, features: string[], enabled?: boolean, monthlyAudits?: number) => {
    // Note: To fully support this we also need to update updatePlanAction to accept enabled,
    // but we can toggle it separately if needed, or pass it to updatePlanAction.
    // For now we will update updatePlanAction.
    const { data, error } = await updatePlanAction(id, { name, price, features, enabled, monthlyAudits });
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      return false;
    } else if (data) {
      setPlans((prev) => prev.map((p) => (p.id === id ? (data as Plan) : p)));
      toast({ title: "Success", description: "Plan updated successfully" });
      return true;
    }
    return false;
  };

  const togglePlan = async (id: string, currentEnabled: boolean) => {
    const { data, error } = await togglePlanAction(id, !currentEnabled);
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
      return false;
    } else if (data) {
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !currentEnabled } : p)));
      toast({ title: "Success", description: `Plan ${!currentEnabled ? "enabled" : "disabled"} successfully` });
      return true;
    }
    return false;
  };

  return { plans, isLoading, createPlan, updatePlan, togglePlan, refreshPlans: fetchPlans };
}
