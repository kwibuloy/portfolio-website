import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { services } from "@/content/services";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <PageShell href="/services">
      <ul className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.title}>
            <Reveal className="h-full">
              <Card>
                <h2 className="text-xl font-medium">{service.title}</h2>
                <p className="text-text-muted">{service.summary}</p>
                <ul className="text-text-muted flex list-disc flex-col gap-2 pl-5 text-sm">
                  {service.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
