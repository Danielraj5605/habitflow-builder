import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMe } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: getMe,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });

  const user = data || null;

  return (
    <UserContext.Provider value={{ user, isLoading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}