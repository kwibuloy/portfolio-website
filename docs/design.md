# Design and theme

## Direction

Revised 2026-10-13: monochrome. White base with gradients of gray and black, plus a dark mode. The look should be lively, not minimalistic: motion, gradients, and 3D carry it. The background is topographic contour lines mixed with soft gradient shapes, not a plain fill.

## Tokens in code

- `src/app/globals.css` is the source of truth. Tailwind 4 has no `tailwind.config`; theme tokens are CSS variables in the `@theme` block.
- Colours are defined on `:root` (light) and `[data-theme="dark"]`, then exposed to Tailwind as `--color-*`.
- Theme and sound state are `data-theme` / `data-sound` attributes on `<html>`. An inline script in `src/app/layout.tsx` sets them before first paint, and the `dark:` and `sound-on:` variants style against them. The logic is in `src/lib/preferences.ts`.
- The contour lines are `public/contours.svg`, a tiling SVG applied as a CSS mask by the `.contour-lines` class, so the line colour is the `--contour` token.

## Figma

- File: https://www.figma.com/design/BNWVMI9cUxgIGxTH6xEMsB
- **Figma is out of date.** The shell and pages were coded without Figma on 2026-10-13, because the Figma MCP tool-call limit on the Starter plan blocked design work. Figma still holds the earlier green palette and the older single-page layout with a top nav. Do not run `/sync-tokens` until the Figma tokens are updated to match the code, or the green palette comes back.
- The Figma plan allows one mode per variable collection, so light and dark are two collections with identical variable names: `Tokens` (light, plus spacing and radius) and `Tokens Dark` (colours only). A colour change must be made in both.
- Frames: `Home / Desktop 1440` (light) and `Home / Desktop 1440 / Dark`. The background is the `Background` layer in each frame: the `Background / Contours` tile component (1440×1310, repeats vertically) plus blurred `Glow` ellipses, coloured by `color/contour` and `color/glow`.
- Components in the file: Button, Keycap, Tag, Field, ProjectCard, ExperienceRow.

## Reference images

- `docs/design-reference/tech-keyboard.png`: inspiration for the 3D tech keyboard. Its dark starfield background does not apply.
