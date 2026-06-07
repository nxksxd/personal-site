import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isFirstSetup: boolean;
  currentUser: AdminUser | null;
  users: AdminUser[];
  login: (username: string, password: string) => Promise<boolean>;
  setupFirstUser: (username: string, password: string) => Promise<void>;
  addUser: (username: string, password: string) => Promise<boolean>;
  deleteUser: (id: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "admin_users";
const OLD_HASH_KEY = "admin_password_hash";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function loadUsers(): AdminUser[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }

  const oldHash = localStorage.getItem(OLD_HASH_KEY);
  if (oldHash) {
    const migrated: AdminUser[] = [
      { id: 1, username: "admin", passwordHash: oldHash },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(migrated));
    localStorage.removeItem(OLD_HASH_KEY);
    return migrated;
  }

  return [];
}

function saveUsers(users: AdminUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(loadUsers);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const isFirstSetup = users.length === 0;

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const hash = await hashPassword(password);
      const found = users.find(
        (u) => u.username === username && u.passwordHash === hash
      );
      if (found) {
        setIsAuthenticated(true);
        setCurrentUser(found);
        return true;
      }
      return false;
    },
    [users]
  );

  const setupFirstUser = useCallback(
    async (username: string, password: string) => {
      const hash = await hashPassword(password);
      const newUser: AdminUser = { id: 1, username, passwordHash: hash };
      const updated = [newUser];
      setUsers(updated);
      saveUsers(updated);
      setIsAuthenticated(true);
      setCurrentUser(newUser);
    },
    []
  );

  const addUser = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (users.some((u) => u.username === username)) return false;
      const hash = await hashPassword(password);
      const maxId = users.reduce((m, u) => Math.max(m, u.id), 0);
      const newUser: AdminUser = {
        id: maxId + 1,
        username,
        passwordHash: hash,
      };
      const updated = [...users, newUser];
      setUsers(updated);
      saveUsers(updated);
      return true;
    },
    [users]
  );

  const deleteUser = useCallback(
    (id: number) => {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      saveUsers(updated);
    },
    [users]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstSetup,
        currentUser,
        users,
        login,
        setupFirstUser,
        addUser,
        deleteUser,
        logout,
      }}
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
