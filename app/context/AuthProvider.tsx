import type React from "react";
import { createContext, useMemo, useState } from "react";
import type { User } from "~/lib/types";

interface AuthContextType {
  user: User | null;

  isAuthenticated: boolean;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface Props {
  children: React.ReactNode;
  initialUser: User | null;
}

export const AuthProvider = ({ children, initialUser }: Props) => {
  const [user, setUser] = useState<User | null>(initialUser);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, setUser }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
