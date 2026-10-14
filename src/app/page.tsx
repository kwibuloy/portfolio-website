import { Contributions } from "@/components/sections/home/contributions";
import { Hero } from "@/components/sections/home/hero";
import { SummarySection } from "@/components/sections/home/summary-section";
import { CertificateFan } from "@/components/sections/certifications/certificate-fan";
import { ProjectDesktop } from "@/components/sections/projects/project-desktop";
import { ServiceTicket } from "@/components/sections/services/service-ticket";
import { TechKeyboard } from "@/components/three/tech-keyboard/tech-keyboard";
import { GitTimeline } from "@/components/ui/git-timeline";
import { education } from "@/content/education";
import { experience } from "@/content/experience";

export default function Home() {
  return (
    <main className="max-w-content mx-auto flex w-full flex-col gap-32 px-6 py-12 lg:px-12 lg:py-20">
      <Hero />

      <SummarySection href="/education">
        <GitTimeline
          branch="education"
          commits={education.map((item) => ({
            id: item.school,
            period: item.period,
            title: item.degree,
            subtitle: item.school,
            summary: item.summary,
          }))}
        />
      </SummarySection>

      <SummarySection href="/experience">
        <GitTimeline
          branch="experience"
          commits={experience.map((item) => ({
            id: `${item.company}-${item.role}`,
            period: item.period,
            title: item.role,
            subtitle: `${item.company} · ${item.type}`,
            summary: item.summary,
          }))}
        />
      </SummarySection>

      <SummarySection href="/tech-stack">
        <TechKeyboard mode="summary" />
      </SummarySection>

      <SummarySection href="/projects">
        <ProjectDesktop />
      </SummarySection>

      <SummarySection href="/certifications">
        <CertificateFan />
      </SummarySection>

      <SummarySection href="/services">
        <ServiceTicket />
      </SummarySection>

      <Contributions />
    </main>
  );
}
