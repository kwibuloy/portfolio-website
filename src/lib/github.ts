import { cacheLife } from "next/cache";

export type ContributionDay = {
  /** ISO date, for example "2026-03-04". */
  date: string;
  count: number;
  /** 0 (none) to 4 (most), the same buckets GitHub's own graph uses. */
  level: 0 | 1 | 2 | 3 | 4;
};

export type Contributions = {
  total: number;
  /** Columns of the graph: each week is up to seven days, Sunday first. */
  weeks: ContributionDay[][];
};

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
  }
}`;

type Response = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: keyof typeof LEVELS;
            }[];
          }[];
        };
      };
    };
  };
};

/**
 * The last 12 months of contributions, as shown on the GitHub profile.
 *
 * "use cache" stores the result on the server, so GitHub is asked about once
 * a day instead of on every visit, and the token never reaches the browser.
 * Returns null when the token is missing or GitHub cannot be reached; that
 * result is kept only for a few minutes so the next attempt comes soon.
 */
export async function getContributions(
  login: string,
): Promise<Contributions | null> {
  "use cache";

  const token = process.env.GITHUB_TOKEN;
  const calendar = token ? await fetchCalendar(login, token) : null;
  if (!calendar) {
    cacheLife("minutes");
    return null;
  }

  cacheLife("days");
  return {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    ),
  };
}

async function fetchCalendar(login: string, token: string) {
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as Response;
    return (
      json.data?.user?.contributionsCollection.contributionCalendar ?? null
    );
  } catch {
    return null;
  }
}
