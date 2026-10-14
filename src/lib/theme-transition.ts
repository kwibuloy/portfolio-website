import { toggleTheme } from "./preferences";

// Theme switch animation: the new theme grows out of the toggle as a circle
// until it covers the screen.
//
// It uses the View Transitions API: the browser snapshots the page in the old
// theme, the theme switches underneath, and the new page is revealed through a
// circular clip that starts at the button. Nothing is redrawn by hand, so the
// old and new pages line up exactly.
// Visitors who prefer reduced motion, or whose browser has no View
// Transitions, get an instant switch.

const DURATION = 600;

/**
 * Switches to `theme` (or to the other theme when none is given), growing
 * the new theme out of `origin`. Does nothing if that theme is already on.
 */
export function switchTheme(origin?: HTMLElement, theme?: "light" | "dark") {
  if (theme && document.documentElement.dataset.theme === theme) return;
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    toggleTheme();
    return;
  }

  // The circle starts at the middle of the button (or of the screen) and
  // ends just large enough to reach the furthest corner.
  const box = origin?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth / 2;
  const y = box ? box.top + box.height / 2 : window.innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(toggleTheme);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: DURATION,
          easing: "linear",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      // Skipped (for example, the tab was hidden): the theme has still
      // switched, just without the animation.
    });
}
