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
  role: "Developer",
  /** GitHub username, used for the profile link and the contribution graph. */
  github: "kwibuloy",
  // Placeholder copy: replace with the real introduction.
  intro: [
    "I'm a developer who builds interactive, animated, and accessible web experiences.",
    "Placeholder introduction. A couple of sentences about what I'm working on now and the kind of work I enjoy will go here.",
  ],
};

// GitHub and LinkedIn are real. The other three are placeholder URLs:
// replace each with the real profile link.
export const socials: SocialLink[] = [
  { label: "GitHub", href: `https://github.com/${site.github}` },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/derick-mercado-313086410",
  },
  { label: "Discord", href: "https://discord.com/" },
  { label: "Messenger", href: "https://www.messenger.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
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
