"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A number that counts up from zero the first time it scrolls into view. The
 * server renders the final value, so it is correct without JavaScript and for
 * visitors who ask for reduced motion.
 */
export function CountUp({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const element = useRef<HTMLSpanElement>(null);
  const inView = useInView(element, { once: true });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = element.current;
    if (!node || !inView || reducedMotion) return;
    // animate() tweens a plain number and calls onUpdate each frame; writing
    // the text directly avoids re-rendering React sixty times a second.
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = latest.toFixed(decimals);
      },
    });
    return () => controls.stop();
  }, [inView, reducedMotion, value, decimals]);

  return <span ref={element}>{value.toFixed(decimals)}</span>;
}
