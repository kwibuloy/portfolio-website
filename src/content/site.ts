export type NavItem = {
  href: string;
  label: string;
  /** One line shown under the heading on the home page and the full page. */
  blurb: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export const site = {
  name: "Derick Conrad D. Mercado",
  initials: "DM",
  // Path of the portrait photo in /public (for example "/portrait.jpg").
  portrait: "/portrait.jpg",
  /** The resume offered for download in the hero, in /public. */
  resume: "/Derick-Mercado-Resume.pdf",
  role: "Fullstack Software Developer and AI/ML Engineer",
  /** GitHub username, used for the profile link and the contribution graph. */
  github: "kwibuloy",
  /** The hero introduction. The name and role are shown above it, so it does not repeat them. */
  intro:
    "I build full-stack web apps with AI and machine learning inside them, from the database and API to an interface that feels fast and polished. I can take a product from idea to deployment, add machine learning to one you already have, or turn raw data into analysis you can act on. I'm a third-year Computer Science student at De La Salle University - Dasmariñas, specializing in Intelligent Systems.",
  /** Search results and link previews. Kept under about 160 characters. */
  description:
    "Fullstack developer and AI/ML engineer building web apps with machine learning inside them. Computer Science student at De La Salle University - Dasmariñas.",
};

export const socials: SocialLink[] = [
  { label: "GitHub", href: `https://github.com/${site.github}` },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/derick-conrad-mercado-313086410",
  },
  { label: "Discord", href: "https://discord.com/users/513586414529544196" },
  // m.me opens a Messenger chat directly instead of the Facebook profile.
  { label: "Messenger", href: "https://m.me/derickcmercado14" },
  { label: "Instagram", href: "https://www.instagram.com/dzderick" },
];

export const nav: NavItem[] = [
  {
    href: "/education",
    label: "Education",
    blurb: "Where I studied and what I focused on.",
  },
  {
    href: "/experience",
    label: "Experience",
    blurb: "Roles I've held and what I shipped in them.",
  },
  {
    href: "/tech-stack",
    label: "Tech Stack",
    blurb: "The tools I build with, and how I've used each one.",
  },
  {
    href: "/projects",
    label: "Projects",
    blurb: "Selected work, from idea to shipped.",
  },
  {
    href: "/certifications",
    label: "Certifications",
    blurb: "Courses and credentials I've completed.",
  },
  {
    href: "/services",
    label: "Services",
    blurb: "What I can help you build.",
  },
];

export function navItem(href: string): NavItem {
  const item = nav.find((entry) => entry.href === href);
  if (!item) throw new Error(`No nav item for ${href}`);
  return item;
}
