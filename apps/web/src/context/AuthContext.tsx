import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserDto, Role, LoginInput } from "@vanta/shared";
import { authApi } from "../api/auth";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(() => {
    const saved = localStorage.getItem("vanta_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("vanta_auth_token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("vanta_user", JSON.stringify(res.data));
          }
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem("vanta_auth_token");
          localStorage.removeItem("vanta_user");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (data: LoginInput) => {
    const res = await authApi.login(data);
    if (res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("vanta_auth_token", res.data.token);
      localStorage.setItem("vanta_user", JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vanta_auth_token");
    localStorage.removeItem("vanta_user");
    window.location.href = "/login";
  };

  const switchDemoRole = async (role: Role) => {
    const roleEmails: Record<Role, string> = {
      [Role.ADMIN]: "admin@example.com",
      [Role.SALES]: "sales@example.com",
      [Role.WAREHOUSE]: "warehouse@example.com",
      [Role.ACCOUNTS]: "accounts@example.com"
    };

    const email = roleEmails[role];
    await login({ email, password: "password123" });
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
