"use client";

import { RotateCcw } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { TechDialog } from "@/components/three/tech-keyboard/tech-dialog";
import { technologies } from "@/content/technologies";
import { playKeyPress } from "@/lib/preferences";

// Three.js needs the browser, and it is a large library, so the scene is
// loaded only on the client and only where the keyboard is used.
const Scene = dynamic(() => import("@/components/three/tech-keyboard/scene"), {
  ssr: false,
  loading: () => (
    <div className="text-text-subtle flex size-full items-center justify-center font-mono text-sm">
      Loading keyboard…
    </div>
  ),
});

const CARD_OFFSET = 20; // px between the pointer and the hover card
const follow = { stiffness: 300, damping: 30 };

/**
 * The 3D tech keyboard. It floats: its canvas is twice the height of the
 * section and ignores the pointer, so nothing frames or clips it; the section
 * itself takes the pointer input.
 *
 * Hovering a key shows a small card beside the pointer with a summary.
 * - "summary" (home page): that is all.
 * - "details" (tech stack page): clicking a key also opens a popup with the
 *   detailed experience.
 *
 * The visually hidden buttons mirror every key, so keyboard and screen-reader
 * users can reach each technology; focusing one presses its 3D key.
 */
export function TechKeyboard({ mode }: { mode: "summary" | "details" }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Motion values move the hover card without re-rendering React on every
  // pointer move; the springs make it trail the pointer slightly.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const cardX = useSpring(pointerX, follow);
  const cardY = useSpring(pointerY, follow);

  const find = (id: string | null) =>
    technologies.find((tech) => tech.id === id) ?? null;
  const hovered = find(hoveredId);

  // One key-press sound each time the pointer (or keyboard focus) lands on a
  // different key. It is silent unless the visitor has turned sound on.
  const hover = (id: string | null) => {
    if (id && id !== hoveredId) playKeyPress();
    setHoveredId(id);
  };

  const select = (id: string) => {
    if (mode === "details") setOpenId(id);
    else setHoveredId(id); // a tap on a touch screen shows the card
  };

  // A plain scroll over the keyboard should scroll the page, not zoom. This
  // listener is added before the orbit controls add theirs, so it can stop
  // the wheel event from reaching them unless Ctrl (or Cmd) is held.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) event.stopImmediatePropagation();
    };
    element.addEventListener("wheel", onWheel, { capture: true });
    return () =>
      element.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  return (
    <div className="-mx-6 flex flex-col gap-4 lg:-mx-12">
      {/* touch-pan-y! overrides the orbit controls' inline style so one finger
          still scrolls the page on touch screens. */}
      <div
        ref={stage}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          // Flip the card to the pointer's left near the right edge.
          const x = event.clientX - box.left;
          pointerX.set(x > box.width * 0.6 ? x - 320 : x + CARD_OFFSET);
          pointerY.set(event.clientY - box.top + CARD_OFFSET);
        }}
        className={`has-focus-visible:outline-accent relative aspect-2/1 w-full touch-pan-y! has-focus-visible:outline-2 ${
          hoveredId ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 -inset-y-1/2">
          <Scene
            stage={stage}
            activeId={openId}
            hoveredId={hoveredId}
            onHover={hover}
            onSelect={select}
            reducedMotion={reducedMotion}
            resetSignal={resetSignal}
          />
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              key="card"
              aria-hidden
              style={{ x: cardX, y: cardY }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="border-border-strong bg-bg/90 pointer-events-none absolute top-0 left-0 z-10 flex w-72 flex-col gap-2 rounded-2xl border p-4 shadow-xl backdrop-blur-md"
            >
              <p className="text-text-subtle font-mono text-xs tracking-widest uppercase">
                {hovered.category}
              </p>
              <p className="text-xl font-medium">{hovered.name}</p>
              <p className="text-text-muted text-sm">{hovered.summary}</p>
              {mode === "details" && (
                <p className="text-text-subtle font-mono text-xs">
                  click for the details
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="sr-only">
          {technologies.map((tech) => (
            <li key={tech.id}>
              <button
                type="button"
                onFocus={() => {
                  pointerX.set(CARD_OFFSET);
                  pointerY.set(CARD_OFFSET);
                  hover(tech.id);
                }}
                onBlur={() => setHoveredId(null)}
                onClick={() => select(tech.id)}
              >
                {tech.name}
                {mode === "details" && ": open details"}
              </button>
            </li>
          ))}
        </ul>
        {/* The hover card's text, announced to screen readers. */}
        <p aria-live="polite" className="sr-only">
          {hovered && `${hovered.name}. ${hovered.summary}`}
        </p>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 px-6 lg:px-12">
        <p aria-hidden className="text-text-subtle font-mono text-xs">
          {mode === "summary"
            ? "hover or tap a key"
            : "hover a key · click it for the details"}{" "}
          · drag to rotate · ctrl + scroll or pinch to zoom
        </p>
        <button
          type="button"
          onClick={() => setResetSignal((value) => value + 1)}
          className="border-border-strong hover:bg-accent hover:text-on-accent flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs transition-colors"
        >
          <RotateCcw aria-hidden className="size-3" />
          Reset view
        </button>
      </div>

      {mode === "details" && (
        <TechDialog tech={find(openId)} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
