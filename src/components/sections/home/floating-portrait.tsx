"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const PARALLAX = 28; // px a layer one full depth away shifts across the stage
const TILT = 10; // degrees the photo leans at a fast flick

type LayerProps = {
  /**
   * How near the layer is. The photo is 1; smaller is further back, larger is
   * in front. It decides how far the layer follows the photo when it is
   * dragged, and how far it shifts with the pointer.
   */
  depth: number;
  drag: { x: MotionValue<number>; y: MotionValue<number> };
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  className: string;
  children?: React.ReactNode;
};

/**
 * One floating layer, made of two nested elements so two libraries never
 * fight over the same transform:
 * - the outer one is moved by Motion, in response to the visitor;
 * - the inner one ([data-drift]) is moved by GSAP, the idle drift.
 */
function Layer({ depth, drag, pointer, className, children }: LayerProps) {
  // Follow the dragged photo by `depth` of its distance, and shift with the
  // pointer: layers behind the photo move against it, layers in front with it.
  const targetX = useTransform(
    () => drag.x.get() * depth + pointer.x.get() * PARALLAX * (depth - 1),
  );
  const targetY = useTransform(
    () => drag.y.get() * depth + pointer.y.get() * PARALLAX * (depth - 1),
  );
  // A loose spring, so each layer trails behind and overshoots a little, as
  // if tied to the photo by elastic. Nearer layers are pulled harder.
  const spring = { stiffness: 70 + 60 * depth, damping: 14 };
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className={`pointer-events-none absolute ${className}`}
    >
      <div data-drift className="size-full">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * The portrait, floating as if weightless among a few loose layers: frames
 * and a dot grid behind it, a ring and the GitHub handle in front.
 *
 * - Idle: every layer drifts slowly on its own path (GSAP).
 * - Pointer: the layers shift by depth, which makes the stack look deep.
 * - Drag or flick the photo: it leans into the throw and springs back, and
 *   the other layers are pulled along behind it (Motion).
 *
 * With reduced motion nothing moves and the photo cannot be dragged; all of
 * it is still shown. The extra layers are decoration, hidden from assistive
 * technology.
 */
export function FloatingPortrait({
  src,
  alt,
  handle,
}: {
  src: string;
  alt: string;
  handle: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Where the photo has been dragged to, and where the pointer is over the
  // stage (-0.5 to 0.5 on each axis). Motion values update the transforms
  // directly, without re-rendering React.
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const drag = { x: dragX, y: dragY };
  const pointer = { x: pointerX, y: pointerY };

  // The photo leans in the direction it is thrown: the faster it moves
  // sideways, the more it tilts.
  const lean = useTransform(
    useVelocity(dragX),
    [-1500, 0, 1500],
    [-TILT, 0, TILT],
  );
  const rotate = useSpring(lean, { stiffness: 160, damping: 16 });

  // Idle drift. x, y and rotation each get their own tween with a different
  // length, so the three never line up the same way twice in a row and the
  // path looks aimless instead of looping. "sine.inOut" slows to a stop at
  // each end, which is what makes it read as floating.
  useGSAP(
    () => {
      if (reducedMotion || !stage.current) return;
      const drift = gsap.timeline();
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((layer, i) => {
        const loop = { ease: "sine.inOut", repeat: -1, yoyo: true };
        const reach = 5 + (i % 3) * 3; // px
        drift
          .fromTo(
            layer,
            { y: -reach },
            { y: reach, duration: 4.2 + i * 0.7, ...loop },
            0,
          )
          .fromTo(
            layer,
            { x: reach * 0.6 },
            { x: -reach * 0.6, duration: 6.1 + i * 0.9, ...loop },
            0,
          )
          .fromTo(
            layer,
            { rotation: -1.5 },
            { rotation: 1.5, duration: 7.3 + i * 1.1, ...loop },
            0,
          );
      });

      // No point animating what nobody can see.
      const observer = new IntersectionObserver(([entry]) => {
        drift.paused(!entry.isIntersecting);
      });
      observer.observe(stage.current);
      return () => observer.disconnect();
    },
    { scope: stage, dependencies: [reducedMotion] },
  );

  return (
    <div
      ref={stage}
      data-tour="portrait"
      onPointerMove={(event) => {
        if (reducedMotion) return;
        const box = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - box.left) / box.width - 0.5);
        pointerY.set((event.clientY - box.top) / box.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      className="relative aspect-square w-full max-w-md"
    >
      {/* Behind the photo, furthest first. */}
      <Layer
        depth={0.3}
        drag={drag}
        pointer={pointer}
        className="-inset-3 -rotate-6"
      >
        <div className="border-border-strong size-full rounded-3xl border" />
      </Layer>
      <Layer
        depth={0.55}
        drag={drag}
        pointer={pointer}
        className="-top-2 -right-4 bottom-6 left-6 rotate-3"
      >
        <div className="bg-raised size-full rounded-3xl" />
      </Layer>
      <Layer
        depth={0.75}
        drag={drag}
        pointer={pointer}
        className="-bottom-6 -left-6 size-28"
      >
        <div className="dot-grid size-full" />
      </Layer>

      {/* The photo. The constraints pin it to where it started, and
          dragElastic lets it be pulled away from there with resistance, so
          letting go springs it back. touch-pan-y leaves vertical swipes to
          the page, so the photo never traps scrolling on a phone. */}
      <motion.div
        drag={!reducedMotion}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragElastic={0.55}
        dragTransition={{ bounceStiffness: 140, bounceDamping: 12 }}
        whileDrag={{ scale: 1.04 }}
        style={{ x: dragX, y: dragY, rotate }}
        className={`absolute inset-0 touch-pan-y ${
          reducedMotion ? "" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div
          data-drift
          className="border-border relative size-full overflow-hidden rounded-3xl border shadow-2xl"
        >
          <Image
            src={src}
            alt={alt}
            fill
            preload
            draggable={false}
            sizes="(min-width: 768px) 28rem, 100vw"
            // Monochrome in both themes: bright and soft in light, darker and
            // punchier in dark. The filter fades with the theme switch.
            className="object-cover brightness-105 contrast-105 grayscale select-none dark:brightness-75 dark:contrast-125"
          />
        </div>
      </motion.div>

      {/* In front of the photo. */}
      <Layer
        depth={1.2}
        drag={drag}
        pointer={pointer}
        className="-right-3 bottom-10"
      >
        <p className="border-border-strong bg-bg rounded-full border px-4 py-2 font-mono text-sm shadow-lg">
          @{handle}
        </p>
      </Layer>
      <Layer
        depth={1.3}
        drag={drag}
        pointer={pointer}
        className="top-10 -right-5 size-8"
      >
        <div className="border-accent size-full rounded-full border-2" />
      </Layer>
    </div>
  );
}
