import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, Coffee, Sparkles, BookOpen } from "lucide-react";

import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Button } from "@/components/ui/button";
import { ParallaxHero } from "@/components/ghibli/parallax-hero";
import { ParallaxSection } from "@/components/ghibli/parallax-section";
import { ScrollReveal } from "@/components/ghibli/scroll-reveal";
import { HeroContentCard } from "@/components/ui/hero-content-card";

const menuPreview = [
  { name: "Forest Matcha Latte", price: "₹180", copy: "Ceremonial matcha, steamed milk, amber honey.", image: "simi-cafe/static/sticker1" },
  { name: "Calcifer Cocoa", price: "₹160", copy: "Dark cocoa with a tiny chilli warmth.", image: "simi-cafe/static/sticker2" },
  { name: "Meadow Sandwich", price: "₹220", copy: "Grilled vegetables, basil butter, soft bread.", image: "simi-cafe/static/sticker3" },
];

const charmSteps = [
  "Visit Simi Café",
  "Staff confirms your visit",
  "Every 3rd visit unlocks a charm",
];

export default function Home() {
  return (
    <>
      <ParallaxHero />

      <section className="site-section pb-safe pt-10 sm:py-16 md:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ScrollReveal>
            <HeroContentCard
              className="mx-auto max-w-3xl text-center"
              as="h2"
              eyebrow={<><Sparkles className="size-4 text-[rgb(var(--accent))]" /> Pay at counter</>}
              title="Browse, reserve, collect charms."
              description="No delivery-app clutter, no online payment gateway. Just a beautiful cafe flow for planning visits and tracking rewards."
            />
          </ScrollReveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {menuPreview.map((item) => (
              <ScrollReveal key={item.name} className="flex flex-col justify-between rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl site-card group">
                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(var(--surface-muted))] transition-transform group-hover:scale-110">
                    <Coffee className="size-7 site-price" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">{item.name}</h3>
                  <p className="mt-3 text-base leading-relaxed site-muted">{item.copy}</p>
                </div>
                <p className="mt-8 text-xl font-bold site-price">{item.price}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ParallaxSection
        eyebrow="Corners"
        title="Each table has its own little weather."
        imageSrc="simi-cafe/static/spirited_away_flowers"
        imageAlt="Spirited Away Flowers"
        className="site-section"
      >
        <p>
          Choose a quiet forest mood, a bright garden table, or a meadow window.
          The cafe pages use the uploaded images as warm placeholders so the
          whole site already feels alive.
        </p>
        <div className="mt-8">
          <AnimatedTabs />
        </div>
      </ParallaxSection>

      <section className="site-section pb-safe pt-10 sm:py-16 md:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <HeroContentCard
              as="h2"
              eyebrow={<><Sparkles className="size-4 text-[rgb(var(--accent))]" /> Loyalty charms</>}
              title="Your third visit becomes a tiny treasure."
              description="Charms are tracked on the account page and confirmed by staff from the future admin panel."
            />
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {charmSteps.map((step, index) => (
              <ScrollReveal key={step} className="flex flex-col items-center text-center rounded-[2.5rem] p-8 site-card transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="grid size-16 place-items-center rounded-full bg-[rgb(var(--accent))] font-serif text-xl font-bold text-[rgb(var(--accent-foreground))] shadow-md">
                  {index + 1}
                </div>
                <p className="mt-6 text-lg font-semibold leading-snug">{step}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-safe pt-10 sm:py-16 md:py-24 sm:px-8">
        <ScrollReveal className="mx-auto flex max-w-5xl flex-col items-center rounded-[3rem] p-10 text-center shadow-2xl sm:p-16 site-dark-panel border border-[rgb(var(--border-soft)_/_0.2)]">
          <Sparkles className="size-9 text-[rgb(var(--accent))]" />
          <h2 className="mt-5 font-serif text-[length:var(--fs-h2)] font-semibold leading-tight">
            Ready for your Simi Café afternoon?
          </h2>
          <p className="mt-4 max-w-2xl opacity-75">
            Reserve a table, browse the menu, and remember: all orders are paid
            at the counter.
          </p>
          <div className="mt-8 flex flex-col gap-4 w-full sm:w-auto sm:flex-row flex-wrap justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/reserve"><CalendarDays /> Reserve</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/menu"><BadgeCheck /> See Menu <ArrowRight /></Link>
            </Button>
            <Button asChild variant="ghost" className="bg-[rgb(var(--surface))] w-full sm:w-auto">
              <Link href="/our-story"><BookOpen className="mr-2 size-4" /> Our Story</Link>
            </Button>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
