"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Lock, Unlock, Loader2 } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";

export function AdminUsersTab() {
  const { users, isLoading, toggleBlock, removeUser } = useAdminUsers();
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mt-2 block">Loading users...</span>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : users.map((u) => {
                const isBlocked = !!u.lockedUntil && new Date(u.lockedUntil) > new Date();
                return (
                  <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.package === "Agency" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : ""}>
                        {u.package || "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">-</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-red-500" : "bg-green-500"}`} />
                        <span className="text-xs">{isBlocked ? "Blocked" : "Active"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleBlock(u.id, isBlocked)}
                        title={isBlocked ? "Unblock User" : "Block User"}
                      >
                        {isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setUserToDelete({ id: u.id, name: u.name })}
                        title="Delete User"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="py-4 bg-muted/20 border-t border-border flex justify-between text-xs text-muted-foreground">
          Showing {users.length} users
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 px-2" disabled>Prev</Button>
            <Button variant="outline" size="sm" className="h-7 px-2">Next</Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account for <strong className="text-foreground">{userToDelete?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  removeUser(userToDelete.id);
                  setUserToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
