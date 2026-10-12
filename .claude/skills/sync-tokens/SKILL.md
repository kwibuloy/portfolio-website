---
name: sync-tokens
description: Pull design tokens (colours, typography, spacing, radii) from the portfolio's Figma file into the Tailwind theme so code and design stay in step. Use after the design changes in Figma, when setting up the theme for the first time, or when the user says the site's colours or type no longer match the design.
argument-hint: "[Figma file or frame link]"
---

# Sync design tokens from Figma

Figma source: $ARGUMENTS

If no link was given, use the Figma file recorded in `CLAUDE.md`. If none is recorded there either, ask the user for it and then add it to `CLAUDE.md`.

## Steps

1. **Read the Figma variables.** Use the Figma MCP tool `get_variable_defs` on the file or frame to list its variables and styles: colours, font families, sizes and weights, spacing, and radii. Load the `figma:figma-design-to-code` skill first if you also need `get_design_context`.

2. **Read the current theme.** Tokens live in the Tailwind theme in the global stylesheet (with Tailwind v4, the `@theme` block in `src/app/globals.css`). Check the installed Tailwind version in `package.json` and follow that version's way of defining tokens. Fonts are loaded with `next/font` in the root layout.

3. **Show the differences before changing anything.** Present a table with the token name, the current value in code, and the value in Figma, grouped into new, changed, and present in code but missing from Figma. Wait for the user to approve it.

4. **Apply the approved changes.**
   - Name tokens by role (`--color-surface`, `--color-accent`, `--color-text-muted`) rather than by appearance (`--color-blue-500`), so a redesign does not require renaming them everywhere.
   - If the design has light and dark modes, define both.
   - Do not delete a token that code still uses. Search for usages first and report them.

5. **Check the fallout.** Search the codebase for hardcoded hex colours and arbitrary pixel values (`text-[#...]`, `p-[13px]`) that should now use a token, and list them. Fix them only if the user asks.

6. **Check contrast.** For each text and background token pair, confirm it meets WCAG AA (4.5:1 for body text, 3:1 for large text). Report any failing pair so it can be fixed in Figma, which is the source of truth.

## Report

List the tokens added, changed, and left alone, the hardcoded values found, and any contrast failures.
