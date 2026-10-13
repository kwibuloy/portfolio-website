# Site structure

Decided 2026-10-13. Multi-page site with a persistent left sidebar, modelled on the layout of bryllim.com (reference only; the theme is ours).

## Sidebar

- **Top row**: "Derick Conrad D. Mercado" (links to `/`), light/dark toggle, audio toggle. The audio toggle controls UI sound effects only (off by default, no background music).
- **Nav, in this order**: Education, Experience, Tech Stack, Projects, Certifications, Services. Each is its own route with the full details. Each link has a number and an icon; a solid pill marks the current page and a faint pill slides to the hovered link. A soft light follows the pointer across the sidebar (`sidebar/spotlight.tsx`), and the name scrambles on hover.
- **Below the nav**: "Ask anything" (opens the chatbot), the unique visitor count, and "Contact" (opens the contact form). Both open as panels beside the sidebar, or as a bottom sheet on small screens. See the three files in `docs/features/`.
- Below the `lg` breakpoint the sidebar becomes a top bar with a slide-in drawer (a native `<dialog>`).

## Pages

- **Home (`/`)**: photo, short intro, social links (GitHub, LinkedIn, Discord, Messenger, Instagram; no WhatsApp), then a summary block for each nav section linking to its page, and last a GitHub contributions section (see `docs/features/github-contributions.md`).
- **Section pages**: `/education`, `/experience`, `/tech-stack`, `/projects`, `/certifications`, `/services`.
- Summaries and full pages read from the same typed files in `src/content/`. The nav labels and blurbs are in `src/content/site.ts`.

## Interactive sections

Each section has its own way of being explored. The home page carries the playful versions; the Projects and Certifications pages are plain and detailed (swapped on 2026-10-13 at Derick's request).

| Section        | Home page                                                                                                                                                                                                                           | Its own page                                                                                                                                                                                                                                                                                           | Code                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Hero           | The portrait in colour, glitching on hover (slices jump, red and cyan ghosts split off, scan lines flash; all CSS), the name resolving from scrambled letters, a resume download, and a stats strip counted from the content files. | n/a                                                                                                                                                                                                                                                                                                    | `sections/home/hero.tsx`, `glitch-portrait.tsx`, `ui/scramble-text.tsx`      |
| Education      | Git commit graph that draws as the page scrolls.                                                                                                                                                                                    | A record of the degree: school and a GPA that counts up, award badges, a progress bar to the expected graduation in 2028, two award photos as pinned prints that open large on click (`sections/education/award-photos.tsx`, images in `public/education/`), coursework tiles, and organisation cards. | `ui/git-timeline.tsx`, `app/education/page.tsx`, `ui/count-up.tsx`           |
| Experience     | Git commit graph, as above.                                                                                                                                                                                                         | Full-width bands, one per role, with a pulsing "now" marker on current roles. Hover inverts a band; click opens it and the details slide in. Roles without details do not open.                                                                                                                        | `ui/git-timeline.tsx`, `sections/experience/experience-bands.tsx`            |
| Tech Stack     | The floating 3D keyboard; hover shows a summary.                                                                                                                                                                                    | Same keyboard; hover shows the summary and click shows the detailed experience. See `docs/features/tech-keyboard.md`.                                                                                                                                                                                  | `three/tech-keyboard/`                                                       |
| Projects       | A desktop with draggable windows and a taskbar (a swipeable row below `sm`).                                                                                                                                                        | One detailed case study per project: role, stack, highlights, links.                                                                                                                                                                                                                                   | `sections/projects/project-desktop.tsx`, `app/projects/page.tsx`             |
| Certifications | A fanned stack of large cards with an index; flick or flip.                                                                                                                                                                         | One detailed entry per certificate.                                                                                                                                                                                                                                                                    | `sections/certifications/certificate-fan.tsx`, `app/certifications/page.tsx` |
| Services       | Tags only. Not designed yet; Derick asked to leave it.                                                                                                                                                                              | Plain card grid.                                                                                                                                                                                                                                                                                       | `app/services/page.tsx`                                                      |
| GitHub         | Minimal contribution graph: heading, total, the grid with a cursor ripple, one line of stats. See `docs/features/github-contributions.md`.                                                                                          | n/a                                                                                                                                                                                                                                                                                                    | `sections/home/contributions.tsx`, `contribution-grid.tsx`                   |

## Build state

- Built: the shell, the home page, the six section pages, the 3D tech keyboard, the interactive sections above, and the GitHub graph.
- Waiting on keys: the contact form and visitor counter are built, but need the Resend and Upstash variables in `.env.local` (see `.env.example`) before they work for real.

## Content state (2026-10-13)

- **Real**: projects (MediQueue, SD-185, ProcureGuard, LogiBot, written from each project's README and docs), experience (roles and dates from LinkedIn; details from the resume and SD-185), education and the CS50 certificate (from the resume), the portrait (`public/portrait.jpg`), the GitHub and LinkedIn links, and the technology list.
- **Still placeholder**: the intro paragraphs and the "Developer" role line in `src/content/site.ts`; the Discord, Messenger, and Instagram links; the Google Colab and Antigravity notes on the keyboard; the services; project screenshots.
- **Deliberately empty**: the FlyRank AI and Elevvo Pathways internships have no details yet. Derick will add them once there is project work to describe.
- **To confirm with Derick**: his role on ProcureGuard (written as "Prototype developer", inferred from the repo), the years on each project, and whether the two GitHub repositories linked from the projects are public.
- **Resume**: `public/Derick-Mercado-Resume.pdf`, converted from his Word file and offered as a download in the hero. It contains his email address and phone number, and Derick has said it is out of date. Ask before deploying whether those should stay in the public copy.

## Where things live

- `src/components/sections/sidebar/`: sidebar content, nav links, mobile drawer.
- `src/components/sections/home/`: hero, summary block.
- `src/components/three/tech-keyboard/`: the 3D keyboard.
- `src/components/ui/`: background, reveal animation, cards, page frame, toggles.
- `src/lib/preferences.ts`: theme and sound state, and the synthesised click sound.
