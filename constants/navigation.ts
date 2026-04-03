import {
  LayoutDashboard, Flame, Clock, CreditCard,
  Users, Package, Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

export const USER_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roast", label: "Roast My Page", icon: Flame },
  { id: "history", label: "History", icon: Clock },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "plans", label: "Plans", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
];

export const LANDING_NAV_LINKS = [
  "How It Works",
  "Results",
  "Showcase",
  "Testimonials",
  "Pricing",
] as const;
