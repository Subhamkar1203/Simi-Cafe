"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0.9);

  useEffect(() => {
    const timer0 = window.setTimeout(() => setScale(1), 50); // slight scale up on mount
    const timer1 = window.setTimeout(() => setOpacity(0), 1500); // start fade out
    const timer2 = window.setTimeout(() => setMounted(false), 2500); // unmount
    return () => {
      window.clearTimeout(timer0);
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgb(var(--background))] text-[rgb(var(--foreground))] transition-opacity duration-1000 ease-in-out"
      style={{ opacity }}
    >
      <div 
        className="flex flex-col items-center gap-6 transition-transform duration-1000 ease-out"
        style={{ transform: `scale(${opacity === 0 ? 1.05 : scale})` }}
      >
        <div className="relative h-48 w-48 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_15px_rgba(var(--accent)/0.3)]">
          <Image
            src="/images/loading.png"
            alt="Simi Café Loading"
            fill
            sizes="192px"
            className="object-contain"
            priority
          />
        </div>
        <p className="font-display text-3xl tracking-widest text-[rgb(var(--accent))] drop-shadow-sm opacity-90">Simi Café</p>
      </div>
    </div>
  );
}
