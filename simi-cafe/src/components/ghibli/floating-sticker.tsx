"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingSticker() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="hidden md:block fixed bottom-6 right-6 z-50 pointer-events-auto cursor-pointer"
      initial={{ y: 100, rotate: -20, opacity: 0 }}
      animate={{ y: 0, rotate: 0, opacity: 1 }}
      transition={{ 
        type: "tween", 
        ease: "easeOut",
        duration: 0.8,
        delay: 2 // appears after initial load
      }}
      whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
    >
      {/* CSS Soot Sprite */}
      <motion.div 
        className="relative size-10 rounded-full bg-[#111] shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
      >
        {/* Fuzziness / Spikes (simulated with rotated squares behind) */}
        <div className="absolute inset-0 bg-[#111] rotate-45 rounded-xl -z-10 scale-95" />
        <div className="absolute inset-0 bg-[#111] rotate-[22.5deg] rounded-xl -z-10 scale-95" />
        <div className="absolute inset-0 bg-[#111] rotate-[67.5deg] rounded-xl -z-10 scale-95" />
        
        {/* Eyes */}
        <div className="absolute left-2 top-2.5 flex gap-1.5">
          <motion.div 
            className="size-2 rounded-full bg-white relative overflow-hidden"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
          >
            <div className="absolute top-[2px] right-[2px] size-1 rounded-full bg-black" />
          </motion.div>
          <motion.div 
            className="size-2 rounded-full bg-white relative overflow-hidden"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 4 }}
          >
            <div className="absolute top-[2px] right-[2px] size-1 rounded-full bg-black" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
