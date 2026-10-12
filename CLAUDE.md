# Portfolio Website

Derick's personal developer portfolio, aimed at engineering recruiters and hiring managers. It should show real engineering skill through the site itself: interactive, animated, and polished, while staying fast and accessible.

## Status

**Scaffolded on 2026-10-13.** Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript, Tailwind CSS 4, ESLint 9, and Prettier with `prettier-plugin-tailwindcss`. The home page is an empty shell; no section is built yet.

- **Not installed yet**: GSAP, Motion, React Three Fiber, drei, shadcn/ui. Add each one with the first section that uses it.
- **Design**: the Figma file is https://www.figma.com/design/BNWVMI9cUxgIGxTH6xEMsB. Theme tokens in `src/app/globals.css` are still the starter defaults until `/sync-tokens` runs.
- **Tailwind 4 has no `tailwind.config`**: theme tokens are CSS variables in the `@theme` block of `src/app/globals.css`.
- **`AGENTS.md`** is written by `next dev`. It says this Next.js version differs from older ones: read the relevant guide in `node_modules/next/dist/docs/` before using a Next.js API.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching` (scaffold defaults).

## Stack

- **Framework**: Next.js (App Router) + TypeScript, npm as the package manager
- **Styling**: Tailwind CSS is the primary layer. shadcn/ui is available for complex accessible components (dialog, tooltip, tabs); add one only when it is actually needed, and restyle it to the design.
- **Animation**: GSAP + ScrollTrigger for scroll scenes, timelines, and animating 3D objects. Motion (`motion/react`) for UI enter/exit, layout, and hover transitions.
- **3D**: React Three Fiber + drei
- **Design source**: Figma. Design first, then build.

Check `package.json` for the installed versions before relying on version-specific APIs.

## How to work with me

1. **Plan first.** Before building a feature, section, or any non-trivial change, give me a short plan: what you will build, the components involved, how it animates, and any open questions. Wait for my approval before writing code. Small fixes and one-line changes do not need a plan.
2. **Explain as we go.** I am learning parts of this stack, especially GSAP and 3D. When a choice is not obvious, explain why in a sentence or two: why this library, why a client component, why this pattern. Skip explanations of basics.
3. **Design in Figma first.** Sections are designed in Figma before they are coded. If I ask for a section that has no design yet, say so and ask whether to design it first.

## Commands

```
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npm run format   # Prettier on the whole project
npx tsc --noEmit # type-check
```

## Structure

```
src/
  app/                  # routes, root layout, globals.css (Tailwind theme tokens)
  components/
    sections/           # one folder per page section (hero, about, projects, ...)
    ui/                 # small reusable pieces, including any shadcn/ui components
    three/              # React Three Fiber scenes and meshes
  content/              # typed content: projects, technologies, experience
  lib/                  # helpers, GSAP plugin registration
public/                 # images, models, fonts
```

## Conventions

**Components**

- Server components by default. Add `"use client"` only to the part that needs state, effects, or animation, and keep that part small.
- Content lives in typed files in `src/content/`, not inline in components. Adding a project or a technology should mean editing one data file.

**Styling**

- Use theme tokens for colour, spacing, type, and radius. No hardcoded hex values or arbitrary pixel values in components. If the design needs a new value, add a token.
- Build mobile-first and check 375px, 768px, and 1280px+.

**Animation**

- GSAP runs inside `useGSAP` from `@gsap/react` with a `scope` ref so it cleans up on unmount. Register plugins once in `src/lib/`.
- One library per element: never drive the same property of the same element from both GSAP and Motion.
- Animate `transform` and `opacity`, not layout properties.
- Every animation needs a `prefers-reduced-motion` path that still shows all content.

**3D**

- Load every `<Canvas>` with `next/dynamic` and `ssr: false`, with a sized placeholder to avoid layout shift.
- No `setState` and no object allocation inside `useFrame`.
- Every 3D interaction needs a keyboard-accessible DOM equivalent.

**Accessibility and performance** are requirements, not polish: semantic HTML, visible focus styles, WCAG AA contrast, `next/image` and `next/font`, heavy libraries loaded only where they are used.

## Planned feature: tech keyboard

A 3D interactive numpad-style keyboard where each key is a technology I use. Clicking a key shows my experience with that technology.

- **How the 3D model is built is undecided.** I am looking for an existing model first. The options are a `.glb` model wired up in R3F, keys built from geometry in code, or Spline. Ask before assuming one.
- The technology list and experience text belong in `src/content/`, so the 3D scene and an accessible fallback list both read from the same data.

## Planned feature: contact form

A contact section with a form (name, email, message) that sends the message to my inbox. My email address is not shown on the page.

- **Sending**: a server action or route handler calls an email service. Resend is the suggested service; confirm the choice with me when planning the section.
- **Recipient address is undecided.** Read it from an environment variable (`CONTACT_TO_EMAIL`), never hardcode it.
- **Secrets**: the email service API key lives in `.env.local` and in the host's environment settings, never in a `NEXT_PUBLIC_` variable. You cannot edit `.env*` files (a hook blocks it), so list the variables in `.env.example` and ask me to add the real values.
- **Validation**: validate on the server (required fields, email format, length limits) even though the client validates too.
- **Abuse protection**: a honeypot field plus rate limiting at minimum.
- **UX**: labelled inputs, inline errors, and clear sending, success, and failure states. Failure must not lose what the visitor typed.
- **Hosting**: the form needs a host that runs server code (such as Vercel), so do not configure a static export.

## Roles and scope

- **Frontend development is the main Claude session's job**, guided by this file. The sub-agents below are narrow specialists and reviewers, not a replacement for it.
- **The only backend is the contact form** (see below). Everything else is static. Any other server code (route handler, server action, third-party API key) needs a plan first that covers server-side validation, abuse protection, and where the secret lives.
- **Security** is checked by `code-reviewer` on each change and by `/deploy-check` before shipping. For a deeper pass on pending changes, use the built-in `/security-review`.

## Automation in this repo

**Hooks** (`.claude/settings.json`, scripts in `.claude/hooks/`):

- After each edit, Prettier and ESLint `--fix` run on the file. Unfixable lint errors are reported back to you to fix.
- Before a turn ends, `tsc --noEmit` runs. Type errors must be fixed before finishing.
- Edits to `.env*` files and lockfiles are blocked, as are force pushes, `git reset --hard`, `git clean -f`, and recursive force deletes of anything other than build output. If one of these is really needed, ask me to do it.
- A sound plays when you finish or need my input.

**Sub-agents** (`.claude/agents/`):

- `motion-3d`: GSAP, Motion, and R3F work
- `figma-builder`: builds a component from a Figma frame
- `site-auditor`: read-only performance and accessibility audit
- `code-reviewer`: read-only review before committing

**Skills** (`.claude/skills/`):

- `/new-section`: plan, then build a section or page
- `/sync-tokens`: pull Figma variables into the Tailwind theme
- `/deploy-check`: full pre-deploy check
