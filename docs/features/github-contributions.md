# GitHub contributions

The last section of the home page shows Derick's GitHub contribution graph for the last 12 months, as on his profile. Built 2026-10-13.

## How it works

- `src/lib/github.ts` asks GitHub's GraphQL API for the contribution calendar of the username in `src/content/site.ts` (`kwibuloy`). It runs on the server only and is cached with `"use cache"`: one day on success, a few minutes on failure.
- The token is `GITHUB_TOKEN` in `.env.local` (fine-grained, "Public repositories", no permissions). It must also be set in the host's environment settings when the site is deployed.
- `src/components/sections/home/contributions.tsx` (server) computes the stats and monthly totals. `contribution-grid.tsx` (client) draws the graph, the hover read-out, and the reveal animation.
- If the token is missing or GitHub fails, the section shows a short message and the profile link.

## Open

- The first fetch returned 26 contributions. Derick should compare that with his profile. If the profile shows more, private contributions are not being counted: turn on "Private contributions" in the profile's contribution settings, and if the number still differs, the token type needs changing.
- The token expires (one year at most) and must then be replaced.
