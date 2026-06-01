"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Mail, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // For forgot password flow
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/secure-admin-portal-7x92k/orders");
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to request password reset");
      } else {
        setMessage(data.message || "Reset link sent!");
        // In this demo, we'll auto-switch to reset for easy testing since we don't have email setup
        setTimeout(() => setMode("reset"), 2000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setMessage("Password reset successful. You can now login.");
        setTimeout(() => setMode("login"), 2000);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
        
        <div className="bg-gray-950 p-8 text-center border-b border-gray-700">
          <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
            <ShieldCheck className="size-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Secure Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-2">Restricted Access Only</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-green-200 text-sm font-medium">
              {message}
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="admin@simicafe.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => setMode("forgot")} className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-lg font-bold" disabled={loading}>
                {loading ? "Authenticating..." : "Login to Portal"}
              </Button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="admin@simicafe.com"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMode("login")} className="w-full text-gray-400 hover:text-white">
                Back to Login
              </Button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <p className="text-gray-400 text-sm mb-4">Check your server console for the reset token (development mode).</p>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reset Token</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Paste token here"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMode("login")} className="w-full text-gray-400 hover:text-white">
                Back to Login
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
