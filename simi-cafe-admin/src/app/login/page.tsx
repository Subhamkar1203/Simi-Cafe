"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CupHotFill } from "react-bootstrap-icons";
import { toaster } from "@/components/toaster";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toaster.create({ title: "Login Failed", description: data.error || "Login failed", type: "error" });
        return;
      }
      
      toaster.create({ title: "Success", description: "Welcome back to the dashboard.", type: "success" });
      router.push("/");
      router.refresh();
    } catch {
      toaster.create({ title: "Error", description: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <CupHotFill /> Simi Café
        </h1>
        <p className="subtitle">Admin Dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@simicafe.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
