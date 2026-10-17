"use client";

import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { answer, type Reply, SUGGESTIONS } from "@/lib/chatbot";

type Message = { id: number; from: "bot" | "visitor"; reply: Reply };

const THINKING = 450; // ms the bot "types" before answering

const greeting: Message = {
  id: 0,
  from: "bot",
  reply: {
    text: "Hi! Ask me about Derick: his projects, experience, education, tech stack, or how to reach him.",
  },
};

/**
 * The chat inside the "Ask anything" panel. The answers come from
 * src/lib/chatbot.ts, a lookup over the site's content; no AI service is
 * called and nothing the visitor types leaves the browser.
 */
export function AskPanel() {
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the newest message in view.
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    setDraft("");
    setThinking(true);
    setMessages((list) => [
      ...list,
      { id: list.length, from: "visitor", reply: { text } },
    ]);
    timer.current = setTimeout(() => {
      setMessages((list) => [
        ...list,
        { id: list.length, from: "bot", reply: answer(text) },
      ]);
      setThinking(false);
    }, THINKING);
  };

  return (
    <>
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex min-h-64 flex-1 flex-col gap-3 overflow-y-auto p-6 in-data-keyboard:min-h-0"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`flex max-w-5/6 flex-col gap-3 rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
              message.from === "visitor"
                ? "bg-accent text-on-accent self-end rounded-br-sm"
                : "bg-raised self-start rounded-bl-sm"
            }`}
          >
            <span className="sr-only">
              {message.from === "visitor" ? "You: " : "Answer: "}
            </span>
            {message.reply.text}
            {message.reply.links && (
              <span className="flex flex-wrap gap-2">
                {message.reply.links.map((link) =>
                  link.href.startsWith("http") || link.href.endsWith(".pdf") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="border-border-strong bg-bg hover:bg-accent hover:text-on-accent rounded-full border px-3 py-1 font-mono text-xs transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="border-border-strong bg-bg hover:bg-accent hover:text-on-accent rounded-full border px-3 py-1 font-mono text-xs transition-colors"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </span>
            )}
          </motion.div>
        ))}
        {thinking && (
          <div
            aria-label="Looking that up"
            className="bg-raised flex gap-1 self-start rounded-2xl rounded-bl-sm px-4 py-4"
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="bg-text-subtle size-2 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: dot * 0.15,
                }}
              />
            ))}
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="border-border flex flex-col gap-3 border-t p-4">
        {/* Hidden while the phone keyboard is up. */}
        <ul className="flex flex-wrap gap-2 in-data-keyboard:hidden">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => ask(suggestion)}
                className="border-border text-text-muted hover:border-accent hover:text-text rounded-full border px-3 py-1 font-mono text-xs transition-colors"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            ask(draft);
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <input
            id="ask-input"
            data-autofocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={200}
            autoComplete="off"
            placeholder="Ask about Derick…"
            className="border-input-border bg-surface placeholder:text-text-subtle min-w-0 flex-1 rounded-full border px-4 py-3 text-base lg:text-sm"
          />
          <button
            type="submit"
            aria-label="Send question"
            disabled={!draft.trim() || thinking}
            className="bg-accent text-on-accent flex size-11 shrink-0 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 motion-reduce:transition-none"
          >
            <ArrowUp aria-hidden className="size-5" />
          </button>
        </form>
        <p className="text-text-subtle font-mono text-xs">
          Answers come from this site&apos;s content, not an AI model.
        </p>
      </div>
    </>
  );
}
