"use client";

import { useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import type { ContributionDay } from "@/lib/github";
import { gsap, useGSAP } from "@/lib/gsap";

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

/**
 * The contribution graph: one column per week, one square per day. The
 * squares pop in as a wave the first time the graph scrolls into view, and
 * they swell around the cursor like a ripple. Hovering a square shows its
 * date and count.
 */
export function ContributionGrid({ weeks }: { weeks: ContributionDay[][] }) {
  const root = useRef<HTMLDivElement>(null);
  // Square centres, measured when the pointer enters, and the squares that
  // are currently swollen.
  const centres = useRef<{ cell: HTMLElement; x: number; y: number }[]>([]);
  const swollen = useRef(new Set<HTMLElement>());
  const [hovered, setHovered] = useState<ContributionDay | null>(null);
  const reducedMotion = useReducedMotion();

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

  const measure = () => {
    centres.current = Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-day]") ?? [],
      (cell) => {
        const box = cell.getBoundingClientRect();
        return {
          cell,
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        };
      },
    );
  };

  // Tweens started from event handlers go through contextSafe, so GSAP
  // cleans them up with the component.
  const tween = contextSafe((targets: gsap.TweenTarget, vars: gsap.TweenVars) =>
    gsap.to(targets, vars),
  );

  const ripple = (x: number, y: number) => {
    for (const centre of centres.current) {
      const distance = Math.hypot(centre.x - x, centre.y - y);
      if (distance < REACH) {
        swollen.current.add(centre.cell);
        tween(centre.cell, {
          scale: 1 + SWELL * (1 - distance / REACH),
          duration: 0.2,
          overwrite: "auto",
        });
      } else if (swollen.current.delete(centre.cell)) {
        tween(centre.cell, { scale: 1, duration: 0.4, overwrite: "auto" });
      }
    }
  };

  const settle = () => {
    setHovered(null);
    tween([...swollen.current], { scale: 1, duration: 0.4 });
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
          onPointerEnter={reducedMotion ? undefined : measure}
          onPointerMove={
            reducedMotion
              ? undefined
              : (event) => ripple(event.clientX, event.clientY)
          }
          onPointerLeave={settle}
        >
          {weeks.map((week, weekIndex) =>
            week.map((day) => (
              <span
                key={day.date}
                data-day
                onPointerEnter={() => setHovered(day)}
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
        <p aria-hidden>
          {hovered
            ? `${hovered.count} contribution${hovered.count === 1 ? "" : "s"} on ${dayFormat.format(utc(hovered.date))}`
            : "hover a day"}
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
