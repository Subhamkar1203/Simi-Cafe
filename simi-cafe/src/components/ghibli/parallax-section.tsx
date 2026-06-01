"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";
import cloudinaryLoader from "@/lib/cloudinary-loader";

interface ParallaxSectionProps {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
  className?: string;
}

export function ParallaxSection({
  eyebrow,
  title,
  children,
  imageSrc,
  imageAlt = "",
  reverse,
  className,
}: ParallaxSectionProps) {
  return (
    <section className={cn("relative overflow-hidden py-20 sm:py-28", className)}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
        <ScrollReveal className={cn("site-hero-panel", reverse && "lg:order-2")}>
          {eyebrow && (
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] site-eyebrow flex items-center gap-2">
              <Sparkles className="size-4 text-[rgb(var(--accent))]" /> {eyebrow}
            </p>
          )}
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h2>
          <div className="mt-6 text-lg leading-relaxed site-muted">{children}</div>
        </ScrollReveal>

        {imageSrc && (
          <ScrollReveal className={cn(reverse && "lg:order-1")}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-[rgb(var(--border-soft))] shadow-2xl">
              <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loader={cloudinaryLoader} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d2b1f]/20 to-transparent" />
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
