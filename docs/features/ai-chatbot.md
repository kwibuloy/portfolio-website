# Chatbot ("Ask anything")

A chat panel that answers questions about Derick, opened from the sidebar. Built 2026-10-13.

## How it works

- It is **a system written in the site's own code, not a language model** (decided 2026-10-13). No AI API, no model download, no tokens, no cost, and nothing the visitor types leaves the browser.
- `src/lib/chatbot.ts` builds a list of topics from the files in `src/content/`: general topics (about, education, experience, projects, skills, contact, resume), plus one topic per role, per project, and per technology. Each topic has keywords and a weight. A question is scored against every topic on whole-word matches, and the best match answers. No match gives a fallback that says what it can answer.
- Because the answers are built from the content files, editing content updates the chatbot.
- The technology notes are written in the first person, so the chatbot quotes them as Derick's own words.
- UI: `src/components/sections/sidebar/ask-panel.tsx` inside `side-panel.tsx` (a native `<dialog>`).

## To improve later

- More ways of asking the same thing (synonyms), as real questions show what is missed.
- Topics for things not on the site yet, such as availability and location.
