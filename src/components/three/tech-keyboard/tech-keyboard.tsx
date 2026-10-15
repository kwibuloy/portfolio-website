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
import { SceneBoundary } from "@/components/three/scene-boundary";
import { TechDialog } from "@/components/three/tech-keyboard/tech-dialog";
import { technologies } from "@/content/technologies";
import { loadKeyPress, playKeyPress } from "@/lib/preferences";

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
const PRESS_TRAVEL = 0.07; // seconds for a key to reach the bottom of its press
// Start downloading three.js this far before the keyboard scrolls into view,
// so it is usually ready by the time it arrives.
const PRELOAD_MARGIN = "400px";
const follow = { stiffness: 300, damping: 30 };

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    // Hand the test context back: browsers allow only a few at once.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

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
 *
 * The scene (and three.js with it) loads only once the keyboard is near the
 * viewport. Without WebGL, or if the scene fails, those buttons are shown as
 * a plain list instead.
 */
export function TechKeyboard({ mode }: { mode: "summary" | "details" }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  // Only what keyboard focus lands on is announced; a mouse hover is not.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [scene, setScene] = useState<"waiting" | "shown" | "failed">("waiting");
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
  const focused = find(focusedId);
  const failed = scene === "failed";

  // One key-press sound each time the pointer (or keyboard focus) lands on a
  // different key, timed to click as the 3D key reaches the bottom of its
  // press. It is silent unless the visitor has turned sound on.
  const pressTravel = reducedMotion ? 0 : PRESS_TRAVEL;
  const hover = (id: string | null) => {
    if (id && id !== hoveredId) playKeyPress(pressTravel);
    setHoveredId(id);
  };

  // Fetch the recording ahead of the first key press (only if sound is on).
  useEffect(loadKeyPress, []);

  const select = (id: string) => {
    if (mode === "details") setOpenId(id);
    else setHoveredId(id); // a tap on a touch screen shows the card
  };

  // Mount the scene once the keyboard is near the viewport, or give up on it
  // straight away when the browser has no WebGL.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    if (!supportsWebGL()) {
      // Runs once after mount, so it cannot loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScene("failed");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setScene((value) => (value === "waiting" ? "shown" : value));
        observer.disconnect();
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
        onPointerEnter={failed ? undefined : loadKeyPress}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          // Flip the card to the pointer's left near the right edge.
          const x = event.clientX - box.left;
          pointerX.set(x > box.width * 0.6 ? x - 320 : x + CARD_OFFSET);
          pointerY.set(event.clientY - box.top + CARD_OFFSET);
        }}
        className={
          failed
            ? "relative flex flex-col gap-4 px-6 lg:px-12"
            : `has-focus-visible:outline-accent relative aspect-2/1 w-full touch-pan-y! has-focus-visible:outline-2 ${
                hoveredId
                  ? "cursor-pointer"
                  : "cursor-grab active:cursor-grabbing"
              }`
        }
      >
        {failed ? (
          <p className="text-text-subtle font-mono text-xs">
            The 3D keyboard can&apos;t run in this browser, so here are its keys
            as a list.
          </p>
        ) : (
          // The canvas is decoration; the buttons below are its text version.
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -inset-y-1/2"
          >
            {scene === "shown" && (
              <SceneBoundary onError={() => setScene("failed")}>
                <Scene
                  stage={stage}
                  activeId={openId}
                  hoveredId={hoveredId}
                  onHover={hover}
                  onSelect={select}
                  pressTravel={pressTravel}
                  reducedMotion={reducedMotion}
                  resetSignal={resetSignal}
                />
              </SceneBoundary>
            )}
          </div>
        )}

        {/* Without the 3D keyboard the card would float over the list, so
            the summary is shown as a line under it instead (failed mode). */}
        <AnimatePresence>
          {hovered && !failed && (
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

        <ul className={failed ? "flex flex-wrap gap-2" : "sr-only"}>
          {technologies.map((tech) => (
            <li key={tech.id}>
              <button
                type="button"
                onFocus={() => {
                  pointerX.set(CARD_OFFSET);
                  pointerY.set(CARD_OFFSET);
                  hover(tech.id);
                  setFocusedId(tech.id);
                }}
                onBlur={() => {
                  setHoveredId(null);
                  setFocusedId(null);
                }}
                onClick={() => select(tech.id)}
                className={
                  failed
                    ? "border-border-strong hover:bg-accent hover:text-on-accent rounded-full border px-3 py-1 font-mono text-sm transition-colors"
                    : undefined
                }
              >
                {tech.name}
                {mode === "details" && (
                  <span className="sr-only">: open details</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        {failed && (
          <p aria-hidden className="text-text-muted min-h-6 text-sm">
            {hovered
              ? `${hovered.name}: ${hovered.summary}`
              : "Pick a key to read about it."}
          </p>
        )}
        {/* The hover card's text, announced to screen readers when keyboard
            focus lands on a key. */}
        <p aria-live="polite" className="sr-only">
          {focused && `${focused.name}. ${focused.summary}`}
        </p>
      </div>

      {!failed && (
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
      )}

      {mode === "details" && (
        <TechDialog tech={find(openId)} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
