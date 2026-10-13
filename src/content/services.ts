export type Service = {
  title: string;
  /** Short line for the home page. */
  summary: string;
  /** What is included, for the services page. */
  includes: string[];
};

// Placeholder entries: replace with the services actually offered.
export const services: Service[] = [
  {
    title: "Web development",
    summary: "Placeholder: fast, accessible sites and web apps.",
    includes: [
      "Placeholder: what the engagement covers.",
      "Placeholder: what you receive at the end.",
    ],
  },
  {
    title: "Interactive and 3D experiences",
    summary: "Placeholder: motion, scroll scenes, and 3D on the web.",
    includes: [
      "Placeholder: what the engagement covers.",
      "Placeholder: what you receive at the end.",
    ],
  },
  {
    title: "Design to code",
    summary: "Placeholder: turning Figma designs into production UI.",
    includes: [
      "Placeholder: what the engagement covers.",
      "Placeholder: what you receive at the end.",
    ],
  },
];
