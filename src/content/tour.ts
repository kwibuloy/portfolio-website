export type TourStep = {
  /** Matches a data-tour attribute on the element the pointer goes to. */
  target: string;
  /** What the chat bubble says there. */
  text: string;
  /** Said instead of `text` on touch screens, where there is no keyboard. */
  touchText?: string;
  /** "pointer" keeps the bubble right by the pointer instead of clearing the
      whole target; for big targets like the portrait. */
  bubbleAt?: "pointer";
};

/**
 * The guided tour that plays on a visitor's first visit to the home page:
 * a greeting, how to end the tour, then the social links in the intro, then
 * the sidebar.
 * Played by src/components/ui/tour/guided-tour.tsx.
 */
export const tour: TourStep[] = [
  {
    target: "portrait",
    bubbleAt: "pointer",
    text: "Hey, I'm Derick. Welcome in! Let me show you around real quick.",
  },
  {
    target: "tour-skip",
    text: "Rather explore on your own? Press Esc or hit Skip anytime. Scrolling or clicking anywhere ends the tour too.",
    touchText:
      "Rather explore on your own? Tap Skip anytime, or just start scrolling, and I'll get out of your way.",
  },
  {
    target: "social-github",
    text: "First up, my GitHub. This is where all my code lives.",
  },
  {
    target: "social-linkedin",
    text: "LinkedIn, if you want the more professional side of me.",
  },
  {
    target: "social-discord",
    text: "On Discord? Add me, I'm always down to chat.",
  },
  {
    target: "social-messenger",
    text: "Messenger works too. Just send me a message.",
  },
  {
    target: "social-instagram",
    text: "And Instagram, for life outside of code.",
  },
  {
    target: "nav-education",
    text: "Now over here, my academics and the things I've accomplished in school.",
  },
  {
    target: "nav-experience",
    text: "The places I've worked and what I built there.",
  },
  {
    target: "nav-tech-stack",
    text: "My tech stack. Go ahead and press some keys on the keyboard.",
  },
  {
    target: "nav-projects",
    text: "Things I've built. Honestly, my favourite part.",
  },
  {
    target: "nav-certifications",
    text: "Courses and certificates I've picked up along the way.",
  },
  {
    target: "nav-services",
    text: "And this is what I can build for you.",
  },
  {
    target: "ask",
    text: "Got a question? Ask me anything right here. Enjoy looking around!",
  },
];
