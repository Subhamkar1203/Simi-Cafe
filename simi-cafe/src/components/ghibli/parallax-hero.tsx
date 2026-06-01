"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Utensils, BookOpen, ChevronDown, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { FloatingParticles } from "./floating-particles";
import { cn } from "@/lib/utils";

export function ParallaxHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  // Cinematic scroll parallax effects
  const textY = useTransform(scrollY, [0, 1000], [0, 250]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const bgScale = useTransform(scrollY, [0, 1000], [1, 1.15]);

  useEffect(() => {
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setMousePos({ x, y }),
      );
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const parallaxStyle = (depth: number) => ({
    transform: `translate3d(${mousePos.x * depth}px, ${mousePos.y * depth}px, 0)`,
  });

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] overflow-hidden bg-black"
    >
      {/* 1. Deepest Background Layer (Sky/Atmosphere) */}
      <motion.div
        className="site-hero-background absolute inset-[-5%] will-change-transform opacity-95"
        style={{ ...parallaxStyle(25), scale: bgScale }}
        aria-hidden="true"
      />
      
      {/* 2. Soft Warm Ambient Glow */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,248,238,0.2)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_top,rgba(232,168,56,0.15)_0%,transparent_70%)] mix-blend-screen pointer-events-none" 
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgb(var(--background)_/_0.2)] dark:to-[rgb(var(--background)_/_0.4)] pointer-events-none" 
      />

      {/* 3. Floating Dust & Fireflies */}
      <FloatingParticles />

      {/* 4. Magical Vignette (Subtle) */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.15)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center px-5 text-center text-[#fff8ee] sm:px-8">
        <motion.div 
          className="relative flex flex-col items-center max-w-4xl will-change-transform px-4 py-8"
          style={{ y: textY, opacity }}
        >
          {/* Cinematic Overlay behind text */}
          <div className="absolute inset-0 bg-black/15 dark:bg-black/40 blur-[70px] rounded-full -z-10" />

          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#fff8ee]/50" />
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#fff8ee]/90 flex items-center gap-2">
              <Sparkles className="size-4 text-[rgb(var(--accent))]" /> Simi Café
            </p>
            <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#fff8ee]/50" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="font-serif text-[length:var(--fs-hero)] font-semibold leading-[1.1] drop-shadow-[0_4px_32px_rgba(0,0,0,0.8)]"
          >
            A cup of magic, <br/>
            <span className="italic text-[rgb(var(--accent))] mix-blend-screen opacity-95 font-medium block mt-3 drop-shadow-[0_4px_16px_rgba(232,168,56,0.3)]">a world of warmth.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mt-8 max-w-2xl text-[length:var(--fs-body)] leading-relaxed text-[#fff8ee]/90 font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] px-2 sm:px-0"
          >
            Step into a storybook corner. Soft mornings, glowing evenings, and charms earned one visit at a time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-10 sm:mt-12 flex w-full sm:w-auto flex-col sm:flex-row items-center gap-4 sm:gap-5 px-4 sm:px-0"
          >
            {/* Primary CTA */}
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-[15px] font-bold shadow-[0_0_40px_rgba(var(--accent)_/_0.3)] hover:shadow-[0_0_60px_rgba(var(--accent)_/_0.5)] hover:-translate-y-1 transition-all duration-300">
              <Link href="/reserve"><CalendarDays className="mr-2 size-5" /> Reserve Your Spot</Link>
            </Button>
            
            {/* Secondary CTA */}
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-8 h-14 bg-black/40 backdrop-blur-md border-[#fff8ee]/20 text-[#fff8ee] hover:bg-black/60 hover:text-[#fff8ee] shadow-[0_0_20px_rgba(0,0,0,0.5)] font-bold tracking-wide transition-all duration-300">
              <Link href="/menu"><Utensils className="mr-2 size-4" /> Explore Menu</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Cinematic Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#fff8ee]/60 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold">Discover</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="size-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
