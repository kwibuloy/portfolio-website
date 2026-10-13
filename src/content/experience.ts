export type Experience = {
  role: string;
  company: string;
  /** For example "Internship · Remote". */
  type: string;
  period: string;
  /** Short line for the home page. */
  summary: string;
  /** Full details for the experience page. Leave empty until there are some. */
  highlights: string[];
};

// Roles and dates follow the LinkedIn profile, newest first.
export const experience: Experience[] = [
  {
    role: "Backend AI Engineer Intern",
    company: "FlyRank AI",
    type: "Internship · Remote",
    period: "Sep 2026 – Present",
    // Details to be added once there is project work to describe.
    summary: "Internship in progress. Details to follow.",
    highlights: [],
  },
  {
    role: "Machine Learning Engineer Intern",
    company: "Elevvo Pathways",
    type: "Internship · Remote",
    period: "Sep 2026 – Present",
    // Details to be added once there is project work to describe.
    summary: "Internship in progress. Details to follow.",
    highlights: [],
  },
  {
    role: "Data Analyst Intern",
    company: "Eskwelabs",
    type: "Internship · Remote",
    period: "Aug 2026 – Present",
    summary:
      "Built SD-185, a synthetic SaaS subscription dataset with a full churn-impact analysis on top of it.",
    highlights: [
      "Built a seeded generator for a subscription-finance dataset: 4,000 customers over 36 months across seven linked tables, with validation checks that make the financial tables reconcile.",
      "Analysed who churns and what it costs: cohort retention, an MRR waterfall, gross and net revenue retention, and collections.",
      "Ranked accounts by expected MRR at risk using a logistic regression on observable signals, and documented where a hidden factor biases the results.",
      "Delivered the work as two reproducible notebooks, an assumptions document, and a readout deck.",
    ],
  },
  {
    role: "Freelance Data Engineer",
    company: "EEI Creative International Pte. Ltd.",
    type: "Freelance · Singapore, remote",
    period: "Sep 2024 – Jan 2025",
    summary:
      "Built a Python web scraper that pulls contact details from any website in under 10 seconds.",
    highlights: [
      "Built a Python command-line scraper with requests and BeautifulSoup4 that extracts emails, phone numbers, addresses, and social profiles across seven platforms, with parsing done in under 1 ms per page.",
      "Increased the data yield four times by adding multi-page crawling that follows up to three contact-related sub-pages per site, and support for several URLs in one command.",
      "Reduced false positives by more than 90% with validation rules for malformed emails, invalid phone numbers, and irrelevant links, each data type handled in its own regex module.",
    ],
  },
];
