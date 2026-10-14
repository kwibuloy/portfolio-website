"use client";

import { Compass, Mail, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AskPanel } from "@/components/sections/sidebar/ask-panel";
import { ContactPanel } from "@/components/sections/sidebar/contact-panel";
import { SidePanel } from "@/components/sections/sidebar/side-panel";
import { startTour } from "@/lib/tour";

const actionClass =
  "group text-text-muted hover:bg-raised hover:text-text flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors";
const iconClass =
  "size-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 motion-reduce:transition-none";

// The sidebar is rendered twice (desktop and mobile drawer). One shared
// request means the visit is recorded once per page load.
let visitors: Promise<number | null> | undefined;
const loadVisitors = () =>
  (visitors ??= fetch("/api/visitors", { method: "POST" })
    .then((response) => (response.ok ? response.json() : { count: null }))
    .then((body: { count: number | null }) => body.count)
    .catch(() => null));

/**
 * The lower block of the sidebar: the chatbot, the unique visitor count, the
 * contact form, and a button that replays the guided tour. The chatbot and
 * contact buttons open panels beside the sidebar.
 */
export function SidebarActions() {
  const [panel, setPanel] = useState<"ask" | "contact" | null>(null);
  // undefined while loading, null when no count is available.
  const [count, setCount] = useState<number | null>();

  useEffect(() => {
    let active = true;
    loadVisitors().then((value) => {
      if (active) setCount(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="border-border mt-auto flex flex-col gap-1 border-t pt-6">
      <button
        type="button"
        data-tour="ask"
        className={actionClass}
        onClick={() => setPanel("ask")}
      >
        <MessageSquare aria-hidden className={iconClass} />
        Ask anything
      </button>

      <p className="text-text-muted flex items-center gap-3 px-3 py-3 text-sm">
        <Users aria-hidden className="size-4" />
        Visitors
        <span className="text-text ml-auto font-mono" aria-live="polite">
          {count === undefined ? "…" : (count?.toLocaleString("en-US") ?? "—")}
        </span>
      </p>

      <button
        type="button"
        className={actionClass}
        onClick={() => setPanel("contact")}
      >
        <Mail aria-hidden className={iconClass} />
        Contact Me
      </button>

      <button type="button" className={actionClass} onClick={startTour}>
        <Compass aria-hidden className={iconClass} />
        Take the tour
      </button>

      <SidePanel
        open={panel === "ask"}
        onClose={() => setPanel(null)}
        title="Ask anything"
      >
        <AskPanel />
      </SidePanel>
      <SidePanel
        open={panel === "contact"}
        onClose={() => setPanel(null)}
        title="Contact Me"
      >
        <ContactPanel />
      </SidePanel>
    </div>
  );
}
