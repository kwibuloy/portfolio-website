import type { Metadata } from "next";
import { ExperienceBands } from "@/components/sections/experience/experience-bands";
import { PageShell } from "@/components/ui/page-shell";
import { navItem } from "@/content/site";

export const metadata: Metadata = {
  title: "Experience",
  description: navItem("/experience").blurb,
};

export default function ExperiencePage() {
  return (
    <PageShell href="/experience">
      <ExperienceBands />
    </PageShell>
  );
}
