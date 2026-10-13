"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Text that starts as random letters and resolves left to right. The server
 * renders the real text, and screen readers always get the real text.
 *
 * By default it plays once when it appears. With `onHover` it stays still
 * until the pointer moves over it, and replays on every hover.
 */
export function ScrambleText({
  text,
  onHover = false,
  duration = 1200,
}: {
  text: string;
  onHover?: boolean;
  /** Milliseconds. */
  duration?: number;
}) {
  const visible = useRef<HTMLSpanElement>(null);
  const [plays, setPlays] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = visible.current;
    if (reducedMotion || !element || (onHover && plays === 0)) return;

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const settled = Math.floor(progress * text.length);
      let output = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        output +=
          text[i] === " "
            ? " "
            : LETTERS[Math.floor(Math.random() * LETTERS.length)];
      }
      element.textContent = output;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      element.textContent = text;
    };
  }, [text, reducedMotion, onHover, plays, duration]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        ref={visible}
        aria-hidden
        onPointerEnter={onHover ? () => setPlays((n) => n + 1) : undefined}
      >
        {text}
      </span>
    </>
  );
}
