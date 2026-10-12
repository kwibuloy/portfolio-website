---
name: deploy-check
description: Full pre-deploy check of the portfolio - lint, type-check, production build, bundle size review, security checks, and a performance and accessibility audit. Use before deploying or pushing to the main branch, or when the user asks whether the site is ready to ship.
disable-model-invocation: true
---

# Preflight check

Run every step even if an earlier one fails, so the user gets the complete picture in one pass. Do not fix anything during the check unless the user asked for fixes; report first.

## 1. Static checks

Run the project's lint and type-check scripts (see `package.json`; normally `npm run lint` and `npx tsc --noEmit`). Record the errors and warnings.

## 2. Production build

Run `npm run build`. Record:

- Whether it succeeded, with the exact error if it did not.
- The route size table. Flag any route whose first-load JavaScript is unusually large, and work out what is causing it; three.js loaded outside a dynamic import is the usual culprit.
- Any build warnings.

## 3. Content and links

- Search for leftover placeholder content: `lorem`, `TODO`, `FIXME`, `example.com`, empty `href="#"` links, placeholder images.
- Check that each page sets metadata (title, description, Open Graph image) and that a favicon exists.
- Check that the resume or CV link and the social links point somewhere real.
- Search for stray `console.log` statements.

## 4. Assets

List the files in `public/` larger than 500 KB (images, models, video, fonts) and say whether each one can be compressed or lazy-loaded.

## 5. Security

- **Secrets**: search the source and `public/` for API keys, tokens, and private emails or phone numbers. Confirm `.env*` files are in `.gitignore` and, if this is a git repository, that none were ever committed (`git log --all --name-only -- ".env*"`).
- **Client exposure**: any environment variable prefixed `NEXT_PUBLIC_` is shipped to the browser. Flag any that hold a secret.
- **Dependencies**: run `npm audit --omit=dev` and report high and critical findings.
- **External links**: links that open a new tab use `rel="noopener noreferrer"`.
- **Contact form**: input is validated on the server, the honeypot and rate limiting are in place, the recipient address and API key come from environment variables, and no secret or stack trace is returned to the client. Remind the user to set those variables on the host and to send one real test message after deploying.

## 6. Performance and accessibility audit

Run the `site-auditor` agent over the whole site and include its findings.

## 7. Verdict

Finish with one of:

- **Ready to ship**: nothing blocking.
- **Ship after fixes**: list the blockers (build failure, type errors, exposed secrets, broken links, placeholder content, inaccessible interactions).

Below that, list the non-blocking improvements, ordered by impact. Report failures with their actual output; do not soften them.
