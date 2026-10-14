export type Project = {
  slug: string;
  title: string;
  year: string;
  /** Where the project comes from, for example "Academic project". */
  kind: string;
  /** Short line for the home page. */
  summary: string;
  /** Full description for the projects page. */
  description: string;
  /** What I did on it. */
  role: string;
  /** Notable things I built or solved, listed on the projects page. */
  highlights: string[];
  tags: string[];
  links: { label: string; href: string }[];
};

// Written from each project's own README and docs. The figures quoted are the
// ones recorded there.
export const projects: Project[] = [
  {
    slug: "mediqueue",
    title: "MediQueue",
    year: "2026",
    kind: "Academic project",
    summary:
      "A hospital queue management platform: patients see their place in line live, and staff run the queue from one screen.",
    description:
      "MediQueue replaces the crowded waiting room with a tracked queue. Patients follow their position in real time, and medical staff call, serve, skip, or cancel patients from a single session view. It is a React front end on an Express and TypeScript API, with PostgreSQL holding the queue and Supabase handling sign-in.",
    role: "Lead developer",
    highlights: [
      "Modelled the queue as a six-state machine (waiting, called, in consultation, served, cancelled, skipped) with atomic SQL transitions, written as raw SQL instead of an ORM so each update stays easy to reason about.",
      "Cut average API latency by 52%, from 389 ms to 185 ms, with a first-in-first-out queue engine on PostgreSQL using connection pooling, sustaining 43.6 requests per second with no failures across 200 load-test requests.",
      "Added role-based access control in two layers: Supabase validates the JWT, and the role itself comes from my own PostgreSQL table, with admin-only mutations and automatic logout.",
      "Delivered queue position updates in under 10 seconds using polling with change detection instead of WebSockets, which was simpler to deploy and still met the requirement.",
      "Made the whole stack deployable with one command: Docker multi-stage builds, and Kubernetes with health probes, resource limits, and rolling updates across two replicas per service.",
    ],
    tags: [
      "React",
      "TypeScript",
      "Express",
      "PostgreSQL",
      "Supabase",
      "Docker",
      "Kubernetes",
    ],
    // The repository is private, so it is not linked.
    links: [],
  },
  {
    slug: "sd-185",
    title: "SD-185: Subscription Finance Analytics",
    year: "2026",
    kind: "Internship project · Eskwelabs",
    summary:
      "A synthetic SaaS subscription dataset and a churn-impact analysis that answers who churns and what it costs.",
    description:
      "SD-185 is a synthetic subscription-finance dataset built for practising churn-impact analysis the way a SaaS finance or revenue operations analyst would. A seeded simulation generates 4,000 customers over 36 months across seven related tables, and a separate notebook plays the analyst: it answers the brief from the exported CSVs alone. All of the data is synthetic and describes a simulated company.",
    role: "Data analyst intern",
    highlights: [
      "Built a deterministic generator (NumPy and pandas, fixed seed) that produces seven linked tables, from customers and subscriptions to invoices, payments, and recognised revenue, with the financial tables derived from subscription state so they always reconcile.",
      "Wrote validation checks into the generator: keys and foreign keys, no overlapping subscription periods, MRR and invoice reconciliation, and no leakage of the current month into the churn signal.",
      "Analysed churn by customer type, plan, billing model, and tenure, with cohort retention curves, an MRR waterfall, and 12-month gross and net revenue retention.",
      "Trained a logistic regression on observable signals and ranked accounts by expected MRR at risk (churn probability times MRR), reporting ROC-AUC, PR-AUC, and lift.",
      "Planted a hidden customer-health factor in the generator and showed how much it biases a regression that cannot see it, with an answer key comparing recovered effects to the true ones.",
      "Made it reproducible: a fresh environment regenerated all seven CSVs byte for byte, and a final notebook cell recomputes every number in the summary and stops if any differ.",
    ],
    tags: ["Python", "pandas", "NumPy", "scikit-learn", "statsmodels"],
    links: [],
  },
  {
    slug: "procureguard",
    title: "ProcureGuard",
    year: "2026",
    kind: "Academic project",
    summary:
      "A decision-support prototype that ranks public works contracts by how unusual they look, for a human to review.",
    description:
      "ProcureGuard scores civil-works procurement records and surfaces the ones worth a closer look. It computes three red-flag features per contract, runs an Isolation Forest over them, and shows the ranked results in a React dashboard with an explanation for each score. It is not a fraud detector: a flag means an unusual pattern for human review. The prototype runs on synthetic data.",
    role: "AI/ML Engineer and Main Developer",
    highlights: [
      "Defined three red-flag features with explicit rules for missing and invalid data: single bidder, how concentrated an agency's awards are in one supplier, and price deviation from the median of comparable contracts.",
      "Scored contracts with an Isolation Forest and flagged those at or above the 85th percentile of the training scores.",
      "Explained every score with exact Shapley values over the three features, so a reviewer sees what drove a contract's ranking.",
      "Served the scores through an Express API backed by PostgreSQL, with a JSON mode so the dashboard runs without a database.",
      "Tested each layer: pytest for the ML pipeline, and unit tests for the API and the React dashboard.",
      "Kept the table and field names stable in a written data contract, so real procurement data can be loaded later without changing the model or the API.",
    ],
    tags: [
      "Python",
      "scikit-learn",
      "pandas",
      "React",
      "Express",
      "PostgreSQL",
      "Docker",
    ],
    links: [],
  },
  {
    slug: "logibot",
    title: "LogiBot",
    year: "2025",
    kind: "Academic project",
    summary:
      "A medical triage simulator: click a region on a 3D body, describe the symptoms, and a logic engine narrows down the cause.",
    description:
      "LogiBot was built to show discrete mathematics doing practical work. Users click regions of an interactive 3D human model and answer follow-up questions, and a hand-written engine built on graph theory, set theory, and Boolean logic maps the symptoms to a preliminary result. There is no machine learning and no language model in it, so the same symptoms always give the same answer. It is a simulator for coursework, not medical advice.",
    role: "Developer",
    highlights: [
      "Modelled the diagnostic engine as a directed graph: nodes are body regions and conditions, and edges carry symptoms from one to another, which lets it detect referred pain.",
      "Tracked multi-turn conversations with sets: each answer is unioned into the user's symptom set, which is then compared against each condition's mandatory and optional symptoms to rank results. It can identify a condition in as few as two turns.",
      "Measured an average response time of 1.93 ms and 789.5 requests per second with no failures, across 700 requests from 50 concurrent users.",
      "Built the 3D interface with Three.js and GSAP in plain JavaScript, with no front-end framework on top of the canvas.",
    ],
    tags: ["Three.js", "GSAP", "JavaScript", "Node.js", "Express", "Vite"],
    links: [{ label: "GitHub", href: "https://github.com/kwibuloy/logibot" }],
  },
];
