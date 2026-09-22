import type { Metadata, Viewport } from "next";
import { Inter, Syne, Space_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UNBOUND — Break the loop. Build yourself.",
    template: "%s | UNBOUND",
  },
  description:
    "A privacy-first personal recovery and self-development platform. Understand your patterns, interrupt urges, build better habits, track your growth.",
  keywords: [
    "habit change",
    "behavior change",
    "personal recovery",
    "self development",
    "habit tracking",
    "urge management",
    "mental wellness",
  ],
  authors: [{ name: "UNBOUND" }],
  creator: "UNBOUND",
  openGraph: {
    type: "website",
    siteName: "UNBOUND",
    title: "UNBOUND — Break the loop. Build yourself.",
    description:
      "Understand your patterns. Interrupt urges. Build better habits. Track your growth.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UNBOUND",
    description: "Break the loop. Build yourself.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-white.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/logo-white.png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${spaceGrotesk.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-bg text-text antialiased font-sans relative min-h-screen">
        <AmbientBackground />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
