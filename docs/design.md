# Design and theme

## Direction

Revised 2026-10-13: monochrome. White base with gradients of gray and black, plus a dark mode. The look should be lively, not minimalistic: motion, gradients, and 3D carry it. The background is topographic contour lines mixed with soft gradient shapes, not a plain fill.

## Tokens in code

- `src/app/globals.css` is the source of truth. Tailwind 4 has no `tailwind.config`; theme tokens are CSS variables in the `@theme` block.
- Colours are defined on `:root` (light) and `[data-theme="dark"]`, then exposed to Tailwind as `--color-*`.
- Theme and sound state are `data-theme` / `data-sound` attributes on `<html>`. An inline script in `src/app/layout.tsx` sets them before first paint, and the `dark:` and `sound-on:` variants style against them. The logic is in `src/lib/preferences.ts`.
- **Scale** (2026-10-15): the desktop design was tuned at 80% browser zoom, so from `64rem` up `html` has `font-size: 80%` (in `globals.css`). Every size is in rem, so this scales the whole layout. Phones and tablets stay at 100% to keep small text readable. Check designs at 100% browser zoom from now on.
- The contour lines are `public/contours.svg`, a tiling SVG applied as a CSS mask by the `.contour-lines` class, so the line colour is the `--contour` token.

## Site-wide motion

- **Theme switch** (2026-10-14, revised): a circle in the new theme grows out of the toggle button until it covers the screen. 0.6 s, linear. View Transitions API (`document.startViewTransition`) with a `clip-path` circle animated on `::view-transition-new(root)`; the default cross-fade is off in `globals.css`. See `src/lib/theme-transition.ts`. Reduced motion or no View Transitions: instant switch.
- **Backdrop contrast** (2026-10-14): `--contour` is one translucent grey shared by both themes, chosen so it reads as `#dddddd` over the light `--bg` and `#272727` over the dark one (about 1.3:1 each), so the topography is identical in both. The dark `--glow` and `--glow-deep` match the light ones' contrast too. Keep them paired when changing either theme's `--bg`.
- **Text over the backdrop** (2026-10-14, pre-deploy audit): small labels sit straight on the backdrop, so the worst spot (a contour line over the `--glow-deep` shape) sets the limits. `--contour` alpha 0.25, the `--glow-deep` shape at 10% opacity, and `--text-subtle` `#5a5a5a` / `#9c9c9c` keep `--text-subtle` at 4.7:1 or better there in both themes. Re-check that spot when changing any of them.
- **Theme and sound toggles** (2026-10-14): light and dark are two joined round buttons with a pill that slides to the one in use; the unused icon spins and shrinks. The sound button sits beside them as its own round button. Visuals follow `data-theme` through `dark:` classes; `aria-pressed` comes from `useSyncExternalStore`. See `src/components/ui/preference-toggles.tsx`.
- **Form fields** (2026-10-14): field outlines use `--input-border` (`#8a8a8a` light, `#6a6a6a` dark), which is 3:1 against the panels. `--border-strong` is too faint to find a field by.
- **Entrances above the fold** (2026-10-14, pre-deploy audit): the hero, each page's heading, and the nav come in with CSS animations (`animate-reveal`, `animate-reveal-left` in `globals.css`; `<Reveal immediate>`), not Motion, so they play from the first paint instead of after hydration and still show if JavaScript fails. Everything below the fold keeps the Motion `whileInView` reveal.
- **Portrait** (2026-10-14): monochrome in both themes (`grayscale`; brighter in light, darker and higher-contrast in dark), fading with the theme switch.
- **Back to top** (2026-10-14, revised): `src/components/ui/back-to-top.tsx`, in the root layout. A round arrow button at the bottom centre of the content area, shown only on pages taller than 2.5 screens and within 0.6 screens of the bottom. On click the button pops away (Motion) and GSAP scrolls the page to the top while wind streaks rush down the screen, then focus moves to `#content`. Reduced motion: an instant jump, no wind. GSAP and ScrollToPlugin are imported on demand when the button appears (`src/lib/gsap-scroll-to.ts`), so they are not in any page's first download. This is the one deliberate exception to "GSAP runs inside `useGSAP`": `useGSAP` needs GSAP loaded up front. The timeline is kept in a ref, finished on a route change, and a failed download falls back to an instant jump.

## Design source

Decided 2026-10-14: no Figma. The site is designed in code, and `src/app/globals.css` is the only source of truth for tokens. The old Figma file (green palette, single-page layout) is abandoned and should not be used as a reference.

## Reference images

- `docs/design-reference/tech-keyboard.png`: inspiration for the 3D tech keyboard. Its dark starfield background does not apply.
