"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * A panel that opens beside the sidebar (or as a bottom sheet on small
 * screens). It is a native <dialog>, which gives focus trapping, Escape to
 * close, and an inert page behind it. The slide-in is the `.panel` CSS in
 * globals.css.
 */
export function SidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      element.close();
      return;
    }
    element.showModal();
    // showModal() focuses the first control, which is the close button.
    // With a mouse or keyboard, move focus to the field the visitor is here
    // to use. On a touch screen that would pop the keyboard up over the
    // panel before they asked for it, so focus the panel itself instead and
    // let a tap on a field bring the keyboard up.
    if (matchMedia("(pointer: coarse)").matches) element.focus();
    else element.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    // On phones the keyboard covers the bottom of the layout viewport, where
    // the sheet is pinned. The visual viewport is the part still visible, so
    // lift the sheet by the covered height and fit it into what is left. The
    // lg: classes override both, so desktop never uses them.
    // documentElement.clientHeight is the layout viewport, which keeps its
    // height when the keyboard opens (iOS shrinks window.innerHeight with it).
    const viewport = window.visualViewport;
    if (!viewport) return;
    const fit = () => {
      const covered =
        document.documentElement.clientHeight -
        viewport.height -
        viewport.offsetTop;
      // More than a toolbar's height covered means the keyboard is up. The
      // sheet then takes all the room left, and data-keyboard lets the
      // panels drop what is not needed while typing (the chat suggestions).
      const keyboard =
        covered > 80 && !matchMedia("(min-width: 64rem)").matches;
      element.toggleAttribute("data-keyboard", keyboard);
      element.style.setProperty(
        "--keyboard-inset",
        `${Math.max(0, covered)}px`,
      );
      element.style.setProperty(
        "--sheet-height",
        `${keyboard ? viewport.height : (viewport.height * 5) / 6}px`,
      );
    };
    fit();
    viewport.addEventListener("resize", fit);
    viewport.addEventListener("scroll", fit);
    return () => {
      viewport.removeEventListener("resize", fit);
      viewport.removeEventListener("scroll", fit);
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      tabIndex={-1}
      onClose={onClose}
      // A click on the dialog element itself is a click on the backdrop.
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      className="panel border-border-strong bg-bg text-text mt-auto mr-auto mb-(--keyboard-inset) ml-0 max-h-(--sheet-height) w-full max-w-none flex-col overflow-hidden rounded-t-3xl border shadow-xl outline-none backdrop:bg-black/40 backdrop:backdrop-blur-xs open:flex lg:mb-6 lg:ml-78 lg:max-h-5/6 lg:w-112 lg:rounded-3xl"
    >
      <header className="border-border flex items-center justify-between gap-4 border-b px-6 py-4">
        <h2 className="font-mono text-sm font-medium">{title}</h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="text-text-muted hover:bg-raised hover:text-text flex size-9 items-center justify-center rounded-full transition hover:rotate-90 motion-reduce:transition-none"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>
      {/* Rendered only while open, so each opening starts fresh. */}
      {open && children}
    </dialog>
  );
}
