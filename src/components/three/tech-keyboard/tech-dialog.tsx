"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  fallbackKeyStyle,
  inkFor,
  keyStyles,
} from "@/components/three/tech-keyboard/key-styles";
import type { Technology } from "@/content/technologies";

const list = {
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};
const line = {
  hidden: { opacity: 0, x: -24 },
  shown: { opacity: 1, x: 0 },
};

/**
 * The popup that opens when a key is clicked on the tech stack page. It is a
 * native <dialog>, which gives focus trapping, Escape to close, and an inert
 * page behind it. Inside, the card springs up and tips forward like a keycap
 * popping out of the board, the logo spins in, and the lines follow one by one.
 */
export function TechDialog({
  tech,
  onClose,
}: {
  tech: Technology | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (tech) dialog.current?.showModal();
    else dialog.current?.close();
  }, [tech]);

  const style = (tech && keyStyles[tech.id]) || fallbackKeyStyle;
  const ink = inkFor(style.color);
  const grid = style.viewBox ?? 24;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="tech-dialog-title"
      onClose={onClose}
      // A click on the dialog element itself is a click on the backdrop.
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      className="text-text m-auto w-full max-w-2xl bg-transparent p-4 perspective-distant backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {tech && (
        <motion.div
          // The key makes the animation replay for each technology.
          key={tech.id}
          initial={{ opacity: 0, scale: 0.5, rotateX: -50, y: 120 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="border-border-strong bg-bg overflow-hidden rounded-3xl border shadow-xl"
        >
          <header
            className="relative flex items-end justify-between gap-6 overflow-hidden p-8 pr-16"
            // The brand colour and the text colour that reads on it.
            style={{ backgroundColor: style.color, color: ink }}
          >
            <div className="flex flex-col gap-2">
              <p className="font-mono text-xs tracking-widest uppercase">
                {tech.category}
              </p>
              <h2
                id="tech-dialog-title"
                className="text-4xl font-semibold tracking-tight sm:text-6xl"
              >
                {tech.name}
              </h2>
            </div>
            {style.path && (
              <motion.svg
                aria-hidden
                viewBox={`0 0 ${grid} ${grid}`}
                fill="currentColor"
                className="size-20 shrink-0 sm:size-28"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 14,
                  delay: 0.15,
                }}
              >
                <path
                  d={style.path}
                  fillRule={style.evenOdd ? "evenodd" : "nonzero"}
                />
              </motion.svg>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110 hover:rotate-90 focus-visible:outline-current motion-reduce:transition-none"
            >
              <X aria-hidden className="size-5" />
            </button>
          </header>

          <motion.div
            variants={list}
            initial="hidden"
            animate="shown"
            className="flex flex-col gap-6 p-8"
          >
            <motion.p variants={line} className="text-lg">
              {tech.summary}
            </motion.p>
            <ul className="text-text-muted flex flex-col gap-3">
              {tech.details.map((detail) => (
                <motion.li
                  key={detail}
                  variants={line}
                  className="border-border flex gap-4 border-t pt-3"
                >
                  <span aria-hidden className="text-text-subtle font-mono">
                    +
                  </span>
                  {detail}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </dialog>
  );
}
