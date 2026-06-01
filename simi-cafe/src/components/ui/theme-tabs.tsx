"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

export function ThemeTabs({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light", label: "Day", icon: Sun },
    { value: "dark", label: "Night", icon: Moon },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.72)] p-1 shadow-sm backdrop-blur-md transition-colors duration-500",
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = mounted && (theme ?? "light") === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[rgb(var(--foreground))] transition-all duration-500",
              active && "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-sm",
            )}
            aria-pressed={active}
          >
            <Icon className="size-4" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
