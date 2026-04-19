import { createContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "../api/client";

interface User {
  id: number;
  email: string;
  is_admin: boolean;
  is_financial: boolean;
  profile?: {
    full_name?: string;
    photo?: string;
    phone?: string;
    bio?: string;
    facebook?: string;
    instagram?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
  const res = await apiRequest<{ access: string; refresh: string }>(
    "/auth/login/",
    "POST",
    { email, password }
  );

  localStorage.setItem("access", res.access);
  localStorage.setItem("refresh", res.refresh);

  await fetchUser();
};

const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  setUser(null);
};

const fetchUser = async () => {
  try {
    const data = await apiRequest<User>("/auth/me/");
    setUser(data);
  } catch {
    setUser(null);
  }
};

const refreshUser = async () => {
  await fetchUser();
};

useEffect(() => {
const initAuth = async () => {
  const access = localStorage.getItem("access");

  if (!access) {
    setLoading(false);
    return;
  }

  try {
    await fetchUser();
  } finally {
    setLoading(false);
  }
};

  initAuth();
}, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
