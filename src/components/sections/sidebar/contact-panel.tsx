"use client";

import { Check, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  CONTACT_LIMITS,
  type ContactErrors,
  type ContactInput,
  type ContactResponse,
  validateContact,
} from "@/lib/contact";

const empty: ContactInput = { name: "", email: "", message: "" };

const fieldClass =
  "border-border-strong bg-surface placeholder:text-text-subtle aria-invalid:border-text w-full rounded-xl border px-4 py-3 text-sm";

type Status = "idle" | "sending" | "sent";

/**
 * The contact form inside the Contact panel. It posts to /api/contact, which
 * validates again and emails the message. The fields are controlled state,
 * so a failed send keeps everything the visitor typed.
 */
export function ContactPanel() {
  const [values, setValues] = useState(empty);
  const [website, setWebsite] = useState(""); // honeypot, see below
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const set = (field: keyof ContactInput) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as the visitor edits it.
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      const result = (await response.json()) as ContactResponse;
      if (result.ok) {
        setValues(empty);
        setStatus("sent");
        return;
      }
      setErrors(result.fieldErrors ?? {});
      setFailure(result.error);
    } catch {
      setFailure(
        "Your message could not be sent. Check your connection and try again.",
      );
    }
    setStatus("idle");
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 p-10 text-center"
      >
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="bg-accent text-on-accent flex size-16 items-center justify-center rounded-full"
        >
          <Check aria-hidden className="size-8" />
        </motion.span>
        <p className="text-2xl font-medium">Message sent</p>
        <p className="text-text-muted">
          Thanks for reaching out. I&apos;ll reply to the email address you
          gave.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="border-border-strong hover:bg-accent hover:text-on-accent rounded-full border px-4 py-2 font-mono text-sm transition-colors"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex flex-col gap-4 overflow-y-auto p-6"
    >
      <Field
        id="contact-name"
        label="Name"
        error={errors.name}
        input={(props) => (
          <input
            {...props}
            type="text"
            data-autofocus
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            value={values.name}
            onChange={(event) => set("name")(event.target.value)}
          />
        )}
      />
      <Field
        id="contact-email"
        label="Email"
        error={errors.email}
        input={(props) => (
          <input
            {...props}
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            placeholder="name@example.com"
            value={values.email}
            onChange={(event) => set("email")(event.target.value)}
          />
        )}
      />
      <Field
        id="contact-message"
        label="Message"
        error={errors.message}
        input={(props) => (
          <textarea
            {...props}
            rows={6}
            maxLength={CONTACT_LIMITS.message}
            value={values.message}
            onChange={(event) => set("message")(event.target.value)}
          />
        )}
      />

      {/* Honeypot: hidden from people and skipped by the keyboard. A bot that
          fills in every field gives itself away, and the server drops it. */}
      <div aria-hidden className="sr-only">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {failure && (
        <p
          role="alert"
          className="border-border-strong bg-raised rounded-xl border px-4 py-3 text-sm"
        >
          {failure}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-text-subtle max-w-56 font-mono text-xs">
          Goes straight to my inbox. Nothing is stored on this site.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="group bg-accent text-on-accent flex items-center gap-2 rounded-full px-5 py-3 font-mono text-sm transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none"
        >
          {sending ? "Sending…" : "Send"}
          <Send
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </button>
      </div>
    </form>
  );
}

/** A labelled input with its inline error wired up for screen readers. */
function Field({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: (props: {
    id: string;
    required: true;
    className: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-xs">
        {label}
      </label>
      {input({
        id,
        required: true,
        className: fieldClass,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
