import { createHash } from "node:crypto";

// Server-only helpers for route handlers.

const salt = () =>
  process.env.VISITOR_SALT ??
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  "development";

const hash = (value: string) =>
  createHash("sha256").update(`${salt()}|${value}`).digest("hex");

const ipOf = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/**
 * An anonymous key for rate limiting: a salted hash of the caller's IP
 * address. The address itself is never stored.
 */
export function clientKey(request: Request) {
  return hash(ipOf(request));
}

/**
 * An anonymous fingerprint for counting unique visitors: a salted hash of the
 * IP address and browser. It cannot be turned back into either.
 */
export function visitorKey(request: Request) {
  return hash(`${ipOf(request)}|${request.headers.get("user-agent") ?? ""}`);
}

export function isBot(request: Request) {
  return /bot|crawl|spider|preview|monitor|headless/i.test(
    request.headers.get("user-agent") ?? "",
  );
}

/**
 * True when the request was made by a page on this site. Browsers send the
 * Origin header on POST requests, so another website cannot make a visitor's
 * browser post to these endpoints.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
