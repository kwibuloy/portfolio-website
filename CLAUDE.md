# Portfolio Website

Derick's personal developer portfolio, aimed at engineering recruiters and hiring managers. It should show real engineering skill through the site itself: interactive, animated, and polished, while staying fast and accessible.

**This file points; it does not hold detail.** Keep it under 200 lines. Decisions, plans, and status go in the `docs/` files below, with a one-line pointer here.

## Where to look

| Topic                                               | File                                    |
| --------------------------------------------------- | --------------------------------------- |
| Pages, sidebar, what is built and what is not       | `docs/site-structure.md`                |
| Theme, tokens, background, Figma file and its state | `docs/design.md`                        |
| 3D tech keyboard                                    | `docs/features/tech-keyboard.md`        |
| Contact form                                        | `docs/features/contact-form.md`         |
| Chatbot ("Ask anything")                            | `docs/features/ai-chatbot.md`           |
| GitHub contributions section                        | `docs/features/github-contributions.md` |
| Visitor counter                                     | `docs/features/visitor-counter.md`      |
| Next.js version differences (written by `next dev`) | `AGENTS.md`                             |
| Installed versions                                  | `package.json`                          |

Read the matching file before planning or changing that area, and update it when a decision changes.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript, npm as the package manager. `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Read the relevant guide in `node_modules/next/dist/docs/` before using a Next.js API.
- **Styling**: Tailwind CSS 4. There is no `tailwind.config`; tokens are in `src/app/globals.css`. shadcn/ui only when a complex accessible component is actually needed, restyled to the design.
- **Animation**: Motion (`motion/react`) for UI enter/exit, layout, and hover. GSAP + ScrollTrigger for scroll scenes, timelines, and animating 3D objects.
- **3D**: React Three Fiber + drei.
- **Icons**: `lucide-react` for UI icons, `simple-icons` for brand logos.
- **Not installed yet**: shadcn/ui. Add it with the first component that needs it.

## How to work with me

1. **Plan first.** Before building a feature, section, or any non-trivial change, give me a short plan: what you will build, the components involved, how it animates, and any open questions. Wait for my approval before writing code. Small fixes and one-line changes do not need a plan.
2. **Explain as we go.** I am learning parts of this stack, especially GSAP and 3D. When a choice is not obvious, explain why in a sentence or two. Skip explanations of basics.
3. **Design.** Figma is the intended design source, but it is currently out of date and the site is being built in code first (see `docs/design.md`). Ask before designing in Figma.

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
    sections/           # one folder per page section (sidebar, home, ...)
    ui/                 # small reusable pieces, including any shadcn/ui components
    three/              # React Three Fiber scenes and meshes
  content/              # typed content: one file per section
  lib/                  # helpers, GSAP plugin registration
public/                 # images, models, fonts
docs/                   # decisions and feature plans (see the table above)
```

## Conventions

**Components**

- Server components by default. Add `"use client"` only to the part that needs state, effects, or animation, and keep that part small.
- Content lives in typed files in `src/content/`, not inline in components.

**Styling**

- Use theme tokens for colour, spacing, type, and radius. No hardcoded hex values or arbitrary pixel values in components. If the design needs a new value, add a token.
- Build mobile-first and check 375px, 768px, and 1280px+.

**Animation**

- GSAP runs inside `useGSAP` from `@gsap/react` with a `scope` ref. Register plugins once in `src/lib/`.
- One library per element: never drive the same property of the same element from both GSAP and Motion.
- Animate `transform` and `opacity`, not layout properties.
- Every animation needs a `prefers-reduced-motion` path that still shows all content.

**3D**

- Load every `<Canvas>` with `next/dynamic` and `ssr: false`, with a sized placeholder to avoid layout shift.
- No `setState` and no object allocation inside `useFrame`.
- Every 3D interaction needs a keyboard-accessible DOM equivalent.

**Accessibility and performance** are requirements, not polish: semantic HTML, visible focus styles, WCAG AA contrast, `next/image` and `next/font`, heavy libraries loaded only where they are used.

## Roles and scope

- **Frontend development is the main Claude session's job.** The sub-agents are narrow specialists and reviewers.
- **Server code is limited to the contact form (`/api/contact`), the visitor counter (`/api/visitors`), and the cached GitHub fetch.** The chatbot runs in the browser. Everything else is static. Any server code needs a plan first that covers server-side validation, abuse protection, and where the secret lives. Do not configure a static export.
- **Security** is checked by `code-reviewer` on each change and by `/deploy-check` before shipping. For a deeper pass, use `/security-review`.

## Automation in this repo

**Hooks** (`.claude/settings.json`, scripts in `.claude/hooks/`):

- After each edit, Prettier and ESLint `--fix` run on the file. Unfixable lint errors are reported back to fix.
- Before a turn ends, `tsc --noEmit` runs. Type errors must be fixed before finishing.
- Edits to `.env*` files and lockfiles are blocked, as are force pushes, `git reset --hard`, `git clean -f`, and recursive force deletes of anything other than build output. If one is really needed, ask me to do it.

**Sub-agents** (`.claude/agents/`): `motion-3d` (GSAP, Motion, R3F), `figma-builder` (component from a Figma frame), `site-auditor` (read-only performance and accessibility audit), `code-reviewer` (read-only review before committing).

**Skills** (`.claude/skills/`): `/new-section` (plan, then build a section or page), `/sync-tokens` (pull Figma variables into the theme; see the warning in `docs/design.md`), `/deploy-check` (full pre-deploy check).
