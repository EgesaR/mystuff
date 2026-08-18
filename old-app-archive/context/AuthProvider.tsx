import type React from "react";
import { createContext, useCallback, useMemo, useState } from "react";
import type { User } from "~/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: React.ReactNode;
  initialUser?: User | null;
  initialToken?: string | null;
}

export const AuthProvider = ({
  children,
  initialUser = null,
  initialToken = null,
}: Props) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [token, setToken] = useState<string | null>(initialToken);

  const setAuth = useCallback(
    (newUser: User | null, newToken: string | null) => {
      setUser(newUser);
      setToken(newToken);
    },
    [],
  );

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: user !== null,
      setUser,
      setAuth,
      clearAuth,
    }),
    [user, token, setAuth, clearAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
