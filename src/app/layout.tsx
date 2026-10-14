import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/sections/sidebar/mobile-nav";
import { SidebarContent } from "@/components/sections/sidebar/sidebar-content";
import { BackToTop } from "@/components/ui/back-to-top";
import { Background } from "@/components/ui/background";
import { InlineScript } from "@/components/ui/inline-script";
import { Providers } from "@/components/ui/providers";
import { GuidedTour } from "@/components/ui/tour/guided-tour";
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
  description: `Portfolio of ${site.name}.`,
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
          {/* z-10: above the page content, so things dragged or scrolled
              under it (the portrait) pass behind it. */}
          <aside className="border-border bg-bg/70 w-sidebar fixed inset-y-0 left-0 z-10 hidden border-r backdrop-blur-md lg:block">
            <SidebarContent id="desktop" />
          </aside>
          <MobileNav>
            <SidebarContent id="mobile" />
          </MobileNav>
          {/* tabIndex lets the back-to-top button move focus here.
              overflow-x-clip: things that reach past the content column (the
              portrait's layers, the dragged photo) may not widen the page.
              The clip edge is the screen edge, so they slide under the
              sidebar instead of being cut off before it. */}
          <div
            id="content"
            tabIndex={-1}
            className="lg:pl-sidebar overflow-x-clip outline-none"
          >
            {children}
          </div>
          <BackToTop />
          <GuidedTour />
        </Providers>
      </body>
    </html>
  );
}
