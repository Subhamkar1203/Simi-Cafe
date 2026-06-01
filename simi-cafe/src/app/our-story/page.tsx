import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ImageLayer } from "@/components/ghibli/image-layer";
import { ParallaxSection } from "@/components/ghibli/parallax-section";
import { ScrollReveal } from "@/components/ghibli/scroll-reveal";
import { HeroContentCard } from "@/components/ui/hero-content-card";
import cloudinaryLoader from "@/lib/cloudinary-loader";

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
    <div className="site-page pt-6 sm:pt-8 md:pt-24 pb-32">
      <ParallaxSection
        eyebrow="Our Story"
        title="Some places stay with you. This is one of them."
        imageSrc="simi-cafe/static/arrietty_garden"
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
          <ScrollReveal>
            <HeroContentCard
              eyebrow={<><Sparkles className="size-4 text-[rgb(var(--accent))]" /> Timeline</>}
              title="A small path through the woods."
            />
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
                  src={cloudinaryLoader({ src: "simi-cafe/static/arrietty_garden", width: 1024 })} 
                  alt="Magical handcrafted café narrative" 
                  fill
                  unoptimized
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
