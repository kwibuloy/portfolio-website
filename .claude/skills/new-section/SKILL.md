---
name: new-section
description: Plan and build a new section or page of the portfolio (hero, about, projects, tech keyboard, experience, contact, and so on) following the project's plan-first workflow. Use when the user asks to add, build, or start a section or page.
argument-hint: "[section name] [optional Figma link]"
---

# Build a new section

Section requested: $ARGUMENTS

Follow these steps in order. Do not write component code before the plan in step 2 is approved.

## 1. Gather what exists

- Read `CLAUDE.md` and look at the existing sections in `src/components/sections/` so the new one matches them.
- If a Figma link was given (or a frame for this section exists in the project's Figma file), read it. If there is no design for this section yet, say so and ask whether to design it in Figma first, which is the project default, or to build without one.
- Check what content the section needs and whether it already exists in `src/content/`.

## 2. Present a short plan and wait for approval

Keep it to what the user needs in order to decide:

- **What it shows**: the content and its source file.
- **Structure**: the components to create, which are server components and which are client components, and what is reused.
- **Motion**: what animates, on what trigger, and with which library (GSAP for scroll and timelines, Motion for UI transitions, R3F for 3D). Include the reduced-motion behaviour.
- **Responsive behaviour**: how the layout changes on mobile.
- **Open questions**: anything only the user can decide.

Explain the reasoning behind any choice that is not obvious; the user is learning parts of this stack.

## 3. Build

- Static and accessible first: semantic HTML, real content from `src/content/`, tokens from the theme, responsive from 375px upward.
- Then add motion. For anything beyond a simple reveal, hand the animation or 3D work to the `motion-3d` agent. For implementing from a Figma frame, use the `figma-builder` agent.
- Add the section to the page and to the navigation if it should be linked.

## 4. Verify

- Run the dev server and check the section in a browser at mobile and desktop widths. Say plainly if you could not check it visually.
- Tab through it with the keyboard and confirm that every interaction works without a mouse.
- Confirm that the reduced-motion version shows all the content.

## 5. Report

Summarise what was built, why the notable decisions were made, and what is left (missing content, design questions, follow-ups).
