import {
  type ContactInput,
  type ContactResponse,
  validateContact,
} from "@/lib/contact";
import { allowRequest } from "@/lib/server/redis";
import { clientKey, isSameOrigin } from "@/lib/server/request";

const MAX_BODY = 20_000; // characters; far above any valid message

const reply = (body: ContactResponse, status = 200) =>
  Response.json(body, { status });

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Receives the contact form and emails it to the address in
 * CONTACT_TO_EMAIL through Resend. Nothing is stored.
 *
 * Order matters: the cheap checks (origin, size, honeypot, validation) run
 * before the rate limit and the email call.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return reply({ ok: false, error: "This request was not accepted." }, 403);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return reply({ ok: false, error: "That message is too long." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ ok: false, error: "The form could not be read." }, 400);
  }

  // Honeypot: a field people never see. Bots that fill every field reveal
  // themselves; they get a success reply so they do not retry.
  if (text(body.website)) return reply({ ok: true });

  const input: ContactInput = {
    name: text(body.name).trim(),
    email: text(body.email).trim(),
    message: text(body.message).trim(),
  };
  const fieldErrors = validateContact(input);
  if (Object.keys(fieldErrors).length > 0) {
    return reply(
      { ok: false, error: "Check the highlighted fields.", fieldErrors },
      400,
    );
  }

  if (!(await allowRequest("contact", clientKey(request), 3, "10 m"))) {
    return reply(
      {
        ok: false,
        error: "Too many messages in a short time. Try again in 10 minutes.",
      },
      429,
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return reply(
      { ok: false, error: "The contact form is not set up yet." },
      503,
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Resend's shared sender works without a verified domain.
        from:
          process.env.CONTACT_FROM_EMAIL ??
          "Portfolio contact <onboarding@resend.dev>",
        to,
        reply_to: input.email,
        // Line breaks are removed so the name cannot add email headers.
        subject: `Portfolio message from ${input.name.replace(/[\r\n]+/g, " ")}`,
        // Plain text only, so nothing the visitor typed is treated as HTML.
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      }),
    });
    if (!response.ok) throw new Error(`Resend replied ${response.status}`);
  } catch (error) {
    console.error("Contact form email failed:", error);
    return reply(
      {
        ok: false,
        error: "Your message could not be sent. Please try again.",
      },
      502,
    );
  }

  return reply({ ok: true });
}
