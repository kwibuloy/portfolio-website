"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TOUR_START_EVENT } from "@/lib/tour";

// The tour brings GSAP with it. Only the home page uses GSAP otherwise, so
// the tour is loaded only there, or when "Take the tour" is pressed.
// The tour sits in the root layout, outside app/error.tsx, so a failed
// download (a tab left open across a redeploy, a dropped connection) must
// not throw: it just means no tour.
const GuidedTour = dynamic(
  () =>
    import("@/components/ui/tour/guided-tour")
      .then((m) => m.GuidedTour)
      .catch(() => () => null),
  { ssr: false },
);

/**
 * Mounts the guided tour on the home page, and handles "Take the tour" from
 * any page: it loads the tour and goes home, where the tour picks up the
 * request (see takeTourRequest in lib/tour.ts).
 */
export function TourLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const onStart = () => {
      setRequested(true);
      if (window.location.pathname !== "/") router.push("/");
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [router]);

  return pathname === "/" || requested ? <GuidedTour /> : null;
}
