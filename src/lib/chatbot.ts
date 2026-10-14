import { certifications } from "@/content/certifications";
import { education } from "@/content/education";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { faq, replyTime, services } from "@/content/services";
import { site } from "@/content/site";
import { stack, technologies, tools } from "@/content/technologies";

/**
 * The "Ask anything" chatbot. It is not a language model: it is a lookup
 * over the site's own content files. Each topic lists the words that point
 * to it, a question is scored against every topic, and the best match
 * answers. Nothing leaves the browser and it costs nothing to run.
 *
 * Because the answers are built from src/content, updating a content file
 * updates the chatbot too.
 */

export type Reply = {
  text: string;
  links?: { label: string; href: string }[];
};

type Topic = {
  /** Words or phrases that point to this topic. */
  keywords: string[];
  /** How much one matching keyword counts. Specific topics outrank general ones. */
  weight: number;
  reply: Reply;
};

export const SUGGESTIONS = [
  "Who is Derick?",
  "What projects has he built?",
  "Where does he work now?",
  "What is his tech stack?",
  "How can I contact him?",
];

const firstName = site.name.split(" ")[0];
const degree = education[0];
const bullets = (lines: string[]) =>
  lines.map((line) => `• ${line}`).join("\n");
const current = experience.filter((item) => item.period.includes("Present"));

const general: Topic[] = [
  {
    keywords: ["hi", "hello", "hey", "yo", "good morning", "good evening"],
    weight: 1,
    reply: {
      text: `Hi! I answer questions about ${firstName} from what is on this site: his projects, experience, education, and tech stack. What would you like to know?`,
    },
  },
  {
    keywords: ["thanks", "thank you", "thx", "salamat"],
    weight: 1,
    reply: { text: "You're welcome. Ask me anything else about him." },
  },
  {
    keywords: ["help", "what can you do", "what can i ask", "who are you"],
    weight: 1.5,
    reply: {
      text: `I'm a small program that looks up answers in this site's content. I'm not an AI model, so I only know what ${firstName} has written here. Ask about his projects, a company he worked at, a technology, his education, or how to reach him.`,
    },
  },
  {
    keywords: [
      "who",
      "about",
      "derick",
      "mercado",
      "yourself",
      "introduce",
      "background",
      "summary",
    ],
    weight: 1,
    reply: {
      text: `${site.name} is a ${degree.degree} student at ${degree.school} with a GPA of ${degree.gpa.value.toFixed(2)}. He currently holds ${current.length} roles: ${current.map((item) => `${item.role} at ${item.company}`).join(", ")}. He has built ${projects.length} projects shown here, across web development, data analysis, and machine learning.`,
    },
  },
  {
    keywords: [
      "education",
      "school",
      "study",
      "studies",
      "studying",
      "university",
      "college",
      "degree",
      "course",
      "coursework",
      "subject",
      "graduate",
      "graduation",
      "student",
    ],
    weight: 1.5,
    reply: {
      text: `He is taking ${degree.degree} at ${degree.school} (${degree.period}) and expects to graduate in ${degree.expectedGraduation.slice(0, 4)}.\n\nCoursework: ${degree.coursework.join(", ")}.`,
      links: [{ label: "Education page", href: "/education" }],
    },
  },
  {
    keywords: [
      "gpa",
      "grade",
      "grades",
      "award",
      "awards",
      "honor",
      "honors",
      "dean",
      "scholar",
      "scholarship",
      "achievement",
    ],
    weight: 2,
    reply: {
      text: `His GPA is ${degree.gpa.value.toFixed(2)} out of ${degree.gpa.outOf.toFixed(2)}.\n\n${bullets(degree.awards)}`,
      links: [{ label: "Education page", href: "/education" }],
    },
  },
  {
    keywords: [
      "organisation",
      "organization",
      "org",
      "club",
      "council",
      "committee",
      "extracurricular",
    ],
    weight: 2,
    reply: {
      text: bullets(
        degree.organizations.map(
          (item) => `${item.name}: ${item.role} (${item.period})`,
        ),
      ),
    },
  },
  {
    keywords: [
      "experience",
      "work",
      "works",
      "working",
      "job",
      "jobs",
      "intern",
      "internship",
      "career",
      "company",
      "employer",
      "role",
      "position",
    ],
    weight: 1.5,
    reply: {
      text: bullets(
        experience.map(
          (item) => `${item.role}, ${item.company} (${item.period})`,
        ),
      ),
      links: [{ label: "Experience page", href: "/experience" }],
    },
  },
  {
    keywords: [
      "project",
      "projects",
      "built",
      "build",
      "made",
      "portfolio",
      "apps",
    ],
    weight: 1.5,
    reply: {
      text: bullets(
        projects.map((project) => `${project.title}: ${project.summary}`),
      ),
      links: [{ label: "Projects page", href: "/projects" }],
    },
  },
  {
    keywords: [
      "skill",
      "skills",
      "stack",
      "tech",
      "technology",
      "technologies",
      "language",
      "languages",
      "framework",
      "frameworks",
      "tools",
      "know",
    ],
    weight: 1.2,
    reply: {
      text: `Stack: ${stack.map((tech) => tech.name).join(", ")}.\n\nTools: ${tools.map((tech) => tech.name).join(", ")}.\n\nAsk about any one of them for the details.`,
      links: [{ label: "Tech stack page", href: "/tech-stack" }],
    },
  },
  {
    keywords: [
      "certificate",
      "certificates",
      "certification",
      "certifications",
      "certified",
      "cs50",
      "harvard",
    ],
    weight: 2,
    reply: {
      text: bullets(
        certifications.map(
          (item) => `${item.title}, ${item.issuer} (${item.date})`,
        ),
      ),
      links: [{ label: "Certifications page", href: "/certifications" }],
    },
  },
  {
    keywords: [
      "contact",
      "reach",
      "email",
      "mail",
      "message",
      "hire",
      "hiring",
      "talk",
      "connect",
      "linkedin",
    ],
    weight: 2,
    reply: {
      text: `The quickest way is the Contact button in the sidebar: it sends a message straight to his inbox. You can also find him on GitHub and LinkedIn.`,
      links: [
        { label: "GitHub", href: `https://github.com/${site.github}` },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/derick-conrad-mercado-313086410",
        },
      ],
    },
  },
  {
    keywords: [
      "service",
      "services",
      "freelance",
      "offer",
      "price",
      "pricing",
      "rate",
      "cost",
      "available",
      "availability",
      "timezone",
    ],
    weight: 2.5,
    reply: {
      text: `He takes on freelance and remote work:

${bullets(services.map((service) => `${service.title}: ${service.summary}`))}

He can give a project ${faq[0].answer.toLowerCase()} He replies in ${replyTime.replace("<", "under")}, and quotes either a fixed price or an hourly rate after a short call.`,
      links: [{ label: "Services page", href: "/services" }],
    },
  },
  {
    keywords: ["resume", "résumé", "cv", "curriculum"],
    weight: 2.5,
    reply: {
      text: "You can download his résumé as a PDF.",
      links: [{ label: "Download résumé", href: site.resume }],
    },
  },
  {
    keywords: [
      "github",
      "repo",
      "repos",
      "repository",
      "contributions",
      "code",
    ],
    weight: 1.8,
    reply: {
      text: `His GitHub username is ${site.github}. The home page shows his contribution graph for the last year, and the MediQueue and LogiBot case studies link to their repositories.`,
      links: [{ label: "GitHub", href: `https://github.com/${site.github}` }],
    },
  },
];

// One topic per role, found by company name or role title.
const roles: Topic[] = experience.map((item) => ({
  keywords: [
    item.company.toLowerCase(),
    ...item.company.toLowerCase().split(/\W+/).slice(0, 1),
    item.role.toLowerCase(),
  ],
  weight: 3,
  reply: {
    text:
      `${item.role} at ${item.company} (${item.type}, ${item.period}).\n\n${item.summary}` +
      (item.highlights.length ? `\n\n${bullets(item.highlights)}` : ""),
    links: [{ label: "Experience page", href: "/experience" }],
  },
}));

// One topic per project, found by its name.
const projectTopics: Topic[] = projects.map((project) => ({
  keywords: [
    project.slug,
    project.slug.replace(/-/g, ""),
    project.slug.replace(/-/g, " "),
    project.title.toLowerCase().split(":")[0],
  ],
  weight: 3,
  reply: {
    text: `${project.title} (${project.kind}, ${project.year}).\n\n${project.description}\n\nRole: ${project.role}. Built with ${project.tags.join(", ")}.`,
    links: [
      { label: "Read the case study", href: `/projects#${project.slug}` },
      ...project.links,
    ],
  },
}));

// Other names people use for a technology.
const aliases: Record<string, string[]> = {
  javascript: ["js"],
  typescript: ["ts"],
  html: ["html"],
  css: ["css"],
  nextjs: ["next", "next js"],
  tailwind: ["tailwind"],
  threejs: ["three", "three js", "3d", "webgl"],
  nodejs: ["node", "node js"],
  postgresql: ["postgres", "sql", "database"],
  kubernetes: ["k8s"],
  scikitlearn: ["sklearn", "scikit", "machine learning", "ml"],
  vscode: ["vscode", "visual studio code"],
  claudecode: ["claude"],
  colab: ["colab"],
};

// One topic per technology.
const techTopics: Topic[] = technologies.map((tech) => ({
  keywords: [tech.name.toLowerCase(), tech.id, ...(aliases[tech.id] ?? [])],
  weight: 2.6,
  reply: {
    // The technology notes are written in the first person, so quote them.
    text: `${tech.name}, in ${firstName}'s own words:\n\n"${tech.summary}"\n\n${bullets(tech.details)}`,
    links: [{ label: "Tech stack page", href: "/tech-stack" }],
  },
}));

const topics = [...general, ...roles, ...projectTopics, ...techTopics];

const fallback: Reply = {
  text: `I don't have an answer for that. I only know what ${firstName} has put on this site. Try asking about his projects, his experience, a technology he uses, his education, or how to contact him.`,
};

/** Lower-cases the question and keeps only letters, digits, and spaces. */
const normalise = (value: string) =>
  ` ${value
    .toLowerCase()
    .replace(/[^a-z0-9é+#. -]/g, " ")
    .replace(/[.?!,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

export function answer(question: string): Reply {
  const text = normalise(question);
  if (!text.trim()) return fallback;

  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of topics) {
    let score = 0;
    for (const keyword of topic.keywords) {
      // Whole words only, so "ts" does not match inside "projects". Longer
      // phrases count for more than single words.
      if (keyword && text.includes(` ${keyword} `)) {
        score += topic.weight * keyword.split(" ").length;
      }
    }
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best?.reply ?? fallback;
}
