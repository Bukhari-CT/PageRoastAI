import {
  LayoutDashboard, Flame, Clock, CreditCard, Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

export const USER_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "roast", label: "Roast My Page", icon: Flame },
  { id: "history", label: "History", icon: Clock },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

// Admin surfaces beyond the overview shell are deliberately absent until they
// can be backed by real queries — see AdminPortal.
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export const LANDING_NAV_LINKS = [
  "How It Works",
  "Pricing",
] as const;
