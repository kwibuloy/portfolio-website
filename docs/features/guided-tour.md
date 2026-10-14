# Guided tour

Decided 2026-10-14. A cursor with a chat bubble that tours the home page, written as Derick showing a visitor around.

- **When**: on a visitor's first visit to `/`, 1.5 s after load. Remembered with `localStorage` (`tour-seen`, set when it starts). "Take the tour" in the sidebar replays it, going to `/` first if needed. Leaving `/` ends it.
- **Steps** (`src/content/tour.ts`): greeting at the portrait, each social link in the intro, each sidebar nav link, then "Ask anything". Casual first person. Targets are found by `data-tour="…"` attributes; the visible copy is used, since the sidebar is rendered twice.
- **Pace**: plays through on its own (typed text, then a pause to read). Escape ends it. Below `lg` there is a "Skip tour" button, and the tour opens the mobile drawer (non-modal, via the `tour:drawer` window event) for the nav steps and closes it at the end.
- **Animation**: GSAP glides the pointer, with different x and y eases so the path bends like a hand moving a mouse. Motion pops the bubble in and out, and the bubble is clamped inside the viewport. No box or outline is drawn on the target; instead its own hover animations play. The target gets `data-tour-active`, which the `hover:` variant in `globals.css` also matches (so `hover:` and `group-hover:` classes apply), and the tour sends `pointerout`/`pointerover` so React-driven hovers (the nav's sliding pill) follow. The pointer stays still on each target; a single `pointermove` where it rests lets the portrait's layers settle toward it.
- **Accessibility**: the full line of each step goes to an `aria-live` region; the pointer and bubble are `aria-hidden`. Focus is never trapped. Reduced motion: the pointer jumps and text appears at once.
- **Code**: `src/components/ui/tour/guided-tour.tsx` (mounted in the root layout), shared names in `src/lib/tour.ts`.
