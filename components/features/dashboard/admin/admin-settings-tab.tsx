"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Mail, Save, Trash2, Loader2 } from "lucide-react";

import { UserSettingsTab } from "@/components/features/settings/user-settings-tab";
import { useSession } from "@/lib/auth-client";
import type { User } from "@/types";

export function AdminSettingsTab() {
  const { data: sessionData, isPending } = useSession();

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

  return (
    <div className="space-y-12 max-w-3xl pb-10">
      <div className="space-y-6">
        {isPending ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessionData?.user ? (
          <UserSettingsTab 
            user={sessionData.user as unknown as User} 
            onUpdateUser={() => {}} 
          />
        ) : null}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Platform Settings</h2>
          <p className="text-muted-foreground">Manage global site behavior and configurations.</p>
        </div>

        <Card className="border-border bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-indigo-400" />
              <div>
                <CardTitle className="text-lg">Global Site Settings</CardTitle>
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
    </div>
  );
}
