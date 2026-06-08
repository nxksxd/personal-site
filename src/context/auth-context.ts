import { createContext, useContext } from "react";

export interface AdminUser {
  id: number;
  username: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isFirstSetup: boolean;
  authLoading: boolean;
  currentUser: AdminUser | null;
  users: AdminUser[];
  login: (username: string, password: string) => Promise<boolean>;
  setupFirstUser: (username: string, password: string) => Promise<void>;
  addUser: (username: string, password: string) => Promise<boolean>;
  deleteUser: (id: number) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
