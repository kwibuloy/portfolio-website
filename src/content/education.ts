export type Education = {
  school: string;
  degree: string;
  period: string;
  /** Short line for the home page. */
  summary: string;
  gpa: { value: number; outOf: number };
  awards: string[];
  /** Photos from the award ceremonies, shown as prints on the education page. */
  photos: {
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  }[];
  coursework: string[];
  organizations: { name: string; role: string; period: string }[];
  /**
   * Start of the degree and expected graduation, as YYYY-MM, for the progress
   * bar. Only the years are confirmed; the months assume an August start and
   * a June graduation.
   */
  start: string;
  expectedGraduation: string;
};

// From the resume, with the organization dates corrected by Derick.
export const education: Education[] = [
  {
    school: "De La Salle University – Dasmariñas",
    degree: "BS Computer Science",
    period: "2024 – Present",
    summary:
      "GPA 4.00 / 4.00. Dean's Lister and Top 1 Overall General Population Academic Scholar.",
    gpa: { value: 4, outOf: 4 },
    awards: [
      "Dean's Lister, SY 2024–2026",
      "Top 1 Overall General Population Academic Scholar",
    ],
    photos: [
      {
        src: "/education/deans-list.jpg",
        alt: "Derick on stage wearing a Dean's List medal on a green ribbon.",
        caption: "Dean's List awarding",
        width: 400,
        height: 500,
      },
      {
        src: "/education/academic-scholar.jpg",
        alt: "Derick holding a certificate in front of a slide that reads: Derick Conrad Dela Cruz Mercado, Top 1, BCS23, Top 1–5 General Population.",
        caption: "Academic scholarship awarding",
        width: 633,
        height: 791,
      },
    ],
    coursework: [
      "Software Engineering",
      "Data Structures and Algorithms",
      "Database Systems",
      "Artificial Intelligence",
      "Machine Learning",
      "Natural Language Processing",
      "Operating Systems",
      "Statistics",
      "Discrete Mathematics",
    ],
    organizations: [
      {
        name: "Computer Science Program Council",
        role: "Campaign Committee",
        period: "2025 – Present",
      },
      {
        name: "College of Information and Computer Studies Student Government",
        role: "Production and Operations Committee",
        period: "2025 – May 2026",
      },
    ],
    start: "2024-08",
    expectedGraduation: "2028-06",
  },
];
