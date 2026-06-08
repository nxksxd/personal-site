import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "../lib/api";
import { AuthContext, type AdminUser } from "./auth-context";

interface AuthResult {
  token: string;
  user: AdminUser;
}

const USER_KEY = "auth_user";

function loadStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function storeUser(user: AdminUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() =>
    getToken() ? loadStoredUser() : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!getToken() && !!loadStoredUser()
  );
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    try {
      const list = await api.get<AdminUser[]>("/api/auth/users");
      setUsers(list);
    } catch {
      /* not authorized yet */
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const status = await api.get<{ has_users: boolean }>(
          "/api/auth/status"
        );
        if (active) setIsFirstSetup(!status.has_users);
      } catch {
        /* backend unreachable */
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        const list = await api.get<AdminUser[]>("/api/auth/users");
        if (active) setUsers(list);
      } catch {
        /* not authorized */
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const applyAuth = useCallback((result: AuthResult) => {
    setToken(result.token);
    storeUser(result.user);
    setCurrentUser(result.user);
    setIsAuthenticated(true);
    setIsFirstSetup(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const result = await api.post<AuthResult>("/api/auth/login", {
          username,
          password,
        });
        applyAuth(result);
        return true;
      } catch {
        return false;
      }
    },
    [applyAuth]
  );

  const setupFirstUser = useCallback(
    async (username: string, password: string) => {
      const result = await api.post<AuthResult>("/api/auth/setup", {
        username,
        password,
      });
      applyAuth(result);
    },
    [applyAuth]
  );

  const addUser = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        await api.post<AdminUser>(
          "/api/auth/users",
          { username, password },
          true
        );
        await refreshUsers();
        return true;
      } catch {
        return false;
      }
    },
    [refreshUsers]
  );

  const deleteUser = useCallback(
    async (id: number) => {
      await api.del(`/api/auth/users/${id}`, true);
      await refreshUsers();
    },
    [refreshUsers]
  );

  const logout = useCallback(() => {
    setToken(null);
    storeUser(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsers([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isFirstSetup,
        authLoading,
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
