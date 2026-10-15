import type { Metadata } from "next";
import { TechKeyboard } from "@/components/three/tech-keyboard/tech-keyboard";
import { PageShell } from "@/components/ui/page-shell";
import { navItem } from "@/content/site";

export const metadata: Metadata = {
  title: "Tech Stack",
  description: navItem("/tech-stack").blurb,
};

// Only the keyboard: clicking a key opens a popup with the experience.
export default function TechStackPage() {
  return (
    <PageShell href="/tech-stack">
      <TechKeyboard mode="details" />
    </PageShell>
  );
}
