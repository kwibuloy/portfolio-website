import { readFileSync } from "node:fs";
import path from "node:path";

// Hook input arrives as JSON on stdin.
export function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

export function projectDir(input) {
  return path.resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
}

// Exit code 2 sends the message back to Claude and blocks the action.
export function block(message) {
  process.stderr.write(message.trimEnd() + "\n");
  process.exit(2);
}
