"use client";

import { MousePointer2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { tour } from "@/content/tour";
import { gsap, useGSAP } from "@/lib/gsap";
import { playTick } from "@/lib/preferences";
import {
  TOUR_DRAWER_EVENT,
  TOUR_SEEN_KEY,
  TOUR_START_EVENT,
  takeTourRequest,
} from "@/lib/tour";

/** How long after the home page loads the tour starts, so the hero's own
    entrance plays first. */
const START_DELAY = 1500;
/** Time per typed character, and the pause to read once a line is typed. */
const TYPE_MS = 28;
const READ_MS = 1400;
/** The bubble's width in rem (w-64), the height a long line takes, the gap
    it keeps from the screen's edges and from the target, and the pointer's
    size, all in rem. Used to decide where the bubble fits. */
const BUBBLE_REM = 16;
const BUBBLE_HEIGHT_REM = 7;
const MARGIN_REM = 1;
const GAP_REM = 0.25;
// The arrow icon is 1.5rem, nudged up 0.25rem so its tip is on the point.
const POINTER_REM = 1.25;

/** The pointer, selected inside the tour's GSAP scope. */
const POINTER = "[data-tour-pointer]";

/** Anything the visitor does that means "let me look around myself": it ends
    the tour, or stops it from starting. Plain mouse movement does not count,
    so the visitor can follow along. */
const INPUT_EVENTS = ["keydown", "wheel", "touchmove", "pointerdown"] as const;

/** Calls `onInput` on the visitor's first scroll, click, tap or key press. */
function onVisitorInput(onInput: () => void) {
  // Capture, so a part of the page that stops the event (the tech keyboard
  // stops wheel events) cannot hide it from the tour.
  const options = { capture: true, passive: true };
  INPUT_EVENTS.forEach((type) =>
    window.addEventListener(type, onInput, options),
  );
  return () =>
    INPUT_EVENTS.forEach((type) =>
      window.removeEventListener(type, onInput, options),
    );
}

class Stopped extends Error {}

/** Waits, or throws Stopped as soon as the tour is stopped. */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new Stopped());
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Stopped());
    });
  });
}

/** The visible copy of a tour target. The sidebar is rendered twice (desktop
    and mobile drawer), and only one of them is on screen at a time. */
function findTarget(name: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`),
  ).find((element) => element.getClientRects().length > 0);
}

/** Where the pointer's tip goes on a target: a little below its middle, the
    way a hand would rest a cursor on a link. */
function pointAt(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height * 0.6 };
}

/** Where the bubble goes, relative to the pointer's tip: `x` to its left
    edge, `y` to its top edge (or its bottom edge when `above`). */
type Placement = { x: number; y: number; above: boolean };

/**
 * Places the bubble next to the target without covering it: below the
 * whole target when there is room, otherwise above it (the Skip button at
 * the bottom of the screen gets it above). Sideways it starts just right of
 * the pointer, flips to end at the pointer near the right edge, and always
 * stays on screen.
 *
 * `anchor: "pointer"` (the portrait) hangs it just under the pointer
 * instead, or just over it near the bottom of the screen: on a big target,
 * clearing the whole target would put the bubble far from the pointer.
 */
function placeBubble(
  box: DOMRect,
  x: number,
  y: number,
  anchor: "pointer" | "target" = "target",
): Placement {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const gap = GAP_REM * rem;
  const width = BUBBLE_REM * rem;
  const margin = MARGIN_REM * rem;

  if (anchor === "pointer") {
    const above = y > window.innerHeight - BUBBLE_HEIGHT_REM * rem - margin;
    const left = gsap.utils.clamp(
      margin,
      window.innerWidth - width - margin,
      x + 2 * gap,
    );
    return {
      x: left - x,
      y: above ? -2 * gap : POINTER_REM * rem + 2 * gap,
      above,
    };
  }

  const needed = BUBBLE_HEIGHT_REM * rem + gap + margin;
  const spaceBelow = window.innerHeight - box.bottom;
  const above = spaceBelow < needed && box.top > spaceBelow;

  let left = x + gap;
  if (left + width > window.innerWidth - margin) left = x - width + gap;
  left = gsap.utils.clamp(margin, window.innerWidth - width - margin, left);

  return {
    x: left - x,
    y: above
      ? box.top - y - gap
      : // Clear the pointer icon too, which hangs below its tip.
        Math.max(box.bottom - y, POINTER_REM * rem) + gap,
    above,
  };
}

/**
 * Moves the page's hover state from one element to another, as a real mouse
 * would. React builds onPointerEnter / onPointerLeave from pointerout and
 * pointerover with their relatedTarget, so this drives hover effects that
 * live in React state (the nav's sliding pill). CSS hover effects follow the
 * data-tour-active attribute instead (see the hover variant in globals.css).
 */
function moveHover(from: HTMLElement | null, to: HTMLElement | null) {
  const point = to ? pointAt(to) : { x: 0, y: 0 };
  const init = {
    bubbles: true,
    cancelable: true,
    clientX: point.x,
    clientY: point.y,
    pointerType: "mouse",
    isPrimary: true,
  };
  from?.dispatchEvent(
    new PointerEvent("pointerout", { ...init, relatedTarget: to }),
  );
  to?.dispatchEvent(
    new PointerEvent("pointerover", { ...init, relatedTarget: from }),
  );
  // Hovers that follow the pointer inside the element (the portrait's
  // layers) settle once on where it rests.
  to?.dispatchEvent(new PointerEvent("pointermove", init));
}

function storeSeen() {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // Storage blocked: the tour may play again on the next visit.
  }
}

function hasSeen() {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) !== null;
  } catch {
    return true;
  }
}

/**
 * A cursor with a chat bubble that tours the home page on a visitor's first
 * visit: it greets them at the portrait, points at the Skip button to say how
 * to end the tour, points at each social link in the intro, then walks down
 * the sidebar. It plays through on its own. Skip, Escape, or any scroll,
 * click, tap or key press ends it. "Take the tour" in the sidebar replays it
 * (see tour-loader.tsx, which loads this component).
 *
 * The pointer is moved by GSAP; the bubble inside it pops in and out with
 * Motion, so each library owns its own element. The full line is announced
 * to screen readers as each step starts, while the bubble types it out.
 */
export function GuidedTour() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion() ?? false;

  const layer = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const current = useRef<HTMLElement | null>(null);
  const pending = useRef(false);

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  // The current step's full line: its text, or touchText on touch screens.
  const [line, setLine] = useState("");
  const [typed, setTyped] = useState("");
  // True while there is a tour on screen to skip.
  const [skippable, setSkippable] = useState(false);
  // Where the bubble sits relative to the pointer's tip (see placeBubble).
  const [bubble, setBubble] = useState<Placement>({
    x: 8,
    y: 24,
    above: false,
  });

  const { contextSafe } = useGSAP({ scope: layer });

  /** Glides the pointer to a point. x and y use different eases, so the
      path bends a little, like a hand moving a mouse, instead of running
      in a ruler-straight line. */
  const glide = contextSafe((x: number, y: number) => {
    const target = POINTER;
    if (reducedMotion) {
      gsap.set(target, { x, y });
      return Promise.resolve();
    }
    const distance = Math.hypot(
      x - Number(gsap.getProperty(target, "x")),
      y - Number(gsap.getProperty(target, "y")),
    );
    const duration = gsap.utils.clamp(0.45, 1.1, distance / 900);
    return new Promise<void>((resolve) => {
      gsap.to(target, { x, duration, ease: "power2.inOut" });
      gsap.to(target, {
        y,
        duration,
        ease: "power3.inOut",
        onComplete: resolve,
      });
    });
  });

  const fade = contextSafe((visible: boolean) => {
    const target = POINTER;
    return new Promise<void>((resolve) => {
      gsap.to(target, {
        autoAlpha: visible ? 1 : 0,
        duration: reducedMotion ? 0 : 0.3,
        onComplete: resolve,
      });
    });
  });

  /** Rests the pointer on `element`: its hover animations play (CSS ones
      through data-tour-active, React ones through pointer events). */
  const hover = (element: HTMLElement | null) => {
    const previous = current.current;
    previous?.removeAttribute("data-tour-active");
    moveHover(previous, element);
    current.current = element;
    element?.setAttribute("data-tour-active", "");
  };

  const play = useCallback(
    async (signal: AbortSignal) => {
      const desktop = matchMedia("(min-width: 64rem)").matches;
      const touch = matchMedia("(hover: none)").matches;
      let drawerOpen = false;
      const drawer = (open: boolean) => {
        drawerOpen = open;
        window.dispatchEvent(
          new CustomEvent(TOUR_DRAWER_EVENT, { detail: open }),
        );
      };

      try {
        setActive(true);
        setTyped("");
        // Enter from the bottom right corner.
        if (pointer.current)
          gsap.set(pointer.current, {
            x: window.innerWidth * 0.8,
            y: window.innerHeight * 0.9,
          });
        await fade(true);

        for (const [index, { target, bubbleAt, ...copy }] of tour.entries()) {
          const text = (touch && copy.touchText) || copy.text;

          // On small screens the nav lives in the drawer: open it first and
          // let it slide in.
          const inSidebar = target.startsWith("nav-") || target === "ask";
          if (inSidebar && !desktop && !drawerOpen) {
            drawer(true);
            await wait(450, signal);
          }

          const element = findTarget(target);
          if (!element) continue;

          // Bring targets on the page (not the fixed sidebar) into view.
          const box = element.getBoundingClientRect();
          if (box.top < 64 || box.bottom > window.innerHeight - 64) {
            element.scrollIntoView({
              block: "center",
              behavior: reducedMotion ? "auto" : "smooth",
            });
            await wait(reducedMotion ? 0 : 600, signal);
          }

          const { x, y } = pointAt(element);
          setBubble(
            placeBubble(element.getBoundingClientRect(), x, y, bubbleAt),
          );
          setStep(index);
          setLine(text);
          setTyped("");
          await glide(x, y);
          if (signal.aborted) throw new Stopped();
          hover(element);
          // Skip shows once the tour has something on screen, so it is
          // never there without a tour to skip.
          setSkippable(true);
          playTick();

          if (reducedMotion) {
            setTyped(text);
          } else {
            for (let count = 1; count <= text.length; count++) {
              setTyped(text.slice(0, count));
              await wait(TYPE_MS, signal);
            }
          }
          await wait(READ_MS + text.length * 12, signal);
        }
      } catch (error) {
        if (!(error instanceof Stopped)) throw error;
      } finally {
        if (drawerOpen) drawer(false);
        // A replay may already have taken over; leave its pointer alone.
        if (controller.current?.signal === signal) {
          setSkippable(false);
          hover(null);
          await fade(false);
          setActive(false);
        }
      }
    },
    [fade, glide, reducedMotion],
  );

  const start = useCallback(() => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    storeSeen();
    void play(next.signal);
  }, [play]);

  // Skip goes away the moment the tour is stopped, not after the pointer has
  // faded out.
  const stop = useCallback(() => {
    setSkippable(false);
    controller.current?.abort();
  }, []);

  // On the home page: play once the hero has come in, on a first visit or
  // when "Take the tour" was pressed on another page. A first-visit tour that
  // has not started yet is called off if the visitor is already scrolling or
  // clicking around.
  useEffect(() => {
    if (pathname !== "/") return;
    // Kept in a ref, so it survives the effect running twice in development.
    pending.current ||= takeTourRequest();
    const requested = pending.current;
    if (!requested && hasSeen()) return;
    const timer = setTimeout(() => {
      pending.current = false;
      start();
    }, START_DELAY);
    const removeListeners = requested
      ? undefined
      : // The visitor chose to look around: count it as seen, so the tour
        // does not keep waiting for them on every visit.
        onVisitorInput(() => {
          clearTimeout(timer);
          storeSeen();
        });
    return () => {
      clearTimeout(timer);
      removeListeners?.();
    };
  }, [pathname, start]);

  // Leaving the home page ends the tour.
  useEffect(() => {
    // The tour's own cleanup hides Skip, so no state is set here.
    if (pathname !== "/") controller.current?.abort();
  }, [pathname]);

  // "Take the tour" on the home page: replay now. From another page,
  // tour-loader.tsx goes home and the effect above picks the request up.
  useEffect(() => {
    const onStart = () => {
      if (window.location.pathname === "/" && takeTourRequest()) start();
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [start]);

  // Any scroll, click, tap or key press (Escape included) ends it. Resizing
  // keeps the pointer on its target while it rests there.
  useEffect(() => {
    if (!active) return;
    const follow = () => {
      const target = pointer.current;
      if (!target || !current.current || gsap.isTweening(target)) return;
      gsap.set(target, pointAt(current.current));
    };
    const removeListeners = onVisitorInput(stop);
    window.addEventListener("resize", follow);
    return () => {
      removeListeners();
      window.removeEventListener("resize", follow);
    };
  }, [active, stop]);

  useEffect(() => () => controller.current?.abort(), []);

  return (
    <div ref={layer}>
      {/* Announces each line in full as its step starts. */}
      <p className="sr-only" aria-live="polite">
        {active ? line : ""}
      </p>

      <div
        ref={pointer}
        data-tour-pointer
        aria-hidden
        // z-60: above the Skip button (z-50), so the pointer rests on top of
        // it instead of sliding underneath.
        className="pointer-events-none invisible fixed top-0 left-0 z-60 opacity-0"
      >
        <MousePointer2 className="fill-accent text-bg size-6 -translate-x-1 -translate-y-1 drop-shadow-md" />
        <AnimatePresence mode="wait">
          {active && typed && (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              // Placed by placeBubble. Above the target, y: -100% lifts the
              // bubble so its bottom edge sits at `top`.
              style={{
                left: bubble.x,
                top: bubble.y,
                y: bubble.above ? "-100%" : 0,
              }}
              className={`border-border-strong bg-surface text-text absolute top-0 left-0 flex w-64 items-start gap-3 rounded-2xl border p-3 text-sm shadow-xl ${
                bubble.above ? "origin-bottom" : "origin-top"
              }`}
            >
              <span className="bg-accent text-on-accent flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs">
                {site.initials}
              </span>
              <p className="leading-snug">
                {typed}
                {typed !== line && (
                  <span className="bg-text ml-0.5 inline-block h-3.5 w-px animate-pulse align-middle motion-reduce:animate-none" />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {skippable && (
          <motion.button
            type="button"
            data-tour="tour-skip"
            aria-keyshortcuts="Escape"
            onClick={stop}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="border-border-strong bg-surface/90 text-text hover:bg-raised fixed right-4 bottom-6 z-50 flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm shadow-lg backdrop-blur-md"
          >
            <X aria-hidden className="size-4" />
            Skip tour
            {/* Only where there is likely a keyboard. */}
            <kbd
              aria-hidden
              className="border-border-strong text-text-subtle hidden rounded border px-1.5 font-mono text-xs [@media(hover:hover)]:inline"
            >
              Esc
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
