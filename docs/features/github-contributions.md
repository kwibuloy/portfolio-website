# GitHub contributions

The last section of the home page shows Derick's GitHub contribution graph for the last 12 months, as on his profile. Built 2026-10-13.

## How it works

- `src/lib/github.ts` asks GitHub's GraphQL API for the contribution calendar of the username in `src/content/site.ts` (`kwibuloy`). It runs on the server only and is cached with `"use cache"`: ten minutes on success (changed from one day on 2026-10-13, because a new commit took up to a day to appear), a few minutes on failure. After ten minutes the next visit still gets the stored graph and triggers a refresh in the background, so the visit after that one shows the new commit. In `npm run dev` the stored copy lives in the dev server's memory; restart the server to force a fresh fetch.
- The token is `GITHUB_TOKEN` in `.env.local` (fine-grained, "Public repositories", no permissions). It must also be set in the host's environment settings when the site is deployed.
- `src/components/sections/home/contributions.tsx` (server) computes the stats and monthly totals. `contribution-grid.tsx` (client) draws the graph, the hover read-out, and the reveal animation.
- If the token is missing or GitHub fails, the section shows a short message and the profile link.

## Open

- Checked 2026-10-13: GitHub returns 23 contributions for the last year, 17 of them from private repositories, so private contributions are being counted. Derick should still compare the total with his profile once.
- The token expires (one year at most) and must then be replaced.
