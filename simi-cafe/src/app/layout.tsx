import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito, Pacifico } from "next/font/google";
import { getImageProps } from "next/image";

import { Footer } from "@/components/ghibli/footer";
import { Navbar } from "@/components/ghibli/navbar";
import { Preloader } from "@/components/ui/preloader";
import { ThemeProvider } from "@/components/ui/theme";
import { CartSidebar } from "@/components/ui/cart-sidebar";
import { GlobalToaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { FloatingParticles } from "@/components/ghibli/floating-particles";
import { FloatingSticker } from "@/components/ghibli/floating-sticker";
import cloudinaryLoader from "@/lib/cloudinary-loader";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://simicafe.com"),
  title: {
    default: "Simi Café",
    template: "%s | Simi Café",
  },
  description:
    "A warm, storybook cafe website offering magical menus, cozy reservations, and loyalty charms. Step into our handcrafted world.",
  keywords: [
    "Simi Cafe",
    "Studio Ghibli Cafe",
    "Themed Cafe",
    "Magical Cafe",
    "Cafe Reservations",
    "Artisan Coffee",
  ],
  openGraph: {
    title: "Simi Café",
    description:
      "A warm, storybook cafe offering magical menus and cozy reservations.",
    url: "https://simicafe.com",
    siteName: "Simi Café",
    images: [
      {
        url: "https://res.cloudinary.com/dlupquidc/image/upload/f_auto,q_auto,c_fill,w_1200/simi-cafe/static/spirited_away_flowers",
        width: 1200,
        height: 630,
        alt: "Simi Cafe Atmospheric View",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simi Café",
    description: "Step into our handcrafted, storybook cafe.",
    images: ["https://res.cloudinary.com/dlupquidc/image/upload/f_auto,q_auto,c_fill,w_1200/simi-cafe/static/spirited_away_flowers"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const common = {
    alt: "Background",
    fill: true,
    priority: true,
    sizes: "(max-width: 768px) 100vw, 50vw",
    quality: 90 as const,
    loader: cloudinaryLoader,
  };

  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    src: "simi-cafe/static/Background",
  });

  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    src: "simi-cafe/static/BackgroundMobile",
  });

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${nunito.variable} ${cormorant.variable} ${pacifico.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground selection:bg-[rgb(var(--accent))] selection:text-[rgb(var(--accent-foreground))] overflow-x-hidden">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Preloader />

              {/* Background */}
              <div className="fixed inset-0 z-[-2] w-screen h-[100dvh] pointer-events-none overflow-hidden">
                <picture>
                  <source
                    media="(min-width: 768px)"
                    srcSet={desktop}
                  />
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobile}
                  />

                  <img
                    {...rest}
                    alt="Background overlay"
                    className="object-cover object-center saturate-105 brightness-105 dark:saturate-[0.88] dark:brightness-[0.7] transition-all duration-700 w-full h-full absolute inset-0"
                  />
                </picture>

                <div className="absolute inset-0 z-10 bg-[var(--page-overlay)] transition-colors duration-700" />
              </div>

              <div className="relative flex min-h-screen flex-col overflow-hidden">
                <FloatingParticles className="z-0 opacity-50" />

                <Navbar />

                <main className="flex-1 w-full relative z-10 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
                  {children}
                </main>

                <Footer />
              </div>

              <CartSidebar />
              <FloatingSticker />
              <GlobalToaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}