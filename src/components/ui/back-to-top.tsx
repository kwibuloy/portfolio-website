"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// GSAP is fetched only once the button shows, so pages that never need it
// (most of them) do not download it. The import is cached after the first.
const loadGsap = () => import("@/lib/gsap-scroll-to").then((m) => m.gsap);
type Timeline = ReturnType<Awaited<ReturnType<typeof loadGsap>>["timeline"]>;

/** Pages shorter than this many screens never show the button. */
const LONG_PAGE = 2.5;
/** The button appears within this many screens of the bottom. */
const NEAR_BOTTOM = 0.6;
/** Number of wind streaks that rush past while the page scrolls up. */
const STREAKS = 18;

/**
 * A button at the bottom centre of long pages. On click it pops away and the
 * page scrolls back to the top while streaks of wind rush down the screen, so
 * it feels like flying up.
 *
 * Motion pops the button in and out; GSAP runs the scroll and the wind, so the
 * two libraries never drive the same element.
 */
export function BackToTop() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion() ?? false;
  const [atBottom, setAtBottom] = useState(false);
  const [flying, setFlying] = useState(false);
  const scope = useRef<HTMLDivElement>(null);

  // Re-measured on scroll, resize, content changes, and route changes.
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const { scrollHeight } = document.documentElement;
      const screen = window.innerHeight;
      setAtBottom(
        scrollHeight > screen * LONG_PAGE &&
          window.scrollY + screen >= scrollHeight - screen * NEAR_BOTTOM,
      );
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(check);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  const flight = useRef<Timeline | null>(null);

  // Fetch GSAP as the button appears, so the click has no wait. A failure
  // here is handled when the button is pressed.
  useEffect(() => {
    if (atBottom) loadGsap().catch(() => {});
  }, [atBottom]);

  // This component lives in the root layout and never unmounts, so a link
  // clicked mid-flight would leave the flight scrolling the new page. Jump it
  // to its end instead, which also runs `done` and brings the button back.
  useEffect(() => {
    flight.current?.progress(1);
  }, [pathname]);

  const launch = async () => {
    // Keyboard focus moves to the top too, instead of staying at the bottom.
    const done = () => {
      setFlying(false);
      document.getElementById("content")?.focus({ preventScroll: true });
    };
    const jump = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      done();
    };
    if (reducedMotion) {
      jump();
      return;
    }

    // Hides the button for the length of the flight.
    setFlying(true);
    let gsap: Awaited<ReturnType<typeof loadGsap>>;
    try {
      gsap = await loadGsap();
    } catch {
      // GSAP did not download (offline, or a redeploy): no flight, but the
      // page still goes to the top.
      jump();
      return;
    }
    const { random, selector } = gsap.utils;
    // Streaks are looked up inside this component only.
    const wind = selector(scope)(".back-to-top-wind");
    const screen = window.innerHeight;
    gsap.set(wind, {
      x: () => random(0, window.innerWidth),
      y: -screen * 0.4,
      scaleY: () => random(0.5, 1.6),
      opacity: () => random(0.35, 0.8),
    });
    flight.current = gsap
      .timeline({ onComplete: done })
      .to(window, { scrollTo: 0, duration: 1, ease: "power3.inOut" }, 0)
      // Streaks move down the screen, the opposite way to the scroll, at
      // slightly different speeds so they read as wind and not a pattern.
      .to(
        wind,
        {
          y: screen * 1.2,
          duration: () => random(0.35, 0.6),
          ease: "none",
          stagger: { each: 0.035, from: "random" },
        },
        0.08,
      )
      .set(wind, { opacity: 0 });
  };

  return (
    <div ref={scope}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
      >
        {Array.from({ length: STREAKS }, (_, i) => (
          <span
            key={i}
            className="back-to-top-wind via-text-subtle absolute top-0 left-0 h-40 w-px bg-linear-to-b from-transparent to-transparent opacity-0"
          />
        ))}
      </div>
      <div className="lg:pl-sidebar pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center">
        <AnimatePresence>
          {atBottom && !flying && (
            <motion.button
              key="back-to-top"
              type="button"
              onClick={launch}
              aria-label="Back to top"
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="border-border-strong bg-surface/80 text-text hover:bg-raised pointer-events-auto flex size-12 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors"
            >
              <ArrowUp aria-hidden className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
