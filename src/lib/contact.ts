// Shared by the contact form (for instant feedback) and the route handler
// (which validates again, because the browser's checks can be bypassed).

export type ContactInput = { name: string; email: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const CONTACT_LIMITS = { name: 100, email: 254, message: 5000 };

export type ContactResponse =
  { ok: true } | { ok: false; error: string; fieldErrors?: ContactErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = "Enter your name.";
  else if (name.length > CONTACT_LIMITS.name)
    errors.name = `Keep your name under ${CONTACT_LIMITS.name} characters.`;

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL.test(email))
    errors.email = "Enter a valid email address, like name@example.com.";

  if (!message) errors.message = "Write a message.";
  else if (message.length < 10)
    errors.message = "Write at least 10 characters.";
  else if (message.length > CONTACT_LIMITS.message)
    errors.message = `Keep your message under ${CONTACT_LIMITS.message.toLocaleString("en-US")} characters.`;

  return errors;
}
