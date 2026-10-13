"use client";

import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Education } from "@/content/education";

// How each print hangs: its tilt, and how it overlaps the one before it.
const hang = [
  { rotate: -6, className: "" },
  { rotate: 5, className: "-ml-8 mt-12" },
];

/**
 * The award photos as two prints pinned to the page, tilted and overlapping.
 * They drop in one after the other; hovering one straightens and lifts it,
 * and clicking opens it large in a native <dialog>.
 */
export function AwardPhotos({ photos }: { photos: Education["photos"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const open = openIndex === null ? null : photos[openIndex];

  useEffect(() => {
    if (openIndex !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [openIndex]);

  return (
    <>
      <ul className="flex items-start justify-center px-4 pb-4">
        {photos.map((photo, index) => {
          const { rotate, className } = hang[index % hang.length];
          return (
            // The item drops in; the button inside it tilts and reacts to
            // hover. Two elements, so the entrance delay never slows the hover.
            <motion.li
              key={photo.src}
              initial={reducedMotion ? false : { opacity: 0, y: -60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 16,
                delay: 0.3 + index * 0.2,
              }}
              className={`relative focus-within:z-10 hover:z-10 ${className}`}
            >
              <motion.button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`${photo.caption}: view larger`}
                initial={false}
                animate={{ rotate }}
                whileHover={{ rotate: 0, scale: 1.08 }}
                whileFocus={{ rotate: 0, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="border-border-strong bg-surface relative flex w-36 cursor-zoom-in flex-col gap-2 rounded-sm border p-2 shadow-xl sm:w-44"
              >
                {/* The pin. */}
                <span
                  aria-hidden
                  className="bg-accent absolute -top-2 left-1/2 size-3 -translate-x-1/2 rounded-full shadow-md"
                />
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="11rem"
                  className="aspect-4/5 w-full object-cover"
                />
                <span className="text-text-muted pb-1 text-center font-mono text-xs">
                  {photo.caption}
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      <dialog
        ref={dialog}
        aria-label={open?.caption}
        onClose={() => setOpenIndex(null)}
        // A click on the dialog element itself is a click on the backdrop.
        onClick={(event) => {
          if (event.target === dialog.current) setOpenIndex(null);
        }}
        className="text-text m-auto w-full max-w-md bg-transparent p-4 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <motion.figure
            key={open.src}
            initial={
              reducedMotion ? false : { opacity: 0, scale: 0.7, rotate: -8 }
            }
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="border-border-strong bg-surface relative flex flex-col gap-3 rounded-sm border p-3 shadow-xl"
          >
            <Image
              src={open.src}
              alt={open.alt}
              width={open.width}
              height={open.height}
              sizes="(min-width: 28rem) 26rem, 100vw"
              className="w-full"
            />
            <figcaption className="text-text-muted pb-2 text-center font-mono text-sm">
              {open.caption}
            </figcaption>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenIndex(null)}
              className="bg-bg border-border-strong absolute -top-3 -right-3 flex size-9 items-center justify-center rounded-full border transition-transform hover:scale-110 hover:rotate-90 motion-reduce:transition-none"
            >
              <X aria-hidden className="size-5" />
            </button>
          </motion.figure>
        )}
      </dialog>
    </>
  );
}
