import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { UserDto, Role, LoginInput, Permission, hasPermission, hasAllPermissions, hasAnyPermission } from "@vanta/shared";
import { authApi } from "../api/auth";

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (data: LoginInput) => Promise<void>;
  continueWithGoogle: (credential: string) => Promise<void>;
  continueWithGoogleOAuth: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  setSessionFromToken: (token: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAll: (...permissions: Permission[]) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
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
        try {
          const res = await authApi.getMe();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem("vanta_user", JSON.stringify(res.data));
          }
        } catch (err: any) {
          if (err?.response?.status === 401 || err?.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem("vanta_auth_token");
            localStorage.removeItem("vanta_user");
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const saveAuthSession = (authToken: string, authUser: UserDto) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem("vanta_auth_token", authToken);
    localStorage.setItem("vanta_user", JSON.stringify(authUser));
  };

  const login = async (data: LoginInput) => {
    const normalizedEmail = data.email.toLowerCase().trim();
    const res = await authApi.login({
      email: normalizedEmail,
      password: data.password
    });

    if (res.data) {
      saveAuthSession(res.data.token, res.data.user);
    }
  };

  const continueWithGoogle = async (credential: string) => {
    const res = await authApi.verifyGoogle(credential);
    if (res.data) {
      saveAuthSession(res.data.token, res.data.user);
    }
  };

  const continueWithGoogleOAuth = async () => {
    const res = await authApi.getGoogleAuthUrl();
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
  };

  const continueAsGuest = async () => {
    const res = await authApi.guestLogin();
    if (res.data) {
      saveAuthSession(res.data.token, res.data.user);
    }
  };

  const setSessionFromToken = async (authToken: string) => {
    localStorage.setItem("vanta_auth_token", authToken);
    setToken(authToken);
    const res = await authApi.getMe();
    if (res.data) {
      setUser(res.data);
      localStorage.setItem("vanta_user", JSON.stringify(res.data));
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem("vanta_auth_token");
    localStorage.removeItem("vanta_user");
    window.location.href = "/login";
  };

  const isGuest = user?.role === Role.GUEST || user?.isGuest === true;

  const can = useCallback(
    (permission: Permission) => {
      return hasPermission(user?.role, permission);
    },
    [user?.role]
  );

  const canAll = useCallback(
    (...permissions: Permission[]) => {
      return hasAllPermissions(user?.role, permissions);
    },
    [user?.role]
  );

  const canAny = useCallback(
    (...permissions: Permission[]) => {
      return hasAnyPermission(user?.role, permissions);
    },
    [user?.role]
  );

  const hasRole = useCallback(
    (...roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        login,
        continueWithGoogle,
        continueWithGoogleOAuth,
        continueAsGuest,
        setSessionFromToken,
        logout,
        can,
        canAll,
        canAny,
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
