"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-[0_14px_30px_rgba(111,76,32,0.22)] hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.72)] text-[rgb(var(--foreground))] backdrop-blur hover:bg-[rgb(var(--surface-raised)_/_0.9)]",
        ghost:
          "text-[rgb(var(--foreground))] hover:bg-[rgb(var(--surface-raised)_/_0.7)]",
        earth:
          "bg-[rgb(var(--earth))] text-[rgb(var(--cream))] hover:brightness-110",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-13 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
