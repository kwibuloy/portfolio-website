"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

/**
 * The safety net for any page that throws while rendering. The sidebar stays
 * (the root layout is outside this boundary), so the visitor can still get
 * anywhere else on the site.
 */
export default function Error({ retry }: { retry: () => void }) {
  return (
    <main className="max-w-content mx-auto flex w-full flex-col gap-6 px-6 py-12 lg:px-12 lg:py-20">
      <p className="text-text-subtle font-mono text-sm">Something broke</p>
      <h1 className="text-gradient text-4xl font-semibold tracking-tight sm:text-6xl">
        This page didn&apos;t load properly.
      </h1>
      <p className="text-text-muted max-w-xl text-lg">
        Trying again usually fixes it. If it doesn&apos;t, the rest of the site
        is still a click away.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="bg-accent text-on-accent inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-sm"
        >
          <RotateCcw aria-hidden className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="border-border-strong hover:bg-accent hover:text-on-accent inline-flex items-center rounded-full border px-5 py-3 font-mono text-sm transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
