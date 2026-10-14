import { Award } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { CountUp } from "@/components/ui/count-up";
import { AwardPhotos } from "@/components/sections/education/award-photos";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { education } from "@/content/education";

export const metadata: Metadata = { title: "Education" };

const labelClass =
  "text-text-subtle font-mono text-xs tracking-widest uppercase";

/**
 * How far through the degree today is, from 0 to 1. Reading the clock makes
 * the result change over time, so it is cached and recomputed about once a
 * day; the page itself stays static.
 */
async function degreeProgress(start: string, end: string) {
  "use cache";
  cacheLife("days");
  const from = new Date(`${start}-01T00:00:00Z`).getTime();
  const to = new Date(`${end}-01T00:00:00Z`).getTime();
  return Math.min(1, Math.max(0, (Date.now() - from) / (to - from)));
}

export default async function EducationPage() {
  // The page is designed around a single degree.
  const degree = education[0];
  const progress = await degreeProgress(
    degree.start,
    degree.expectedGraduation,
  );
  const percent = Math.round(progress * 100);
  const startYear = degree.start.slice(0, 4);
  const endYear = degree.expectedGraduation.slice(0, 4);

  return (
    <PageShell href="/education">
      {/* Top band: the school, the GPA, the awards, and the progress bar. */}
      <section
        aria-labelledby="degree-heading"
        className="border-border flex flex-col gap-10 border-t pt-12"
      >
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
          <Reveal className="flex flex-col gap-4 lg:col-span-2">
            <p className={labelClass}>
              {degree.degree} · {degree.period}
            </p>
            <h2
              id="degree-heading"
              className="text-gradient text-5xl font-semibold tracking-tight xl:text-7xl"
            >
              {degree.school}
            </h2>
          </Reveal>

          <Reveal delay={0.15} className="flex flex-col gap-2 lg:items-end">
            <p className="text-8xl font-semibold tracking-tighter xl:text-9xl">
              <CountUp value={degree.gpa.value} decimals={2} />
            </p>
            <p className={labelClass}>
              GPA out of {degree.gpa.outOf.toFixed(2)}
            </p>
          </Reveal>
        </div>

        {/* The badges and progress bar on the left, the award photos pinned
            on the right. */}
        <div className="grid items-center gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="flex flex-col gap-10 lg:col-span-2">
            <ul className="flex flex-wrap gap-3">
              {degree.awards.map((award, index) => (
                <li key={award}>
                  <Reveal delay={0.3 + index * 0.15}>
                    <span className="border-border-strong bg-surface/70 inline-flex items-center gap-3 rounded-full border px-5 py-3 backdrop-blur-sm">
                      <Award aria-hidden className="size-5" />
                      {award}
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <p className={labelClass}>Degree progress</p>
                <p className="font-mono text-sm">{percent}%</p>
              </div>
              <div
                role="progressbar"
                aria-label={`Degree progress from ${startYear} to expected graduation in ${endYear}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="bg-raised h-3 overflow-hidden rounded-full"
              >
                {/* scaleX fills the bar with a transform, not a width change. */}
                <div
                  className="bg-accent size-full origin-left rounded-full"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
              <div className="text-text-subtle flex justify-between font-mono text-xs">
                <span>{startYear}</span>
                <span>Expected graduation {endYear}</span>
              </div>
            </Reveal>
          </div>
          <AwardPhotos photos={degree.photos} />
        </div>
      </section>

      {/* Middle band: coursework tiles. */}
      <section
        aria-labelledby="coursework-heading"
        className="flex flex-col gap-6"
      >
        <Reveal>
          <h2
            id="coursework-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Coursework
          </h2>
        </Reveal>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {degree.coursework.map((course, index) => (
            <li key={course}>
              <Reveal delay={index * 0.05} className="h-full">
                <div className="group border-border bg-surface/70 hover:border-accent hover:bg-accent hover:text-on-accent flex h-full min-h-32 flex-col justify-between gap-6 rounded-2xl border p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="font-mono text-xs opacity-60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-medium">{course}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Bottom band: student organizations. */}
      <section
        aria-labelledby="organizations-heading"
        className="flex flex-col gap-6"
      >
        <Reveal>
          <h2
            id="organizations-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Organizations
          </h2>
        </Reveal>
        <ul className="grid gap-4 lg:grid-cols-2">
          {degree.organizations.map((organization, index) => (
            <li key={organization.name}>
              <Reveal delay={index * 0.1} className="h-full">
                <div className="border-border bg-surface/70 flex h-full flex-col gap-4 rounded-2xl border p-8 backdrop-blur-sm">
                  <p className={labelClass}>{organization.period}</p>
                  <h3 className="text-2xl font-medium">{organization.name}</h3>
                  <p className="text-text-muted mt-auto">{organization.role}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
