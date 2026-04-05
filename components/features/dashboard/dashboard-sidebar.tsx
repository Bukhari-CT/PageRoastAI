"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { User, UserTab, AdminTab } from "@/types";

interface DashboardSidebarProps {
  user: User;
  navItems: any[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout: () => void;
}

export function DashboardSidebar({ user, navItems, activeTab, onTabChange, onLogout }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar overflow-hidden">
      <SidebarHeader className="h-16 flex items-center px-6">
        <p className="text-foreground font-bold text-lg group-data-[collapsible=icon]:hidden">🔥 PageRoast</p>
        <p className="text-foreground font-bold text-lg hidden group-data-[collapsible=icon]:block">🔥</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
              {user.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-foreground text-sm font-medium truncate">{user.name}</p>
            <p className="text-muted-foreground text-xs truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
