"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { ContributionDay } from "@/lib/github";
import { gsap, useGSAP } from "@/lib/gsap-scroll";

// One shade of the accent colour per GitHub activity level, lightest first.
const LEVEL_CLASS = [
  "bg-raised",
  "bg-accent/25",
  "bg-accent/50",
  "bg-accent/75",
  "bg-accent",
];

const REACH = 70; // px: how far the cursor's swell spreads
const SWELL = 0.9; // extra scale for the square right under the cursor

// A fixed locale and time zone, so the server and the browser print the same text.
const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const utc = (date: string) => new Date(`${date}T00:00:00Z`);
const describe = (day: ContributionDay) =>
  `${day.count} contribution${day.count === 1 ? "" : "s"} on ${dayFormat.format(utc(day.date))}`;
const IDLE_LABEL = "hover a day";

type Centre = {
  cell: HTMLElement;
  x: number;
  y: number;
  /** Eases the square's scale toward a new value (gsap.quickTo). */
  scaleTo: (value: number) => void;
};

/**
 * The contribution graph: one column per week, one square per day. The
 * squares pop in as a wave the first time the graph scrolls into view, and
 * they swell around the cursor like a ripple. Hovering a square shows its
 * date and count.
 *
 * The ripple runs at most once per frame, each square has one reusable
 * quickTo tween instead of a new tween per pointer move, and the hover label
 * is written straight to the DOM, so moving across the graph re-renders
 * nothing.
 */
export function ContributionGrid({ weeks }: { weeks: ContributionDay[][] }) {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  // Square centres, measured when the pointer enters (and again if the page
  // scrolls under the pointer), and the squares that are currently swollen.
  const centres = useRef<Centre[]>([]);
  const measuredAt = useRef(0);
  const swollen = useRef(new Set<HTMLElement>());
  const pointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const days = new Map(weeks.flat().map((day) => [day.date, day]));

  const { contextSafe } = useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-day]", {
          opacity: 0,
          scale: 0.3,
          duration: 0.4,
          ease: "back.out(2)",
          stagger: { each: 0.003, from: "start" },
          scrollTrigger: { trigger: root.current, start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  // Created through contextSafe, so GSAP cleans the quickTo tweens up with
  // the component.
  const makeScaleTo = contextSafe((cell: HTMLElement) =>
    gsap.quickTo(cell, "scale", { duration: 0.3, ease: "power2.out" }),
  );

  const measure = () => {
    const previous = new Map(
      centres.current.map((centre) => [centre.cell, centre.scaleTo]),
    );
    centres.current = Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-day]") ?? [],
      (cell) => {
        const box = cell.getBoundingClientRect();
        return {
          cell,
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
          scaleTo: previous.get(cell) ?? makeScaleTo(cell),
        };
      },
    );
    measuredAt.current = window.scrollY;
  };

  const ripple = () => {
    frame.current = 0;
    // The squares moved if the page scrolled under the pointer.
    if (window.scrollY !== measuredAt.current) measure();
    const { x, y } = pointer.current;
    for (const centre of centres.current) {
      const distance = Math.hypot(centre.x - x, centre.y - y);
      if (distance < REACH) {
        swollen.current.add(centre.cell);
        centre.scaleTo(1 + SWELL * (1 - distance / REACH));
      } else if (swollen.current.delete(centre.cell)) {
        centre.scaleTo(1);
      }
    }
  };

  const showLabel = (text: string) => {
    if (label.current && label.current.textContent !== text)
      label.current.textContent = text;
  };

  const onMove = (event: React.PointerEvent) => {
    // Mouse only; touch does nothing.
    if (event.pointerType !== "mouse") return;
    const day = days.get((event.target as HTMLElement).dataset.day ?? "");
    if (day) showLabel(describe(day));
    if (reducedMotion) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    frame.current ||= requestAnimationFrame(ripple);
  };

  const settle = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    showLabel(IDLE_LABEL);
    for (const centre of centres.current)
      if (swollen.current.has(centre.cell)) centre.scaleTo(1);
    swollen.current.clear();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="py-3">
        <div
          ref={root}
          role="img"
          aria-label="Contribution graph for the last 12 months. The monthly totals follow as a list."
          className="grid grid-rows-7 gap-0.5 sm:gap-1.5"
          style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
          onPointerEnter={
            reducedMotion
              ? undefined
              : (event) => event.pointerType === "mouse" && measure()
          }
          onPointerMove={onMove}
          onPointerLeave={settle}
        >
          {weeks.map((week, weekIndex) =>
            week.map((day) => (
              <span
                key={day.date}
                data-day={day.date}
                // A partial first or last week must still sit on the right
                // weekday row, so every square is placed explicitly.
                style={{
                  gridColumn: weekIndex + 1,
                  gridRow: utc(day.date).getUTCDay() + 1,
                }}
                className={`aspect-square w-full rounded-xs sm:rounded ${LEVEL_CLASS[day.level]}`}
              />
            )),
          )}
        </div>
      </div>

      <div className="text-text-subtle flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <p ref={label} aria-hidden className="pointer-coarse:invisible">
          {IDLE_LABEL}
        </p>
        <p aria-hidden className="flex items-center gap-1.5">
          less
          {LEVEL_CLASS.map((level) => (
            <span key={level} className={`size-3 rounded ${level}`} />
          ))}
          more
        </p>
      </div>
    </div>
  );
}
