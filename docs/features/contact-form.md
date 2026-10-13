# Contact form

A form (name, email, message) that sends the message to Derick's inbox. It opens as a panel beside the sidebar from the Contact button. His email address is not shown on the page. Built 2026-10-13; it reports "not set up yet" until the variables below are added.

## How it works

- UI: `src/components/sections/sidebar/contact-panel.tsx`. Controlled fields, so a failed send keeps what the visitor typed. Inline errors, and sending, sent, and failed states.
- Server: `src/app/api/contact/route.ts`, a route handler. In order it checks: same-origin request, body size, the honeypot field, validation, the rate limit (3 messages per 10 minutes per visitor), then sends through Resend. Nothing is stored.
- Validation rules are shared by the form and the server in `src/lib/contact.ts`.
- The email is plain text, with the visitor's address as reply-to.

## Variables

Claude cannot edit `.env*` files (a hook blocks it); they are listed in `.env.example` and Derick adds the real values to `.env.local` and to the host's environment settings.

- `RESEND_API_KEY`: the Resend API key (service chosen 2026-10-13).
- `CONTACT_TO_EMAIL`: the inbox that receives messages. Until a domain is verified in Resend, this must be the address the Resend account was created with.
- `CONTACT_FROM_EMAIL` (optional): the sender, once a domain is verified. Defaults to Resend's shared sender.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: make the rate limit work across server instances. Without them it only counts in memory, which is fine locally but not when deployed.

## Hosting

The form needs a host that runs server code (such as Vercel), so do not configure a static export.
