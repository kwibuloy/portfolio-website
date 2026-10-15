import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/lib/gsap";

// gsap with ScrollTrigger registered, for scroll scenes. Import from here
// instead of lib/gsap.ts when a component uses scrollTrigger.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };
