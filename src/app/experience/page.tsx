import type { Metadata } from "next";
import { ExperienceBands } from "@/components/sections/experience/experience-bands";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = { title: "Experience" };

export default function ExperiencePage() {
  return (
    <PageShell href="/experience">
      <ExperienceBands />
    </PageShell>
  );
}
