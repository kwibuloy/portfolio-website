"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

/** Scrolls the sheet's scrollable area so the focused field is visible. */
function revealFocused(sheet: HTMLElement) {
  const field = document.activeElement;
  if (!(field instanceof HTMLElement) || !sheet.contains(field)) return;
  let scroller = field.parentElement;
  while (scroller && scroller !== sheet) {
    if (scroller.scrollHeight > scroller.clientHeight) break;
    scroller = scroller.parentElement;
  }
  if (!scroller || scroller === sheet) return;
  const box = scroller.getBoundingClientRect();
  const target = field.getBoundingClientRect();
  if (target.bottom > box.bottom)
    scroller.scrollTop += target.bottom - box.bottom;
  else if (target.top < box.top) scroller.scrollTop -= box.top - target.top;
}

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
    // Focus the field on desktop. On touch screens focus the panel instead,
    // so the keyboard waits for a tap.
    if (matchMedia("(pointer: coarse)").matches) element.focus();
    else element.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    // Phones: while the keyboard is up, cover exactly the visible area
    // (the visual viewport). Uses clientHeight because iOS shrinks
    // innerHeight with the keyboard. data-keyboard hides the chat suggestions.
    const viewport = window.visualViewport;
    if (!viewport) return;
    const fit = () => {
      const keyboard =
        document.documentElement.clientHeight - viewport.height > 80 &&
        !matchMedia("(min-width: 64rem)").matches;
      element.toggleAttribute("data-keyboard", keyboard);
      element.style.setProperty(
        "--sheet-height",
        `${(viewport.height * 5) / 6}px`,
      );
      Object.assign(
        element.style,
        keyboard
          ? {
              top: `${viewport.offsetTop}px`,
              bottom: "auto",
              height: `${viewport.height}px`,
              maxHeight: "none",
              margin: "0",
            }
          : { top: "", bottom: "", height: "", maxHeight: "", margin: "" },
      );
      if (keyboard) revealFocused(element);
    };
    fit();
    viewport.addEventListener("resize", fit);
    viewport.addEventListener("scroll", fit);

    // iOS Safari scrolls the page to a newly focused field, exposing the page
    // behind the sheet. Moving the field off screen for the frame it gains
    // focus prevents that (the same trick React Aria uses).
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const field = event.target;
      if (
        !(field instanceof HTMLElement) ||
        !field.matches("input:not([type=hidden]), textarea") ||
        field === document.activeElement ||
        // Ignore drags (scrolls) that end on a field.
        Math.abs(event.changedTouches[0].clientY - startY) > 10
      )
        return;
      event.preventDefault();
      field.style.transform = "translateY(-2000px)";
      field.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        field.style.transform = "";
      });
    };
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      viewport.removeEventListener("resize", fit);
      viewport.removeEventListener("scroll", fit);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
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
      className="panel border-border-strong bg-bg text-text mt-auto mr-auto mb-0 ml-0 max-h-(--sheet-height) w-full max-w-none flex-col overflow-hidden rounded-t-3xl border shadow-xl outline-none backdrop:bg-black/40 backdrop:backdrop-blur-xs open:flex lg:mb-6 lg:ml-78 lg:max-h-5/6 lg:w-112 lg:rounded-3xl"
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
