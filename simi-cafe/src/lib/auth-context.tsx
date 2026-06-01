"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  total_visits: number;
  successful_payments: number;
  charm_count: number;
  charms_redeemed: number;
  profile_image?: string;
  created_at: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signup: (data: SignupData) => Promise<{ ok: boolean; requiresOtp?: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }>;
  verifySignupOtp: (data: SignupData & { otp: string }) => Promise<{ ok: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }>;
  login: (data: LoginData) => Promise<{ ok: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────────── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    refresh();
  }, [refresh]);

  const signup = useCallback(
    async (data: SignupData): Promise<{ ok: boolean; requiresOtp?: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }> => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) {
          return { ok: false, error: json.error ?? "Signup failed", details: json.details };
        }

        if (json.requiresOtp) {
          return { ok: true, requiresOtp: true };
        }

        setUser(json.user);
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  const verifySignupOtp = useCallback(
    async (data: SignupData & { otp: string }): Promise<{ ok: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }> => {
      try {
        const res = await fetch("/api/auth/verify-signup-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) {
          return { ok: false, error: json.error ?? "OTP Verification failed", details: json.details };
        }

        setUser(json.user);
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  const login = useCallback(
    async (data: LoginData): Promise<{ ok: boolean; error?: string; details?: { path: string; message: string; [key: string]: unknown }[] }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();

        if (!res.ok) {
          return { ok: false, error: json.error ?? "Login failed", details: json.details };
        }

        setUser(json.user);
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, verifySignupOtp, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
