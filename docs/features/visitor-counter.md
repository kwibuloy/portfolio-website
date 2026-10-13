# Visitor counter

Shows the total number of unique visitors in the sidebar. Built 2026-10-13.

## How it works

- `src/components/sections/sidebar/sidebar-actions.tsx` posts to `/api/visitors` once per page load and shows the number returned.
- `src/app/api/visitors/route.ts` adds the visitor to a Redis HyperLogLog (`PFADD`) and returns its estimate (`PFCOUNT`). A HyperLogLog counts distinct values without storing them, and adding the same visitor again changes nothing.
- The visitor is identified by a salted SHA-256 hash of IP address and browser (`src/lib/server/request.ts`). No raw IP address is stored and no cookie is set. Requests from obvious bots are not counted.
- The endpoint only accepts same-origin requests and is rate limited.

## Storage

- Upstash Redis (chosen 2026-10-13): `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- `VISITOR_SALT` (optional): the salt for the hash. Defaults to the Upstash token.
- Without the Upstash variables: in development the count is kept in memory and resets when the server restarts; in production the sidebar shows a dash.
