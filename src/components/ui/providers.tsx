"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useLayoutEffect } from "react";
import { applyStoredPreferences, playTick } from "@/lib/preferences";

export function Providers({ children }: { children: React.ReactNode }) {
  // In development, Strict Mode's remount resets <html> to its JSX attributes
  // and drops what the inline script set. Re-apply before paint.
  useLayoutEffect(applyStoredPreferences, []);

  // One listener gives every link and button a click sound.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a, button"))
        playTick();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // reducedMotion="user" makes every Motion component skip transform
  // animations (opacity still fades) when the visitor asks for reduced motion.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
