import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserDto, Role, LoginInput } from "@vanta/shared";
import { authApi } from "../api/auth";

export const DEMO_USERS: Record<string, UserDto> = {
  "admin@example.com": {
    id: "demo-admin-01",
    name: "John Doe",
    email: "admin@example.com",
    role: Role.ADMIN,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  },
  "sales@example.com": {
    id: "demo-sales-01",
    name: "Jane Smith",
    email: "sales@example.com",
    role: Role.SALES,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  },
  "warehouse@example.com": {
    id: "demo-warehouse-01",
    name: "Mike Johnson",
    email: "warehouse@example.com",
    role: Role.WAREHOUSE,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  },
  "accounts@example.com": {
    id: "demo-accounts-01",
    name: "Sarah Connor",
    email: "accounts@example.com",
    role: Role.ACCOUNTS,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  }
};

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  demoLogin: (role?: Role) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(() => {
    try {
      const saved = localStorage.getItem("vanta_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("vanta_auth_token");
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("vanta_auth_token");
      if (savedToken) {
        // If it's a simulated demo token, restore demo user directly
        if (savedToken.startsWith("demo_token_")) {
          const savedUser = localStorage.getItem("vanta_user");
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(DEMO_USERS["admin@example.com"]);
            }
          }
          setIsLoading(false);
          return;
        }

        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("vanta_user", JSON.stringify(res.data));
          }
        } catch (err: any) {
          // If server explicitly returns 401 Unauthorized, clear invalid session
          if (err?.response?.status === 401 || err?.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("vanta_auth_token");
            localStorage.removeItem("vanta_user");
          } else {
            // If network error / offline, preserve existing cached session
            const savedUser = localStorage.getItem("vanta_user");
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch {
                // Ignore parse error
              }
            }
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginInput) => {
    const normalizedEmail = data.email.toLowerCase().trim();

    try {
      const res = await authApi.login({
        email: normalizedEmail,
        password: data.password
      });

      if (res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("vanta_auth_token", res.data.token);
        localStorage.setItem("vanta_user", JSON.stringify(res.data.user));
        return;
      }
    } catch (err: any) {
      // If error is genuine 401 from server with invalid credentials (and not a network failure)
      if (
        err?.response?.status === 401 &&
        !DEMO_USERS[normalizedEmail]
      ) {
        throw new Error(err.message || "Invalid email or password");
      }

      // If backend is unreachable / network error / standalone demo mode:
      if (DEMO_USERS[normalizedEmail]) {
        const demoUser = DEMO_USERS[normalizedEmail];
        const mockToken = `demo_token_${demoUser.role}_${Date.now()}`;
        setToken(mockToken);
        setUser(demoUser);
        localStorage.setItem("vanta_auth_token", mockToken);
        localStorage.setItem("vanta_user", JSON.stringify(demoUser));
        return;
      }

      throw new Error(err.message || "Authentication failed. Please check your credentials.");
    }
  };

  const demoLogin = async (role: Role = Role.ADMIN) => {
    const roleEmails: Record<Role, string> = {
      [Role.ADMIN]: "admin@example.com",
      [Role.SALES]: "sales@example.com",
      [Role.WAREHOUSE]: "warehouse@example.com",
      [Role.ACCOUNTS]: "accounts@example.com"
    };

    const email = roleEmails[role] || "admin@example.com";
    await login({ email, password: "password123" });
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
    if (email) {
      await login({ email, password: "password123" });
    }
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
        demoLogin,
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

