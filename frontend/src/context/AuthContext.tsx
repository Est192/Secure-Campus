import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginRequest } from "../api/authApi";
import {
  AUTH_TOKEN_STORAGE_KEY,
} from "../api/axios";
import { usersApi } from "../api/usersApi";
import type { User } from "../types/User";

const USER_STORAGE_KEY = "securecampus-auth-user";

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return Number.isInteger(record.id)
    && typeof record.name === "string"
    && typeof record.email === "string";
}

interface AuthContextValue {
  user: User | null;
  isRestoring: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    const parsed: unknown = JSON.parse(storedUser);
    if (isUser(parsed)) return parsed;
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const queryClient = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data: authenticatedUser, token }) => {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    },
  });

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const savedUser = readStoredUser();

    if (!token || !savedUser || !Number.isInteger(savedUser.id)) {
      clearSession();
      setIsRestoring(false);
      return;
    }

    let active = true;
    void usersApi.getById(savedUser.id)
      .then((restoredUser) => {
        if (!active) return;
        const userWithRole = { ...restoredUser, role: restoredUser.role ?? savedUser.role };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithRole));
        setUser(userWithRole);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
        } else {
          setUser(savedUser);
        }
      })
      .finally(() => {
        if (active) setIsRestoring(false);
      });

    return () => {
      active = false;
    };
  }, [clearSession]);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener("securecampus:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("securecampus:unauthorized", handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
        await authApi.logout();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((updatedUser: User) => {
    const userWithRole = { ...updatedUser, role: updatedUser.role ?? user?.role };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithRole));
    setUser(userWithRole);
  }, [user]);

  const value = useMemo(
    () => ({ user, isRestoring, login, logout, updateUser }),
    [user, isRestoring, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
