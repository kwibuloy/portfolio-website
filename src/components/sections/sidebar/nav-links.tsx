"use client";

import {
  ArrowRight,
  Award,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Keyboard,
  type LucideIcon,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/content/site";

const icons: Record<string, LucideIcon> = {
  "/education": GraduationCap,
  "/experience": Briefcase,
  "/tech-stack": Keyboard,
  "/projects": FolderOpen,
  "/certifications": Award,
  "/services": Wrench,
};

const pill = { type: "spring", stiffness: 400, damping: 34 } as const;

/**
 * Client component because the active link depends on the current pathname.
 *
 * Two pills slide between the links: a solid one marks the current page and a
 * faint one follows the pointer or keyboard focus. Motion animates between
 * elements that share a layoutId, and `id` keeps the desktop and mobile
 * copies of the nav from sharing theirs.
 */
export function NavLinks({ id }: { id: string }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-1" onPointerLeave={() => setHovered(null)}>
      {nav.map(({ href, label }, index) => {
        const active = pathname === href;
        const Icon = icons[href];
        return (
          // A CSS entrance, so the nav is there from the first paint (see
          // --animate-reveal-left in globals.css).
          <li
            key={href}
            className="animate-reveal-left motion-reduce:animate-none"
            style={{ animationDelay: `${0.1 + index * 0.06}s` }}
          >
            <Link
              href={href}
              data-tour={`nav-${href.slice(1)}`}
              aria-current={active ? "page" : undefined}
              onPointerEnter={() => setHovered(href)}
              onFocus={() => setHovered(href)}
              onBlur={() => setHovered(null)}
              className={`group relative isolate flex items-center gap-3 rounded-xl px-3 py-3 font-mono text-sm transition-colors ${
                active ? "text-on-accent" : "text-text-muted hover:text-text"
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`${id}-active-link`}
                  className="bg-accent absolute inset-0 -z-10 rounded-xl"
                  transition={pill}
                />
              )}
              {hovered === href && !active && (
                <motion.span
                  layoutId={`${id}-hover-link`}
                  className="bg-raised absolute inset-0 -z-10 rounded-xl"
                  transition={pill}
                />
              )}
              <span aria-hidden className="text-xs opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>
              {Icon && (
                <Icon
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 motion-reduce:transition-none"
                />
              )}
              <span className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
                {label}
              </span>
              <ArrowRight
                aria-hidden
                className={`ml-auto size-4 transition duration-300 motion-reduce:transition-none ${
                  active
                    ? ""
                    : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
