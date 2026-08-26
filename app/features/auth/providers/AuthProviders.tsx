import type React from "react";
import { useCallback, useMemo, useState } from "react";

import { AuthContext, type AuthContextValue } from "../context/AuthContext";

import type { AppUser } from "../types";

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AppUser | null;
  initialToken?: string | null;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialToken = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(initialUser);

  const [token, setToken] = useState<string | null>(initialToken);

  const setAuth = useCallback((nextUser: AppUser | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null,
      setAuth,
      setUser,
      clearAuth,
    }),
    [user, token, setAuth, clearAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
