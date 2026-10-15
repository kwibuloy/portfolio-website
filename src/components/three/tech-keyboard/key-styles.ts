import {
  siBlender,
  siClaudecode,
  siCss,
  siCursor,
  siDocker,
  siExpress,
  siFigma,
  siGit,
  siGithub,
  siGooglecolab,
  siGsap,
  siHtml5,
  siJavascript,
  siKubernetes,
  siNextdotjs,
  siNodedotjs,
  siNpm,
  siNumpy,
  siPandas,
  siPostgresql,
  siPython,
  siReact,
  siScikitlearn,
  siSupabase,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVite,
} from "simple-icons";

export type KeyStyle = {
  /** Keycap colour: the technology's brand colour. */
  color: string;
  /** SVG path of the logo. Without one, the key shows its text label. */
  path?: string;
  /** Size of the square grid the path is drawn on. Simple Icons use 24. */
  viewBox?: number;
  /** Set when the path relies on the even-odd fill rule for its cut-outs. */
  evenOdd?: boolean;
};

const brand = (icon: { hex: string; path: string }): KeyStyle => ({
  color: `#${icon.hex}`,
  path: icon.path,
});

/** Keyed by technology id from src/content/technologies.ts. */
export const keyStyles: Record<string, KeyStyle> = {
  javascript: brand(siJavascript),
  typescript: brand(siTypescript),
  python: brand(siPython),
  html: brand(siHtml5),
  css: brand(siCss),
  react: brand(siReact),
  nextjs: brand(siNextdotjs),
  vite: brand(siVite),
  tailwind: brand(siTailwindcss),
  threejs: brand(siThreedotjs),
  gsap: brand(siGsap),
  nodejs: brand(siNodedotjs),
  express: brand(siExpress),
  postgresql: brand(siPostgresql),
  supabase: brand(siSupabase),
  docker: brand(siDocker),
  kubernetes: brand(siKubernetes),
  numpy: brand(siNumpy),
  pandas: brand(siPandas),
  scikitlearn: brand(siScikitlearn),
  git: brand(siGit),
  github: brand(siGithub),
  cursor: brand(siCursor),
  claudecode: brand(siClaudecode),
  figma: brand(siFigma),
  colab: brand(siGooglecolab),
  blender: brand(siBlender),
  npm: brand(siNpm),
  // Simple Icons has no logo for these two, so their shapes come from the
  // Devicon set (MIT licence), which draws on a 128×128 grid.
  vscode: {
    color: "#007ACC",
    viewBox: 128,
    evenOdd: true,
    path: "M90.767 127.126a7.97 7.97 0 0 0 6.35-.244l26.353-12.681a8 8 0 0 0 4.53-7.209V21.009a8 8 0 0 0-4.53-7.21L97.117 1.12a7.97 7.97 0 0 0-9.093 1.548l-50.45 46.026L15.6 32.013a5.33 5.33 0 0 0-6.807.302l-7.048 6.411a5.335 5.335 0 0 0-.006 7.888L20.796 64L1.74 81.387a5.336 5.336 0 0 0 .006 7.887l7.048 6.411a5.33 5.33 0 0 0 6.807.303l21.974-16.68l50.45 46.025a8 8 0 0 0 2.743 1.793Zm5.252-92.183L57.74 64l38.28 29.058V34.943Z",
  },
  antigravity: {
    color: "#4285F4",
    viewBox: 128,
    path: "M116.005 120.281c7.147 5.36 17.867 1.787 8.043-8.043C94.56 83.658 100.82 5.044 64.197 5.044s-30.374 78.614-59.851 107.2c-10.72 10.716.89 13.393 8.037 8.033c27.691-18.758 25.904-51.808 51.814-51.808c25.904 0 24.117 33.05 51.808 51.813",
  },
};

/** Relative luminance of #111111, the dark ink. */
const DARK_INK_LUMINANCE = 0.0056;

/**
 * The colour that reads on top of a brand colour: whichever of near-black
 * and white has the higher WCAG contrast against it. Mid-tones such as
 * Docker blue or Figma orange get dark ink, which is the only one of the two
 * that passes 4.5:1 on them.
 */
export function inkFor(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const onDark = (luminance + 0.05) / (DARK_INK_LUMINANCE + 0.05);
  const onWhite = 1.05 / (luminance + 0.05);
  return onDark >= onWhite ? "#111111" : "#ffffff";
}

/** Used for a technology that has no entry above yet. */
export const fallbackKeyStyle: KeyStyle = { color: "#8A8A8A" };
