"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { PreferenceToggles } from "@/components/ui/preference-toggles";
import { site } from "@/content/site";
import { TOUR_DRAWER_EVENT } from "@/lib/tour";

const iconButtonClass =
  "text-text-muted hover:bg-raised hover:text-text flex size-9 items-center justify-center rounded-full transition-colors";

/**
 * Top bar plus slide-in drawer for screens below the lg breakpoint. The drawer
 * is a native <dialog>: showModal() gives focus trapping, Escape to close, and
 * an inert page behind it without extra code. It slides with the CSS in
 * globals.css.
 */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);

  // The guided tour opens the drawer to point at the nav. It opens without
  // showModal(), so the page (and the tour's Skip button) stays usable.
  useEffect(() => {
    const onTour = (event: Event) => {
      const element = dialog.current;
      if (!element) return;
      const open = (event as CustomEvent<boolean>).detail;
      if (open && !element.open) element.show();
      if (!open && element.open) element.close();
    };
    window.addEventListener(TOUR_DRAWER_EVENT, onTour);
    return () => window.removeEventListener(TOUR_DRAWER_EVENT, onTour);
  }, []);

  return (
    <>
      <header className="border-border bg-bg/80 h-topbar sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="truncate font-mono text-sm font-medium">
          {site.name}
        </Link>
        <div className="flex items-center gap-2">
          <PreferenceToggles />
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Open menu"
            onClick={() => {
              const element = dialog.current;
              if (!element) return;
              element.showModal();
              // showModal() focuses the first link (the name), and iOS draws
              // a focus ring around it. Focus the drawer itself instead; Tab
              // still moves into the links.
              element.focus();
            }}
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </header>

      <dialog
        ref={dialog}
        aria-label="Menu"
        tabIndex={-1}
        className="drawer border-border bg-bg text-text w-sidebar fixed inset-y-0 left-0 z-40 m-0 h-dvh max-h-none max-w-full border-r outline-none"
        // Close when a link inside is followed, or when the backdrop (the
        // dialog element itself, outside its content) is clicked.
        onClick={(event) => {
          const target = event.target as Element;
          if (target === dialog.current || target.closest("a"))
            dialog.current?.close();
        }}
      >
        <div className="h-full">{children}</div>
        {/* No visible close button: a tap on the page beside the drawer
            closes it, as does Escape. This one is for screen readers. */}
        <button
          type="button"
          className="sr-only"
          onClick={() => dialog.current?.close()}
        >
          Close menu
        </button>
      </dialog>
    </>
  );
}
