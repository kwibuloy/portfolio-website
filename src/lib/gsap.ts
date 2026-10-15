import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Register plugins once here; import gsap and useGSAP from this file.
// Plugins only some pages need are registered in their own files, so they do
// not ship to every page: ScrollTrigger in gsap-scroll.ts, ScrollToPlugin in
// gsap-scroll-to.ts.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
