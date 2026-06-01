"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Sparkles,
} from "lucide-react";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/our-story", label: "Our Story" },
  { href: "/reserve", label: "Reserve" },
  { href: "/account", label: "Account" },
];

const socialLinks = [
  { href: "mailto:subhamkar1203@gmail.com", label: "Email", icon: Mail },
  { href: "https://wa.me/7439687971", label: "WhatsApp", icon: MessageCircle },
  { href: "#", label: "Instagram", icon: Camera },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname !== "/" && pathname !== "/privacy-policy") {
    return null;
  }

  return (
    <footer className="site-footer px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-14 md:pb-10 lg:pt-18">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <section className="footer-card rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[rgb(var(--accent)_/_0.18)] text-[rgb(var(--accent))]">
                <Sparkles className="size-5" />
              </span>
              <p className="font-display text-4xl leading-none">Simi Café</p>
            </div>
            <p className="mt-5 max-w-xl text-base leading-8 footer-muted">
              A warm corner for hand-brewed drinks, storybook plates, and charms
              earned one visit at a time.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-current/10 px-4 py-2 text-sm font-bold footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="footer-card rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[rgb(var(--accent))]">
              Visit
            </p>
            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-[rgb(var(--accent))]" />
                <div>
                  <p className="font-bold">Simi Café, India</p>
                  <p className="mt-1 text-sm footer-muted">A cozy table is waiting.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-1 size-5 shrink-0 text-[rgb(var(--accent))]" />
                <div>
                  <p className="font-bold">10:00 AM - 10:00 PM</p>
                  <p className="mt-1 text-sm footer-muted">Open daily for soft mornings and glowing evenings.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Moon className="mt-1 size-5 shrink-0 text-[rgb(var(--accent))]" />
                <div>
                  <p className="font-bold">Pay at Counter</p>
                  <p className="mt-1 text-sm footer-muted">Cash or counter payment only.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="footer-card rounded-[1.75rem] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[rgb(var(--accent))]">
              Connect
            </p>
            <p className="mt-5 text-sm leading-7 footer-muted">
              Send a note, ask about a table, or follow the café glow after
              sunset.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="footer-icon-button grid size-12 place-items-center rounded-full"
                  >
                    <Icon className="size-5" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-current/10 pt-6 text-sm footer-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Simi Café. Brewed for quiet moments.</p>
          <div className="flex gap-4 text-xs font-medium opacity-80 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-[rgb(var(--foreground))] hover:underline transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[rgb(var(--foreground))] hover:underline transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[rgb(var(--foreground))] hover:underline transition-colors">Reservation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
