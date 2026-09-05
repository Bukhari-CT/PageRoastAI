"use client";

import { useState } from "react";

import { Save, Mail, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { SetPasswordContainer } from "@/containers/Settings/SetPasswordContainer";
import type { User } from "@/types";

interface UserSettingsTabProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export function UserSettingsTab({ user, onUpdateUser }: UserSettingsTabProps) {
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameForm, setNameForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });

  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");
    setIsUpdatingName(true);

    const { error } = await authClient.updateUser({
      firstName: nameForm.firstName,
      lastName: nameForm.lastName,
      name: `${nameForm.firstName} ${nameForm.lastName}`,
    });

    setIsUpdatingName(false);

    if (error) {
      setNameError(error.message || "Failed to update profile");
    } else {
      setNameSuccess("Profile updated successfully!");
      onUpdateUser({
        ...user,
        firstName: nameForm.firstName,
        lastName: nameForm.lastName,
        name: `${nameForm.firstName} ${nameForm.lastName}`,
      });
      setTimeout(() => setNameSuccess(""), 3000);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and security preferences.</p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-indigo-400" />
            Personal Details
          </CardTitle>
          <CardDescription>Update your name. Email cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleNameUpdate} className="space-y-6">
            {nameError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {nameError}
              </div>
            )}
            {nameSuccess && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                {nameSuccess}
              </div>
            )}

            <div className="space-y-2 max-w-md opacity-70">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-10 bg-background/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={nameForm.firstName}
                  onChange={(e) => setNameForm({ ...nameForm, firstName: e.target.value })}
                  className="bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={nameForm.lastName}
                  onChange={(e) => setNameForm({ ...nameForm, lastName: e.target.value })}
                  className="bg-background/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={isUpdatingName || (nameForm.firstName === user.firstName && nameForm.lastName === user.lastName)}
            >
              {isUpdatingName ? "Saving..." : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SetPasswordContainer />
    </div>
  );
}
