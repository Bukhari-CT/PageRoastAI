"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminUsersAction, toggleUserBlockAction, deleteUserAction } from "@/app/actions/admin.actions";
import { useToast } from "@/hooks/useToast";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  package: string | null;
  createdAt: Date;
  lockedUntil: Date | null;
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await getAdminUsersAction();
    
    if (fetchError) {
      setError(fetchError);
      toast({ title: "Error", description: fetchError });
    } else if (data) {
      setUsers(data);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (userId: string, currentBlocked: boolean) => {
    const { error: actionError } = await toggleUserBlockAction(userId, !currentBlocked);
    if (actionError) {
      toast({ title: "Error", description: actionError });
    } else {
      toast({ title: "Success", description: `User ${!currentBlocked ? 'blocked' : 'unblocked'} successfully.` });
      // Update local state optimistic-like
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, lockedUntil: !currentBlocked ? new Date("2099-12-31T23:59:59Z") : null } : u));
    }
  };

  const removeUser = async (userId: string) => {
    const { error: actionError } = await deleteUserAction(userId);
    if (actionError) {
      toast({ title: "Error", description: actionError });
    } else {
      toast({ title: "Success", description: "User deleted successfully." });
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  return { users, isLoading, error, fetchUsers, toggleBlock, removeUser };
}
