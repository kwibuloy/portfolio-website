# Design and theme

## Direction

Revised 2026-10-13: monochrome. White base with gradients of gray and black, plus a dark mode. The look should be lively, not minimalistic: motion, gradients, and 3D carry it. The background is topographic contour lines mixed with soft gradient shapes, not a plain fill.

## Tokens in code

- `src/app/globals.css` is the source of truth. Tailwind 4 has no `tailwind.config`; theme tokens are CSS variables in the `@theme` block.
- Colours are defined on `:root` (light) and `[data-theme="dark"]`, then exposed to Tailwind as `--color-*`.
- Theme and sound state are `data-theme` / `data-sound` attributes on `<html>`. An inline script in `src/app/layout.tsx` sets them before first paint, and the `dark:` and `sound-on:` variants style against them. The logic is in `src/lib/preferences.ts`.
- The contour lines are `public/contours.svg`, a tiling SVG applied as a CSS mask by the `.contour-lines` class, so the line colour is the `--contour` token.

## Site-wide motion

- **Theme switch** (2026-10-14, revised): a circle in the new theme grows out of the toggle button until it covers the screen. 0.6 s, linear. View Transitions API (`document.startViewTransition`) with a `clip-path` circle animated on `::view-transition-new(root)`; the default cross-fade is off in `globals.css`. See `src/lib/theme-transition.ts`. Reduced motion or no View Transitions: instant switch.
- **Backdrop contrast** (2026-10-14): `--contour` is one translucent grey shared by both themes, chosen so it reads as `#cbcbcb` over the light `--bg` and `#363636` over the dark one (1.62:1 each), so the topography is identical in both. The dark `--glow` and `--glow-deep` match the light ones' contrast too. Keep them paired when changing either theme's `--bg`.
- **Theme and sound toggles** (2026-10-14): light and dark are two joined round buttons with a pill that slides to the one in use; the unused icon spins and shrinks. The sound button sits beside them as its own round button. Visuals follow `data-theme` through `dark:` classes; `aria-pressed` comes from `useSyncExternalStore`. See `src/components/ui/preference-toggles.tsx`.
- **Portrait** (2026-10-14): monochrome in both themes (`grayscale`; brighter in light, darker and higher-contrast in dark), fading with the theme switch.
- **Back to top** (2026-10-14, revised): `src/components/ui/back-to-top.tsx`, in the root layout. A round arrow button at the bottom centre of the content area, shown only on pages taller than 2.5 screens and within 0.6 screens of the bottom. On click the button pops away (Motion) and GSAP scrolls the page to the top while wind streaks rush down the screen, then focus moves to `#content`. Reduced motion: an instant jump, no wind.

## Design source

Decided 2026-10-14: no Figma. The site is designed in code, and `src/app/globals.css` is the only source of truth for tokens. The old Figma file (green palette, single-page layout) is abandoned and should not be used as a reference.

## Reference images

- `docs/design-reference/tech-keyboard.png`: inspiration for the 3D tech keyboard. Its dark starfield background does not apply.
