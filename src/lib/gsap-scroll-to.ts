import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { gsap } from "@/lib/gsap";

// gsap with ScrollToPlugin registered. Only the back-to-top button uses it,
// and it imports this file on demand, so it ships to no page up front.
gsap.registerPlugin(ScrollToPlugin);

export { gsap };
