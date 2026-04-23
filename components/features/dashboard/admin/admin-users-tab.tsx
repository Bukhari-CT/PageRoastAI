"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { ADMIN_USERS_FULL } from "@/constants/mock-data";

export function AdminUsersTab() {
  return (
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
  );
}
