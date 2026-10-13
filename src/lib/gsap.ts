import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once here; import gsap and useGSAP from this file.
gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, useGSAP };
