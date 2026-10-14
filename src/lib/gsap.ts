import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once here; import gsap and useGSAP from this file.
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

export { gsap, useGSAP };
