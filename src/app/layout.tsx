import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/sections/sidebar/mobile-nav";
import { SidebarContent } from "@/components/sections/sidebar/sidebar-content";
import { Background } from "@/components/ui/background";
import { InlineScript } from "@/components/ui/inline-script";
import { Providers } from "@/components/ui/providers";
import { site } from "@/content/site";
import { preferencesScript } from "@/lib/preferences";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: `Portfolio of ${site.name}, a developer building interactive, animated, and accessible web experiences.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script sets data-theme / data-sound
    // from the visitor's saved preferences before React hydrates.
    <html
      lang="en"
      data-theme="light"
      data-sound="off"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={preferencesScript} />
      </head>
      <body className="min-h-full">
        <Providers>
          <a
            href="#content"
            className="bg-accent text-on-accent sr-only z-20 rounded-lg px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <Background />
          <aside className="border-border bg-bg/70 w-sidebar fixed inset-y-0 left-0 hidden border-r backdrop-blur-md lg:block">
            <SidebarContent id="desktop" />
          </aside>
          <MobileNav>
            <SidebarContent id="mobile" />
          </MobileNav>
          <div id="content" className="lg:pl-sidebar">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
