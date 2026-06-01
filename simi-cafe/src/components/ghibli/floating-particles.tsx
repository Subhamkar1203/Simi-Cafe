"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const generateParticles = () => Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 15 + Math.random() * 20,
  size: Math.random() > 0.8 ? "h-2 w-2" : "h-1 w-1",
  opacity: 0.1 + Math.random() * 0.2,
}));

export function FloatingParticles({ className }: { className?: string }) {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  useEffect(() => {
    // eslint-disable-next-line
    setParticles(generateParticles());
  }, []);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(
            "absolute bottom-[-5%] rounded-full bg-[rgb(var(--cream))] shadow-[0_0_16px_rgba(255,248,238,0.9)] will-change-transform",
            particle.size,
          )}
          initial={{ x: `${particle.x}vw`, y: "100%", opacity: 0 }}
          animate={{ 
            y: "-120vh", 
            x: [`${particle.x}vw`, `${particle.x - 5}vw`, `${particle.x + 5}vw`, `${particle.x}vw`],
            opacity: [0, particle.opacity, particle.opacity, 0] 
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
            x: { duration: particle.duration, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      ))}
    </div>
  );
}
