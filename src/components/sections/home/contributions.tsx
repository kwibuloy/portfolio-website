import { ArrowUpRight } from "lucide-react";
import { ContributionGrid } from "@/components/sections/home/contribution-grid";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/content/site";
import { type ContributionDay, getContributions } from "@/lib/github";

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function summarise(days: ContributionDay[]) {
  let longest = 0;
  let run = 0;
  let best = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    best = Math.max(best, day.count);
  }

  // Totals per calendar month, oldest first.
  const months = new Map<string, number>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    months.set(key, (months.get(key) ?? 0) + day.count);
  }

  return {
    activeDays: days.filter((day) => day.count > 0).length,
    longest,
    best,
    months: [...months].map(([key, count]) => ({
      key,
      label: monthFormat.format(new Date(`${key}-01T00:00:00Z`)),
      count,
    })),
  };
}

/**
 * The GitHub contribution graph for the last 12 months, fetched on the server
 * (see src/lib/github.ts). An async server component: the page waits for the
 * cached data, and no token or request reaches the browser.
 */
export async function Contributions() {
  const data = await getContributions(site.github);
  const summary = data && summarise(data.weeks.flat());

  return (
    <section aria-labelledby="contributions-heading">
      <Reveal className="flex flex-col gap-4">
        <div className="border-border flex flex-wrap items-baseline justify-between gap-4 border-b pb-4">
          <h2
            id="contributions-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            GitHub
          </h2>
          <a
            href={`https://github.com/${site.github}`}
            target="_blank"
            rel="noreferrer"
            className="group text-text-muted hover:text-text inline-flex items-center gap-2 text-lg transition-colors"
          >
            {data
              ? `${data.total.toLocaleString("en-US")} contributions in the last year`
              : `@${site.github}`}
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
          </a>
        </div>

        {data && summary ? (
          <>
            <ContributionGrid weeks={data.weeks} />
            <p className="text-text-subtle font-mono text-xs">
              {summary.activeDays} active days · longest streak{" "}
              {summary.longest} days · best day {summary.best} contributions
            </p>
            {/* The same data as text, for screen readers. */}
            <ul className="sr-only">
              {summary.months.map((month) => (
                <li key={month.key}>
                  {month.label}: {month.count} contributions
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-text-muted">
            The contribution graph could not be loaded right now.
          </p>
        )}
      </Reveal>
    </section>
  );
}
