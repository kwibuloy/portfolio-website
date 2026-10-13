import { allowRequest, getRedis } from "@/lib/server/redis";
import {
  clientKey,
  isBot,
  isSameOrigin,
  visitorKey,
} from "@/lib/server/request";

const KEY = "portfolio:visitors";
// Stands in for Redis during local development only.
const memory = new Set<string>();

/**
 * Records the caller as a visitor and returns the number of unique visitors.
 *
 * The count is a Redis HyperLogLog: a structure that estimates how many
 * different values it has seen without storing any of them. Adding the same
 * visitor twice changes nothing, so the page can call this on every load.
 * `count` is null when no database is configured.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ count: null }, { status: 403 });
  }
  if (!(await allowRequest("visitors", clientKey(request), 30, "1 m"))) {
    return Response.json({ count: null }, { status: 429 });
  }

  const redis = getRedis();
  const counted = !isBot(request);

  if (redis) {
    try {
      if (counted) await redis.pfadd(KEY, visitorKey(request));
      return Response.json({ count: await redis.pfcount(KEY) });
    } catch {
      return Response.json({ count: null }, { status: 502 });
    }
  }

  if (process.env.NODE_ENV !== "production") {
    if (counted) memory.add(visitorKey(request));
    return Response.json({ count: memory.size });
  }
  return Response.json({ count: null });
}
