export type Certification = {
  title: string;
  issuer: string;
  date: string;
  /** Short line for the home page. */
  summary: string;
  /** What the certification covered, for the certifications page. */
  details: string;
  /** Link to the credential, when there is one. */
  href?: string;
};

// From the resume. The summary and details describe the course itself;
// replace them with what I took from it.
export const certifications: Certification[] = [
  {
    title: "CS50: Introduction to Computer Science",
    issuer: "Harvard University",
    date: "June 2025",
    summary:
      "Harvard's introduction to computer science and the art of programming.",
    details:
      "A broad foundation in computer science: algorithms, data structures, memory, and software design, worked through in C, Python, SQL, and web technologies.",
  },
];
