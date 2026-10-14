export type Service = {
  id: string;
  title: string;
  /** Short line for the order ticket on the home page. */
  summary: string;
  /** Full description for the services page. */
  description: string;
  /** Concrete deliverables, listed under "What you get". */
  deliverables: string[];
  /** Work on this site that shows the service. Empty while there is none yet. */
  proof: { label: string; href: string }[];
};

export const services: Service[] = [
  {
    id: "web-apps",
    title: "Full-stack web apps",
    summary: "From the database to the deployed interface.",
    description:
      "I build web apps end to end: the database schema, an API with sign-in and roles, a fast React front end, and a deployment you can run with one command.",
    deliverables: [
      "A working app, deployed or ready to deploy",
      "Source code in your repository",
      "Database schema and API documentation",
      "Docker setup so it runs the same everywhere",
    ],
    proof: [{ label: "MediQueue", href: "/projects#mediqueue" }],
  },
  {
    id: "ml-ai",
    title: "ML and AI features",
    summary: "Scoring, prediction, and anomaly detection you can explain.",
    description:
      "I add machine learning to products and workflows: models that score, predict, or flag what looks unusual, served through an API, with explanations so people can trust the result.",
    deliverables: [
      "A trained model and the pipeline that rebuilds it",
      "An API endpoint your app can call",
      "An explanation for each prediction",
      "Tests and a short write-up of how it performs",
    ],
    proof: [
      { label: "ProcureGuard", href: "/projects#procureguard" },
      { label: "ML internships", href: "/experience" },
    ],
  },
  {
    id: "data",
    title: "Data analysis & pipelines",
    summary: "Collect, clean, and analyse data, then explain what it means.",
    description:
      "I collect data (including scraping it from the web), clean and validate it, analyse it, and turn the result into answers you can act on.",
    deliverables: [
      "Scrapers or pipelines that collect the data",
      "Validated, cleaned datasets",
      "Reproducible notebooks",
      "A readout or dashboard with the findings",
    ],
    proof: [
      { label: "SD-185", href: "/projects#sd-185" },
      { label: "EEI scraper", href: "/experience" },
    ],
  },
  {
    id: "interactive",
    title: "Interactive & 3D websites",
    summary: "Animated, 3D, and scroll-driven sites people remember.",
    description:
      "I build websites that move: scroll-driven animation, interactive 3D, and small details that make a site feel alive, while keeping it fast and accessible.",
    deliverables: [
      "A responsive, accessible site",
      "Animation and 3D that respect reduced-motion settings",
      "Good performance on phones",
      "Source code and deployment",
    ],
    proof: [
      { label: "LogiBot", href: "/projects#logibot" },
      { label: "This site", href: "/" },
    ],
  },
  {
    id: "automation",
    title: "Workflow automations",
    summary: "Take repetitive work off your plate.",
    description:
      "I automate the repetitive parts of your work: scripts and workflows that move data between tools, fill in reports, and run on a schedule so nobody has to do it by hand.",
    deliverables: [
      "A working automation for your workflow",
      "Setup and run instructions",
      "Error alerts so failures are noticed",
    ],
    // Nothing to show yet: this is a skill Derick is still developing.
    proof: [],
  },
];

/** How a project runs, shown on the services page. */
export const workSteps = [
  {
    title: "Discovery call",
    text: "We talk through what you need, your timeline, and how you like to work.",
  },
  {
    title: "Plan",
    text: "I send a written plan with the scope, milestones, and a quote: a fixed price or an hourly rate.",
  },
  {
    title: "Build",
    text: "I build in small steps and send an update every week, so you always know where things stand.",
  },
  {
    title: "Handover",
    text: "You get the code, the docs, and a walkthrough, and I stay available for questions.",
  },
];

/** Answers from Derick on 2026-10-14. */
export const faq = [
  {
    question: "How much time can you give my project?",
    answer: "At least 20 hours a week.",
  },
  {
    question: "What timezone do you work in?",
    answer:
      "Philippine time (GMT+8). I'm working from 5 AM until about midnight, which overlaps with business hours in Asia, Australia, and Europe, and with mornings on the US East Coast.",
  },
  {
    question: "How quickly do you reply?",
    answer: "Within 24 hours.",
  },
  {
    question: "Do you charge a fixed price or by the hour?",
    answer:
      "Either. Fixed prices suit projects with a clear scope; hourly suits ongoing or open-ended work. We pick what fits after the discovery call.",
  },
  {
    question: "How do we stay in touch?",
    answer:
      "By email, Discord, or Messenger, whichever you prefer, with a written update every week.",
  },
];

/** The reply time printed on the order ticket. */
export const replyTime = "< 24h";
