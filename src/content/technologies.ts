export type Technology = {
  /** Stable id. The 3D keyboard names each key mesh `key_<id>`. */
  id: string;
  name: string;
  /** Short label used where a logo is not available. */
  keyLabel: string;
  /**
   * "stack" keys sit on the main block of the keyboard; "tool" keys sit on the
   * numpad. scripts/blender/build_keyboard.py reads this to place each key.
   */
  group: "stack" | "tool";
  category:
    | "Language"
    | "Frontend"
    | "Motion and 3D"
    | "Backend"
    | "DevOps"
    | "Data"
    | "Tool";
  /** Shown when a key is hovered. */
  summary: string;
  /** Shown in the popup on the tech stack page. */
  details: string[];
};

// Written from the projects and experience in this folder.
export const technologies: Technology[] = [
  {
    id: "javascript",
    name: "JavaScript",
    keyLabel: "JS",
    group: "stack",
    category: "Language",
    summary:
      "The language behind most of my front ends and all of my Node.js back ends.",
    details: [
      "Wrote LogiBot's whole interface in plain JavaScript on top of Three.js, with no framework between my code and the 3D canvas.",
      "Built the React interfaces for MediQueue and ProcureGuard, and ProcureGuard's Express API, in JavaScript.",
      "Wrote LogiBot's triage engine as plain functions over graphs and sets: union, intersection, and subset checks decide the result.",
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    keyLabel: "TS",
    group: "stack",
    category: "Language",
    summary:
      "What I reach for when a codebase needs types to stay predictable.",
    details: [
      "Wrote MediQueue's Express API in TypeScript, with typed request handlers and database access.",
      "Built this portfolio in TypeScript end to end, with typed content files so a page cannot ask for a field that does not exist.",
    ],
  },
  {
    id: "python",
    name: "Python",
    keyLabel: "Py",
    group: "stack",
    category: "Language",
    summary:
      "My language for data work: generators, analysis, machine learning, and scraping.",
    details: [
      "Built SD-185 at Eskwelabs: a seeded generator for a seven-table subscription dataset, and a churn-impact analysis on top of it.",
      "Wrote ProcureGuard's ML pipeline: feature engineering, an Isolation Forest, and Shapley-value explanations, covered by pytest.",
      "Built a command-line web scraper as a freelance data engineer, with requests and BeautifulSoup4, that extracts contact details from a site in under 10 seconds.",
    ],
  },
  {
    id: "html",
    name: "HTML5",
    keyLabel: "HTML",
    group: "stack",
    category: "Language",
    summary:
      "Semantic markup first, so pages work for keyboards and screen readers before any styling.",
    details: [
      "Structured this portfolio with landmarks, headings in order, labelled controls, and native dialogs for the popups.",
      "Wrote LogiBot's single-page interface by hand around its 3D canvas.",
    ],
  },
  {
    id: "css",
    name: "CSS3",
    keyLabel: "CSS",
    group: "stack",
    category: "Language",
    summary:
      "Layout, theming, and animation in plain CSS when a library is not needed.",
    details: [
      "Styled MediQueue and LogiBot in hand-written CSS.",
      "Wrote this portfolio's light and dark themes as CSS variables, and effects such as the sidebar spotlight as pure CSS.",
    ],
  },
  {
    id: "react",
    name: "React",
    keyLabel: "Re",
    group: "stack",
    category: "Frontend",
    summary: "My main tool for building interfaces, across three projects.",
    details: [
      "Built MediQueue's patient and staff interfaces, with client-side polling that shows queue changes in under 10 seconds.",
      "Built ProcureGuard's dashboard: a ranked contract table, score chart, filters, and an explanation panel, tested with React Testing Library.",
      "Built this portfolio with React 19, keeping components on the server unless they need state or animation.",
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    keyLabel: "Nx",
    group: "stack",
    category: "Frontend",
    summary: "The framework this portfolio runs on.",
    details: [
      "Built this site on the App Router: server components by default, with client components only where there is interaction.",
      "Fetches my GitHub contributions on the server and caches them for a day, so the token never reaches the browser.",
      "Wrote route handlers for the contact form and visitor counter, with validation and rate limiting on the server.",
    ],
  },
  {
    id: "vite",
    name: "Vite",
    keyLabel: "Vi",
    group: "stack",
    category: "Frontend",
    summary: "My build tool for front ends that do not need a full framework.",
    details: [
      "Used it for MediQueue, LogiBot, and ProcureGuard.",
      "In ProcureGuard, the Vite dev server proxies API calls to the Express back end, and Vitest runs the dashboard tests.",
    ],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    keyLabel: "Tw",
    group: "stack",
    category: "Frontend",
    summary:
      "How this portfolio is styled, from design tokens to responsive layout.",
    details: [
      "Set up Tailwind 4 with the theme defined as CSS variables, so light and dark mode switch by changing the variables alone.",
      "Added custom variants for the theme and sound settings, so components style against them without any React state.",
    ],
  },
  {
    id: "threejs",
    name: "Three.js",
    keyLabel: "3D",
    group: "stack",
    category: "Motion and 3D",
    summary:
      "3D in the browser: an interactive human model in LogiBot, and the keyboard you are looking at.",
    details: [
      "Built LogiBot's interface around a 3D human model whose regions can be clicked to report symptoms.",
      "Built this keyboard: a Blender model loaded with React Three Fiber, coloured and labelled in code, with hover, click, rotate, and zoom.",
      "Kept it light: the scene renders only when something changes, and Three.js loads only on the pages that use it.",
    ],
  },
  {
    id: "gsap",
    name: "GSAP",
    keyLabel: "Gs",
    group: "stack",
    category: "Motion and 3D",
    summary: "Timelines and scroll-driven animation.",
    details: [
      "Animated LogiBot's interface and 3D model with GSAP.",
      "Used it here for the key presses on this keyboard and, with ScrollTrigger, for the timelines that draw as the page scrolls.",
      "Every animation has a reduced-motion path that shows the same content without movement.",
    ],
  },
  {
    id: "nodejs",
    name: "Node.js",
    keyLabel: "Nd",
    group: "stack",
    category: "Backend",
    summary: "The runtime for all three of my back ends.",
    details: [
      "LogiBot's server answers in 1.93 ms on average and held 789.5 requests per second with no failures in a 700-request load test.",
      "MediQueue's API sustained 43.6 requests per second at a 100% success rate across 200 load-test requests.",
      "Wrote load-test and benchmark scripts for both projects to get those numbers.",
    ],
  },
  {
    id: "express",
    name: "Express",
    keyLabel: "Ex",
    group: "stack",
    category: "Backend",
    summary: "My framework for REST APIs.",
    details: [
      "Built MediQueue's API in TypeScript: queue transitions, role-protected admin routes, and patient status endpoints.",
      "Built LogiBot's triage API with server-side session state for multi-turn conversations.",
      "Built ProcureGuard's API to serve scored contracts and their explanations, with a JSON mode that needs no database.",
    ],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    keyLabel: "Pg",
    group: "stack",
    category: "Backend",
    summary:
      "My database of choice, written with raw SQL where correctness matters.",
    details: [
      "Designed MediQueue's queue as a six-state machine with atomic transitions, using UPDATE ... RETURNING so two staff members cannot advance the same patient.",
      "Cut MediQueue's average API latency by 52%, from 389 ms to 185 ms, with a first-in-first-out queue engine and connection pooling.",
      "Stored user roles in my own table instead of relying on the auth provider, and set up ProcureGuard's contracts, features, and scores tables.",
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    keyLabel: "Sb",
    group: "stack",
    category: "Backend",
    summary: "Authentication and realtime updates for MediQueue.",
    details: [
      "Used Supabase Auth for sign-in and JWT validation, combined with a role lookup in my own PostgreSQL table.",
      "Used Supabase Realtime for the admin queue view, and invitation-gated onboarding for new admins.",
    ],
  },
  {
    id: "docker",
    name: "Docker",
    keyLabel: "Dk",
    group: "stack",
    category: "DevOps",
    summary: "Packaging applications so they run the same everywhere.",
    details: [
      "Containerised MediQueue's front end and back end with multi-stage builds, serving the built front end from Nginx.",
      "Used Docker Compose in ProcureGuard to run PostgreSQL locally with one command.",
    ],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    keyLabel: "K8s",
    group: "stack",
    category: "DevOps",
    summary: "Deploying MediQueue as a set of replicated services.",
    details: [
      "Wrote the manifests for MediQueue: deployments and services for the front end and back end, with health probes, resource limits, and rolling updates across two replicas each.",
      "Kept credentials in Kubernetes secrets and wrapped the whole deployment in a single PowerShell script.",
      "It targets a local cluster (kind or minikube); cloud ingress is the next step.",
    ],
  },
  {
    id: "numpy",
    name: "NumPy",
    keyLabel: "Np",
    group: "stack",
    category: "Data",
    summary: "Numerical work and seeded simulation.",
    details: [
      "Built SD-185's generator on NumPy's seeded random streams, so the same seed reproduces all seven tables byte for byte.",
      "Used it for the feature calculations in ProcureGuard's ML pipeline.",
    ],
  },
  {
    id: "pandas",
    name: "pandas",
    keyLabel: "Pd",
    group: "stack",
    category: "Data",
    summary: "My main tool for shaping and analysing tabular data.",
    details: [
      "Built SD-185's seven linked tables with pandas: 4,000 customers, about 64,000 invoices, and 82,000 monthly usage rows.",
      "Used it for the analysis itself: cohort retention curves, an MRR waterfall, and point-in-time features rebuilt without leakage.",
      "Computed ProcureGuard's red-flag features, including price deviation from the median of comparable contracts.",
    ],
  },
  {
    id: "scikitlearn",
    name: "scikit-learn",
    keyLabel: "Sk",
    group: "stack",
    category: "Data",
    summary:
      "Classical machine learning: one supervised project, one unsupervised.",
    details: [
      "Trained a logistic regression in SD-185 to predict churn from observable signals, evaluated with ROC-AUC, PR-AUC, and lift, and used it to rank accounts by expected revenue at risk.",
      "Used an Isolation Forest in ProcureGuard to score how unusual each contract is, flagging those at or above the 85th percentile.",
      "Used group-aware cross-validation in SD-185 so the same customer never appears in both training and test data.",
    ],
  },
  {
    id: "git",
    name: "Git",
    keyLabel: "Git",
    group: "tool",
    category: "Tool",
    summary: "Version control on every project.",
    details: [
      "Used for MediQueue, LogiBot, and this portfolio, with history kept in small commits.",
    ],
  },
  {
    id: "github",
    name: "GitHub",
    keyLabel: "GH",
    group: "tool",
    category: "Tool",
    summary: "Where my code lives.",
    details: [
      "Hosts MediQueue and LogiBot, each with a README covering the design decisions and benchmarks.",
      "This site reads my contribution graph from GitHub's GraphQL API.",
    ],
  },
  {
    id: "vscode",
    name: "VS Code",
    keyLabel: "VS",
    group: "tool",
    category: "Tool",
    summary: "My everyday editor.",
    details: [
      "Used across my projects for JavaScript, TypeScript, and Python.",
    ],
  },
  {
    id: "cursor",
    name: "Cursor",
    keyLabel: "Cur",
    group: "tool",
    category: "Tool",
    summary: "An AI-assisted editor I used on two projects.",
    details: ["Used while building MediQueue and ProcureGuard."],
  },
  {
    id: "claudecode",
    name: "Claude Code",
    keyLabel: "CC",
    group: "tool",
    category: "Tool",
    summary: "An AI coding agent I direct and review.",
    details: [
      "Built this portfolio with it, working plan-first: I decide the design and review each change.",
      "Set it up with project rules, automatic formatting and lint checks, and review agents.",
    ],
  },
  {
    id: "figma",
    name: "Figma",
    keyLabel: "Fg",
    group: "tool",
    category: "Tool",
    summary: "Where I work out design tokens and layouts.",
    details: [
      "Started this portfolio's design there: colour, spacing, and type tokens, and the first page layout.",
    ],
  },
  {
    id: "colab",
    name: "Google Colab",
    keyLabel: "Co",
    group: "tool",
    category: "Tool",
    summary: "Where I write notebooks for data analysis.",
    details: [
      "Built my data analytics notebooks at Eskwelabs in Colab, including the SD-185 subscription churn analysis.",
    ],
  },
  {
    id: "blender",
    name: "Blender",
    keyLabel: "Bl",
    group: "tool",
    category: "Tool",
    summary: "3D modelling, driven by script.",
    details: [
      "The keyboard on this page is a Blender model generated by a Python script that reads my technology list, so adding a technology rebuilds the model with a new key.",
    ],
  },
  {
    id: "npm",
    name: "npm",
    keyLabel: "npm",
    group: "tool",
    category: "Tool",
    summary: "Package management for every JavaScript project.",
    details: [
      "Used across MediQueue, LogiBot, ProcureGuard, and this portfolio.",
    ],
  },
  {
    id: "antigravity",
    name: "Antigravity",
    keyLabel: "AG",
    group: "tool",
    category: "Tool",
    summary: "An AI-assisted editor, used the same way as Cursor.",
    details: [
      "Used alongside Cursor as an AI-assisted editor for writing and refactoring code.",
    ],
  },
];

export const stack = technologies.filter((tech) => tech.group === "stack");
export const tools = technologies.filter((tech) => tech.group === "tool");
