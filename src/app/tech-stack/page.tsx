import type { Metadata } from "next";
import { TechKeyboard } from "@/components/three/tech-keyboard/tech-keyboard";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = { title: "Tech Stack" };

// Only the keyboard: clicking a key opens a popup with the experience.
export default function TechStackPage() {
  return (
    <PageShell href="/tech-stack">
      <TechKeyboard mode="details" />
    </PageShell>
  );
}
