"use client";

import { ArrowLeft, ArrowRight, Award, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { certifications } from "@/content/certifications";

const controlClass =
  "border-border-strong hover:bg-accent hover:text-on-accent flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm transition-colors";
const faceClass =
  "border-border-strong from-bg to-raised absolute inset-0 isolate flex flex-col gap-4 overflow-hidden rounded-3xl border bg-linear-to-br p-8 shadow-xl backface-hidden";

const issuers = new Set(certifications.map((item) => item.issuer)).size;
const years = certifications.map((item) => item.date).sort();

/**
 * Certificates as a fanned stack of large cards beside an index. The front
 * card can be flicked sideways (or the buttons used) to move to the next one,
 * and flipped over to read the details on its back. Picking a row in the
 * index brings that certificate to the front.
 */
export function CertificateFan() {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const count = certifications.length;
  const current = certifications[active];

  const show = (index: number) => {
    setFlipped(false);
    setActive((index + count) % count);
  };

  return (
    <div className="flex flex-col gap-10">
      <dl className="border-border grid grid-cols-3 gap-4 border-y py-6">
        {[
          { label: "Certificates", value: count },
          { label: "Issuers", value: issuers },
          { label: "Latest", value: years.at(-1) },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1">
            <dt className="text-text-subtle font-mono text-xs">{stat.label}</dt>
            <dd className="text-4xl font-semibold tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-12 lg:grid-cols-5">
        <div className="flex flex-col items-center gap-8 lg:col-span-3">
          <div className="relative aspect-4/5 w-full max-w-2xl perspective-distant sm:aspect-3/2">
            {certifications.map((item, index) => {
              // 0 is the front card; higher numbers sit further back.
              const depth = (index - active + count) % count;
              const front = depth === 0;
              return (
                <motion.div
                  key={item.title}
                  aria-hidden={!front}
                  className="absolute inset-0 transform-3d"
                  style={{ zIndex: count - depth }}
                  animate={{
                    rotate: depth * 4,
                    x: depth * 32,
                    y: depth * -14,
                    scale: 1 - depth * 0.05,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  drag={front ? "x" : false}
                  dragSnapToOrigin
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 100) show(active + 1);
                  }}
                  // Only the front card flips on tap. tabIndex -1 stops
                  // Motion making the card a tab stop (it does that for any
                  // element with onTap); the Flip card button is the keyboard
                  // way to flip it.
                  onTap={
                    front ? () => setFlipped((value) => !value) : undefined
                  }
                  tabIndex={-1}
                >
                  <motion.div
                    className="relative size-full cursor-pointer transform-3d"
                    animate={{ rotateY: front && flipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  >
                    <div className={faceClass}>
                      <Award
                        aria-hidden
                        className="text-border absolute -right-4 -bottom-4 -z-10 size-24 lg:-right-8 lg:-bottom-8 lg:size-56"
                      />
                      <p className="text-text-subtle font-mono text-xs tracking-widest uppercase">
                        Certificate · {item.issuer}
                      </p>
                      <h3 className="text-gradient text-3xl font-semibold tracking-tight sm:text-5xl">
                        {item.title}
                      </h3>
                      <p className="text-text-muted max-w-md text-lg">
                        {item.summary}
                      </p>
                      <p className="text-text-subtle relative mt-auto flex items-center justify-between font-mono text-xs">
                        <span>Issued {item.date}</span>
                        <span>tap to flip</span>
                      </p>
                    </div>
                    <div
                      className={`${faceClass} rotate-y-180`}
                      aria-hidden={!(front && flipped)}
                    >
                      <p className="text-text-subtle font-mono text-xs tracking-widest uppercase">
                        {item.title}
                      </p>
                      <p className="text-xl">{item.details}</p>
                      {item.href && (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={front && flipped ? 0 : -1}
                          className="mt-auto font-mono text-sm underline underline-offset-4"
                        >
                          View credential
                        </a>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className={controlClass}
              onClick={() => show(active - 1)}
            >
              <ArrowLeft aria-hidden className="size-4" />
              Previous
            </button>
            <button
              type="button"
              className={controlClass}
              aria-pressed={flipped}
              onClick={() => setFlipped((value) => !value)}
            >
              <RotateCw aria-hidden className="size-4" />
              Flip card
            </button>
            <button
              type="button"
              className={controlClass}
              onClick={() => show(active + 1)}
            >
              Next
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
          <p aria-live="polite" className="sr-only">
            Certificate {active + 1} of {count}: {current.title},{" "}
            {flipped ? "details side" : "front side"}
          </p>
        </div>

        <ol className="flex flex-col lg:col-span-2">
          {certifications.map((item, index) => {
            const selected = index === active;
            return (
              <li key={item.title} className="border-border border-t">
                <button
                  type="button"
                  aria-current={selected}
                  onClick={() => show(index)}
                  className={`group flex w-full items-baseline gap-4 py-5 text-left transition-colors ${
                    selected ? "text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  <span className="text-text-subtle font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="text-xl font-medium">{item.title}</span>
                    <span className="text-text-subtle font-mono text-xs">
                      {item.issuer} · {item.date}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className={`size-4 self-center transition-transform motion-reduce:transition-none ${
                      selected
                        ? "translate-x-0"
                        : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
