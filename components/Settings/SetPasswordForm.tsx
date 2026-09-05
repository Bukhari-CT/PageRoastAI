import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SetPasswordFormState } from "@/hooks/useSetPassword";

interface SetPasswordFormProps {
  form: SetPasswordFormState;
  onFormChange: (form: SetPasswordFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  error: string;
  success: string;
}

export function SetPasswordForm({
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
  error,
  success,
}: SetPasswordFormProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-400" />
          Security
        </CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6 max-w-md">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Password <span className="text-muted-foreground/50 lowercase">(optional for social login)</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              value={form.currentPassword}
              onChange={(e) => onFormChange({ ...form, currentPassword: e.target.value })}
              className="bg-background/50"
            />
            <p className="text-[10px] text-muted-foreground">Leave blank if you registered with Google and haven&apos;t set a password.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={(e) => onFormChange({ ...form, newPassword: e.target.value })}
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => onFormChange({ ...form, confirmPassword: e.target.value })}
              className="bg-background/50"
              required
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400"
            disabled={isSubmitting || !form.newPassword}
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
