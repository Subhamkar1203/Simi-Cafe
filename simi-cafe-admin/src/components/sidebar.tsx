"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Speedometer2,
  BagCheck,
  CupHotFill,
  Calendar3,
  People,
  BoxArrowRight,
} from "react-bootstrap-icons";

const navItems = [
  { label: "Dashboard", href: "/", icon: Speedometer2 },
  { label: "Orders", href: "/orders", icon: BagCheck },
  { label: "Menu Items", href: "/menu", icon: CupHotFill },
  { label: "Reservations", href: "/reservations", icon: Calendar3 },
  { label: "Users", href: "/users", icon: People },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-logo">
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CupHotFill /> Simi Café</h1>
        <span>Admin Dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0 0.75rem", marginTop: "auto" }}>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: "100%", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
        >
          <BoxArrowRight />
          Logout
        </button>
      </div>
    </aside>
  );
}
