"use client";

import { motion } from "motion/react";

/**
 * Fades and lifts its children into place the first time they scroll into
 * view.
 *
 * `immediate` is for content on screen when the page opens (the hero, a page's
 * heading): it plays a CSS animation from the first paint instead. A Motion
 * reveal is rendered hidden until React hydrates, which would delay the
 * largest paint and leave the top of the page blank if JavaScript failed.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  if (immediate) {
    return (
      <div
        className={`animate-reveal motion-reduce:animate-none ${className ?? ""}`}
        style={{ animationDelay: `${delay}s` }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
