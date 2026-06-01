import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ImageLayer } from "@/components/ghibli/image-layer";
import { ParallaxSection } from "@/components/ghibli/parallax-section";
import { ScrollReveal } from "@/components/ghibli/scroll-reveal";

const timeline = [
  { year: "Dream", text: "A cafe imagined as a soft pause between busy days." },
  { year: "Brew", text: "Recipes shaped around warmth, comfort, and simple ingredients." },
  { year: "Charms", text: "A loyalty system designed to feel like collecting keepsakes." },
];

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story | Simi Cafe",
  description: "Learn about the history, dreams, and values behind Simi Cafe. A place designed to feel like collecting keepsakes.",
};

export default function OurStoryPage() {
  return (
    <div className="site-page pt-24 pb-32">
      <ParallaxSection
        eyebrow="Our Story"
        title="Some places stay with you. This is one of them."
        imageSrc="/images/arrietty_garden.jpg"
        imageAlt="A quiet storytelling garden scene"
      >
        <p>
          Simi Café began as a wish for a restaurant that felt handcrafted:
          warm lights, leafy corners, sincere food, and a little reward waiting
          for regular visitors.
        </p>
      </ParallaxSection>

      <section className="site-section py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <ScrollReveal className="site-hero-panel">
            <p className="text-sm font-bold uppercase tracking-[0.24em] site-eyebrow flex items-center gap-2">
              <Sparkles className="size-4 text-[rgb(var(--accent))]" /> Timeline
            </p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight">
              A small path through the woods.
            </h1>
          </ScrollReveal>
          <div className="grid gap-4">
            {timeline.map((event) => (
              <ScrollReveal key={event.year} className="rounded-2xl p-6 site-card">
                <p className="font-display text-3xl site-price">{event.year}</p>
                <p className="mt-2 site-muted">{event.text}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="overflow-hidden rounded-3xl border border-[rgb(var(--border-soft))] shadow-2xl">
              <div className="relative w-full h-[60vh] max-h-[60vh]">
                <Image 
                  src="/images/arrietty_garden.jpg" 
                  alt="Magical handcrafted café narrative" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
