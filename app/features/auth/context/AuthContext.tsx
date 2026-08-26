import { createContext } from "react";

import type { AppUser } from "../types";

export interface AuthContextValue {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AppUser | null, token: string | null) => void;

  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;

  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
