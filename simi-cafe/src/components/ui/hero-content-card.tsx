import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroContentCardProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function HeroContentCard({
  eyebrow,
  title,
  description,
  children,
  className,
  as: TitleTag = "h1",
}: HeroContentCardProps) {
  return (
    <div className={cn("premium-hero-card", className)}>
      {eyebrow && (
        <div className="text-sm font-bold uppercase tracking-[0.24em] site-eyebrow flex items-center gap-2">
          {eyebrow}
        </div>
      )}
      <TitleTag className="mt-4 font-serif text-[length:var(--fs-h1)] font-semibold leading-[1.15] lg:leading-[1.1]">
        {title}
      </TitleTag>
      {description && (
        <div className="mt-6 text-base leading-relaxed site-muted sm:text-lg">
          {description}
        </div>
      )}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
