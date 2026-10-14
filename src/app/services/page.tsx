import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ServiceTicket } from "@/components/sections/services/service-ticket";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { faq, services, workSteps } from "@/content/services";

export const metadata: Metadata = { title: "Services" };

const labelClass =
  "text-text-subtle font-mono text-xs tracking-widest uppercase";
const headingClass = "text-3xl font-semibold tracking-tight sm:text-4xl";

export default function ServicesPage() {
  return (
    <PageShell href="/services">
      {/* One row per service: what it is on the left, what you get and the
          proof on the right. */}
      <ol className="border-border border-b">
        {services.map((service, index) => (
          <li
            key={service.id}
            id={service.id}
            className="border-border border-t"
          >
            <Reveal className="grid gap-6 py-10 md:grid-cols-5 md:gap-10">
              <div className="flex flex-col gap-3 md:col-span-2">
                <p className={labelClass}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="text-2xl font-medium sm:text-3xl">
                  {service.title}
                </h2>
                <p className="text-text-muted">{service.description}</p>
              </div>

              <div className="flex flex-col gap-6 md:col-span-3">
                <div className="flex flex-col gap-3">
                  <h3 className={labelClass}>What you get</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {service.deliverables.map((item) => (
                      <li
                        key={item}
                        className="text-text-muted flex gap-2 text-sm"
                      >
                        <Check
                          aria-hidden
                          className="text-text mt-0.5 size-4 shrink-0"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {service.proof.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className={labelClass}>Proof</h3>
                    <ul className="flex flex-wrap gap-2">
                      {service.proof.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="group border-border-strong hover:bg-accent hover:text-on-accent inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs transition-colors"
                          >
                            {item.label}
                            <ArrowUpRight
                              aria-hidden
                              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="process-heading"
        className="flex flex-col gap-8"
      >
        <Reveal>
          <h2 id="process-heading" className={headingClass}>
            How I work
          </h2>
        </Reveal>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {workSteps.map((step, index) => (
            <li key={step.title}>
              <Reveal
                delay={index * 0.08}
                className="border-text flex h-full flex-col gap-2 border-t-2 pt-4"
              >
                <p className={labelClass}>Step {index + 1}</p>
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="text-text-muted text-sm">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-8">
        <Reveal>
          <h2 id="faq-heading" className={headingClass}>
            FAQ
          </h2>
        </Reveal>
        {/* Native <details>: opens and closes with the keyboard and screen
            readers, with no JavaScript. */}
        <Reveal className="border-border border-b">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group border-border border-t"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  aria-hidden
                  className="size-5 shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                />
              </summary>
              <p className="text-text-muted pb-5">{item.answer}</p>
            </details>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="start-heading" className="flex flex-col gap-8">
        <Reveal className="flex flex-col gap-2">
          <h2 id="start-heading" className={headingClass}>
            Start a project
          </h2>
          <p className="text-text-muted">
            Tick what you need and send it over. I&apos;ll reply within a day.
          </p>
        </Reveal>
        <Reveal>
          <ServiceTicket />
        </Reveal>
      </section>
    </PageShell>
  );
}
