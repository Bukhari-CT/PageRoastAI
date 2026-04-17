"use client";

import { CheckCircle as CheckCircleIcon, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PAYMENT_INCLUDES } from "@/constants";

export interface PaymentFormState {
  email?: string;
  name: string;
  card: string;
  expiry: string;
  cvc: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: "pro" | "agency";
  onSuccess: (plan: "pro" | "agency") => void;
  form: PaymentFormState;
  onFormChange: (form: PaymentFormState) => void;
}

export function PaymentDialog({ open, onOpenChange, selectedPlan, onSuccess, form, onFormChange }: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upgrade to {selectedPlan === "pro" ? "Pro" : "Agency"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            ${selectedPlan === "pro" ? "19" : "49"} · One-time payment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-zinc-100 font-semibold mb-4 text-sm">What&apos;s included</h4>
            <div className="space-y-3">
              {PAYMENT_INCLUDES.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircleIcon size={16} className="text-green-500" />
                  <span className="text-zinc-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Card Information</p>
            <div className="space-y-3">
              <Input
                placeholder="Name on card"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
              />
              <Input
                placeholder="4242 4242 4242 4242"
                value={form.card}
                onChange={(e) => onFormChange({ ...form, card: e.target.value })}
                className="bg-zinc-900 border-zinc-800"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="MM / YY"
                  value={form.expiry}
                  onChange={(e) => onFormChange({ ...form, expiry: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
                <Input
                  placeholder="CVC"
                  value={form.cvc}
                  onChange={(e) => onFormChange({ ...form, cvc: e.target.value })}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center text-zinc-500 text-[10px]">
            <Lock size={12} /> <span>256-bit SSL encrypted</span> <span>·</span> <span>Powered by Stripe</span>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 transition-all font-semibold"
            onClick={() => onSuccess(selectedPlan)}
          >
            Pay ${selectedPlan === "pro" ? "19" : "49"} Now →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
