import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstSetup: boolean;
  login: (password: string) => Promise<boolean>;
  setupPassword: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(
    () => !localStorage.getItem("admin_password_hash")
  );

  const login = useCallback(async (password: string): Promise<boolean> => {
    const stored = localStorage.getItem("admin_password_hash");
    if (!stored) return false;
    const hash = await hashPassword(password);
    if (hash === stored) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const setupPassword = useCallback(async (password: string) => {
    const hash = await hashPassword(password);
    localStorage.setItem("admin_password_hash", hash);
    setIsFirstSetup(false);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isFirstSetup, login, setupPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
