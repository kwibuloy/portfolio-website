import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Server-only: imported by route handlers, never by client components.

let client: Redis | null | undefined;

/** The Upstash Redis client, or null when its two variables are not set. */
export function getRedis() {
  if (client === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    client = url && token ? new Redis({ url, token }) : null;
  }
  return client;
}

type Window = `${number} ${"s" | "m" | "h"}`;
const limiters = new Map<string, Ratelimit>();
// Used only when Redis is not configured (local development).
const memory = new Map<string, number[]>();
const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000 };

/**
 * Returns true when `key` may make another request: at most `max` requests
 * per `window`, counted separately for each `name`.
 *
 * With Redis the count is shared by every server instance. Without it, the
 * count lives in this process's memory, which is enough for local testing
 * but not for a deployed site.
 */
export async function allowRequest(
  name: string,
  key: string,
  max: number,
  window: Window,
) {
  const redis = getRedis();
  if (redis) {
    let limiter = limiters.get(name);
    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, window),
        prefix: `portfolio:limit:${name}`,
      });
      limiters.set(name, limiter);
    }
    return (await limiter.limit(key)).success;
  }

  const [amount, unit] = window.split(" ") as [string, keyof typeof UNIT_MS];
  const since = Date.now() - Number(amount) * UNIT_MS[unit];
  const id = `${name}:${key}`;
  const recent = (memory.get(id) ?? []).filter((time) => time > since);
  if (recent.length >= max) return false;
  recent.push(Date.now());
  memory.set(id, recent);
  return true;
}
