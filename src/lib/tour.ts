// Shared names for the guided tour (src/components/ui/tour/guided-tour.tsx),
// so the parts of the page it talks to agree on them.

/** localStorage key: set once the tour has played, so it plays only once. */
export const TOUR_SEEN_KEY = "tour-seen";

/** Window event that starts the tour again (the "Take the tour" button). */
export const TOUR_START_EVENT = "tour:start";

/** Window event the tour sends to open (detail true) or close the mobile
    drawer, so it can point at the nav on small screens. */
export const TOUR_DRAWER_EVENT = "tour:drawer";

export function startTour() {
  window.dispatchEvent(new Event(TOUR_START_EVENT));
}
