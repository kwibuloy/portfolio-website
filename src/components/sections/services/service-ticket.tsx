"use client";

import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ContactPanel } from "@/components/sections/sidebar/contact-panel";
import { SidePanel } from "@/components/sections/sidebar/side-panel";
import { replyTime, services } from "@/content/services";
import { site } from "@/content/site";
import { playTick } from "@/lib/preferences";

const rowClass = "flex items-baseline justify-between gap-4";

/**
 * The order ticket: visitors tick the services they need, each one prints
 * onto a receipt, and "Send this to Derick" opens the contact form with the
 * picked services already written into the message.
 *
 * The receipt and its lines use Motion's `layout`, so when a line is added or
 * removed the paper grows or shrinks smoothly instead of jumping. With
 * reduced motion, Motion skips the movement (set in ui/providers.tsx) and the
 * lines only fade.
 */
export function ServiceTicket() {
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Keep the receipt in the same order as the list, not the click order.
  const lines = services.filter((service) => picked.includes(service.id));
  // A stable number for each combination, so the ticket looks issued but the
  // server and browser always render the same thing.
  const orderNumber = services
    .reduce(
      (sum, service, i) => (picked.includes(service.id) ? sum + 2 ** i : sum),
      0,
    )
    .toString()
    .padStart(4, "0");

  const toggle = (id: string) => {
    playTick();
    setPicked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const message = `Hi Derick, I'm interested in: ${lines
    .map((service) => service.title)
    .join(", ")}.\n\nHere's what I have in mind: `;

  return (
    <div className="grid items-start gap-6 md:grid-cols-2 md:gap-10">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-text-subtle mb-3 font-mono text-xs tracking-widest uppercase">
          What do you need?
        </legend>
        {services.map((service) => (
          <label
            key={service.id}
            className="group border-border hover:border-border-strong has-[:checked]:border-text has-[:checked]:bg-surface/70 has-[:focus-visible]:outline-text flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={picked.includes(service.id)}
              onChange={() => toggle(service.id)}
            />
            <span
              aria-hidden
              className="border-border-strong group-has-[:checked]:bg-accent group-has-[:checked]:text-on-accent group-has-[:checked]:border-accent mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors"
            >
              <Check className="size-3.5 opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-medium">{service.title}</span>
              <span className="text-text-muted text-sm">{service.summary}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-4">
        <motion.div
          layout
          className="receipt-edge bg-bg border-border-strong flex flex-col gap-4 rounded-t-2xl border border-b-0 p-6 pb-10 font-mono text-sm"
        >
          <motion.p
            layout="position"
            className={`${rowClass} text-text-subtle text-xs`}
          >
            <span>ORDER #{orderNumber}</span>
            <span>{site.name}</span>
          </motion.p>
          <motion.hr
            layout="position"
            className="border-border-strong border-dashed"
          />

          {/* Announces each change to screen readers, since the visual
              "printing" is not something they can see. */}
          <ul aria-live="polite" className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {lines.length === 0 ? (
                <motion.li
                  key="empty"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-text-subtle"
                >
                  Nothing yet. Tick a service.
                </motion.li>
              ) : (
                lines.map((service) => (
                  <motion.li
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={rowClass}
                  >
                    <span>{service.title}</span>
                    <Check aria-hidden className="size-4 shrink-0" />
                  </motion.li>
                ))
              )}
            </AnimatePresence>
          </ul>

          <motion.hr
            layout="position"
            className="border-border-strong border-dashed"
          />
          <motion.dl
            layout="position"
            className="text-text-muted flex flex-col gap-1 text-xs"
          >
            <div className={rowClass}>
              <dt>Est. reply</dt>
              <dd>{replyTime}</dd>
            </div>
            <div className={rowClass}>
              <dt>Price</dt>
              <dd>Let&apos;s talk</dd>
            </div>
          </motion.dl>
        </motion.div>

        <motion.button
          layout="position"
          type="button"
          disabled={lines.length === 0}
          onClick={() => setOpen(true)}
          className="group bg-accent text-on-accent inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-mono text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send this to Derick
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-1 group-disabled:translate-x-0 motion-reduce:transition-none"
          />
        </motion.button>
      </div>

      {/* Its own copy of the contact panel: the sidebar's copy sits inside
          the closed mobile drawer on small screens, where it cannot open. */}
      <SidePanel open={open} onClose={() => setOpen(false)} title="Contact Me">
        <ContactPanel initialMessage={message} />
      </SidePanel>
    </div>
  );
}
