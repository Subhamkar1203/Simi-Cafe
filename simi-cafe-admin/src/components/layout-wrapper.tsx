"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Moon, Sun, List, CupHotFill } from "react-bootstrap-icons";
import { GlobalToaster } from "@/components/toaster";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <div className="mobile-header">
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>
            <List size={28} />
          </button>
          <div className="logo-mobile" style={{ fontSize: "1.1rem" }}>
            <CupHotFill className="logo-icon" /> Simi Café
          </div>
        </div>
        <button className="mobile-toggle" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="main-wrapper">
        <main className="main-content">
          {children}
        </main>
      </div>
      <GlobalToaster />
    </>
  );
}
