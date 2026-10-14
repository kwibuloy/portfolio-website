"use client";

import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { PulseDot } from "@/components/ui/pulse-dot";
import { experience } from "@/content/experience";

const list = { shown: { transition: { staggerChildren: 0.07 } } };
const line = {
  hidden: { opacity: 0, x: -24 },
  shown: { opacity: 1, x: 0 },
};

const bandClass =
  "group flex w-full flex-wrap items-center gap-x-8 gap-y-3 px-4 py-8 text-left transition-colors duration-300 sm:px-8";

function Now() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      <PulseDot />
      now
    </span>
  );
}

/**
 * Each role is a full-width band. Hovering inverts it; clicking opens it and
 * the details slide in one by one. A role with no details yet is shown as a
 * plain band that does not open.
 */
export function ExperienceBands() {
  const first = experience.find((item) => item.highlights.length > 0);
  const [openId, setOpenId] = useState<string | null>(first?.company ?? null);

  return (
    <ol className="border-border border-b">
      {experience.map((item) => {
        const open = openId === item.company;
        const current = item.period.includes("Present");
        const expandable = item.highlights.length > 0;
        const detailsId = `${item.company.replace(/\W+/g, "-")}-details`;

        const heading = (
          <>
            <span className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
              <span className="text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
                {item.role}
              </span>
              <span className="opacity-70">
                {item.company} · {item.type}
              </span>
            </span>
            <span className="flex items-center gap-6">
              {current && <Now />}
              <span className="font-mono text-sm">{item.period}</span>
            </span>
          </>
        );

        return (
          <li key={item.company} className="border-border border-t">
            {expandable ? (
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={detailsId}
                  onClick={() => setOpenId(open ? null : item.company)}
                  className={`${bandClass} hover:bg-accent hover:text-on-accent`}
                >
                  {heading}
                  <Plus
                    aria-hidden
                    className={`size-6 shrink-0 transition-transform duration-300 motion-reduce:transition-none ${
                      open ? "rotate-45" : ""
                    }`}
                  />
                </button>
              </h2>
            ) : (
              <h2 className={`${bandClass} text-text-muted`}>
                {heading}
                <span className="border-border rounded-full border px-3 py-1 font-mono text-xs">
                  details to follow
                </span>
              </h2>
            )}

            {expandable && (
              <div id={detailsId} hidden={!open} className="px-4 pb-10 sm:px-8">
                <p className="text-text-muted max-w-3xl text-lg">
                  {item.summary}
                </p>
                {open && (
                  <motion.ul
                    variants={list}
                    initial="hidden"
                    animate="shown"
                    className="mt-6 flex max-w-4xl flex-col"
                  >
                    {item.highlights.map((highlight) => (
                      <motion.li
                        key={highlight}
                        variants={line}
                        className="border-border text-text-muted flex gap-4 border-t py-4"
                      >
                        <span
                          aria-hidden
                          className="text-text-subtle font-mono"
                        >
                          +
                        </span>
                        {highlight}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
