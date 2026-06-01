import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";

export const metadata: Metadata = {
  title: "Simi Café Admin",
  description: "Admin dashboard for managing Simi Café",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
