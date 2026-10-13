"use client";

import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { toggleSound, toggleTheme } from "@/lib/preferences";

const buttonClass =
  "text-text-muted hover:bg-raised hover:text-text flex size-9 items-center justify-center rounded-full transition-colors";

// The icons switch with CSS variants that read data-theme / data-sound on
// <html>, so the buttons need no React state and cannot mismatch on hydration.
export function PreferenceToggles() {
  return (
    <div className="border-border flex shrink-0 items-center rounded-full border">
      <button
        type="button"
        onClick={toggleTheme}
        className={buttonClass}
        aria-label="Switch between light and dark theme"
      >
        <Sun aria-hidden className="size-4 dark:hidden" />
        <Moon aria-hidden className="hidden size-4 dark:block" />
      </button>
      <button
        type="button"
        onClick={toggleSound}
        className={buttonClass}
        aria-label="Turn interface sounds on or off"
      >
        <VolumeX aria-hidden className="sound-on:hidden size-4" />
        <Volume2 aria-hidden className="sound-on:block hidden size-4" />
      </button>
    </div>
  );
}
