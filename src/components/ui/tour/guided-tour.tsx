"use client";

import { MousePointer2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { tour } from "@/content/tour";
import { gsap, useGSAP } from "@/lib/gsap";
import { playTick } from "@/lib/preferences";
import { TOUR_DRAWER_EVENT, TOUR_SEEN_KEY, TOUR_START_EVENT } from "@/lib/tour";

/** How long after the home page loads the tour starts, so the hero's own
    entrance plays first. */
const START_DELAY = 1500;
/** Time per typed character, and the pause to read once a line is typed. */
const TYPE_MS = 28;
const READ_MS = 1400;
/** The bubble's width in rem (w-64) and the gap it keeps from the screen's
    edges, so it can be slid back on screen near an edge. */
const BUBBLE_REM = 16;
const MARGIN_REM = 1;

/** The pointer, selected inside the tour's GSAP scope. */
const POINTER = "[data-tour-pointer]";

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
 * visit: it greets them at the portrait, points at each social link in the
 * intro, then walks down the sidebar. It plays through on its own; Escape
 * ends it, and small screens get a Skip button. "Take the tour" in the
 * sidebar replays it.
 *
 * The pointer is moved by GSAP; the bubble inside it pops in and out with
 * Motion, so each library owns its own element. The full line is announced
 * to screen readers as each step starts, while the bubble types it out.
 */
export function GuidedTour() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;

  const layer = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const current = useRef<HTMLElement | null>(null);
  const pending = useRef(false);

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  // Where the bubble sits relative to the pointer's tip: shifted sideways to
  // stay on screen, and above the pointer near the bottom of the screen.
  const [bubble, setBubble] = useState({ x: 8, above: false });

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

        for (const [index, { target, text }] of tour.entries()) {
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
          const rem = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
          );
          const left = gsap.utils.clamp(
            MARGIN_REM * rem,
            window.innerWidth - (BUBBLE_REM + MARGIN_REM) * rem,
            x + 8,
          );
          setBubble({ x: left - x, above: y > window.innerHeight - 200 });
          setStep(index);
          setTyped("");
          await glide(x, y);
          if (signal.aborted) throw new Stopped();
          hover(element);
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

  const stop = useCallback(() => controller.current?.abort(), []);

  // First visit to the home page: play once the hero has come in.
  useEffect(() => {
    if (pathname !== "/") return;
    if (!pending.current && hasSeen()) return;
    pending.current = false;
    const timer = setTimeout(start, START_DELAY);
    return () => clearTimeout(timer);
  }, [pathname, start]);

  // Leaving the home page ends the tour.
  useEffect(() => {
    if (pathname !== "/") stop();
  }, [pathname, stop]);

  // "Take the tour": replay now, or go home first and play there.
  useEffect(() => {
    const onStart = () => {
      if (window.location.pathname === "/") {
        start();
        return;
      }
      pending.current = true;
      router.push("/");
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [router, start]);

  // Escape ends it. Scrolling or resizing keeps the pointer on its target
  // while it rests there.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    const follow = () => {
      const target = pointer.current;
      if (!target || !current.current || gsap.isTweening(target)) return;
      gsap.set(target, pointAt(current.current));
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, [active, stop]);

  useEffect(() => () => controller.current?.abort(), []);

  return (
    <div ref={layer}>
      {/* Announces each line in full as its step starts. */}
      <p className="sr-only" aria-live="polite">
        {active ? tour[step]?.text : ""}
      </p>

      <div
        ref={pointer}
        data-tour-pointer
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-50 opacity-0"
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
              style={{ left: bubble.x }}
              className={`border-border-strong bg-surface text-text absolute flex w-64 items-start gap-3 rounded-2xl border p-3 text-sm shadow-xl ${
                bubble.above
                  ? "bottom-full mb-2 origin-bottom-left"
                  : "top-full mt-2 origin-top-left"
              }`}
            >
              <span className="bg-accent text-on-accent flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs">
                {site.initials}
              </span>
              <p className="leading-snug">
                {typed}
                {typed !== tour[step]?.text && (
                  <span className="bg-text ml-0.5 inline-block h-3.5 w-px animate-pulse align-middle" />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {active && (
          <motion.button
            type="button"
            onClick={stop}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="border-border-strong bg-surface/90 text-text fixed right-4 bottom-6 z-50 flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm shadow-lg backdrop-blur-md lg:hidden"
          >
            <X aria-hidden className="size-4" />
            Skip tour
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
