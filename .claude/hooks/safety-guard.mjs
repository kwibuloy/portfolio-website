// PreToolUse: blocks edits to secrets/lockfiles and destructive shell commands.
import path from "node:path";
import { readInput, block } from "./utils.mjs";

const input = readInput();
const tool = input.tool_name || "";
const args = input.tool_input || {};

const LOCKFILES = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"]);
const ENV_TEMPLATES = new Set([".env.example", ".env.sample", ".env.template"]);
// Build output that is always safe to delete and regenerate.
const DISPOSABLE = new Set([".next", "node_modules", "out", "dist", "build", ".turbo", "coverage"]);

function isEnvFile(name) {
  return /^\.env(\..+)?$/.test(name) && !ENV_TEMPLATES.has(name);
}

if (tool === "Edit" || tool === "Write" || tool === "NotebookEdit") {
  const name = path.basename(args.file_path || args.notebook_path || "");
  if (isEnvFile(name)) {
    block(`Blocked: ${name} holds secrets. Ask the user to edit it themselves (use .env.example for documenting variables).`);
  }
  if (LOCKFILES.has(name)) {
    block(`Blocked: ${name} is generated. Change package.json and run the package manager instead of editing it by hand.`);
  }
  process.exit(0);
}

if (tool === "Bash" || tool === "PowerShell") {
  const command = String(args.command || "");

  if (/\bgit\s+push\b[^|;&]*(\s--force\b|\s--force-with-lease\b|\s-[a-zA-Z]*f[a-zA-Z]*\b)/.test(command)) {
    block("Blocked: force push rewrites remote history. Ask the user to run it themselves if it is really needed.");
  }
  if (/\bgit\s+reset\b[^|;&]*--hard\b/.test(command)) {
    block("Blocked: git reset --hard discards uncommitted work. Ask the user first, or use git stash.");
  }
  if (/\bgit\s+clean\b[^|;&]*\s-[a-zA-Z]*f/.test(command)) {
    block("Blocked: git clean -f deletes untracked files permanently. Ask the user first.");
  }
  if (/(>>?|\bOut-File\b|\bSet-Content\b|\bAdd-Content\b|\btee\b)[^|;&]*\.env(\.(?!example|sample|template)\w+)?(\s|["']|$)/i.test(command)) {
    block("Blocked: writing to a .env file from the shell. Ask the user to edit it themselves.");
  }

  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const tokens = segment.trim().split(/\s+/).map((t) => t.replace(/^["']|["']$/g, ""));
    const cmd = (tokens[0] || "").toLowerCase();
    const flags = tokens.slice(1).filter((t) => t.startsWith("-"));
    const targets = tokens.slice(1).filter((t) => !t.startsWith("-"));

    let recursiveForce = false;
    if (cmd === "rm") {
      const short = flags.filter((f) => !f.startsWith("--")).join("").toLowerCase();
      const unix = (short.includes("r") || flags.includes("--recursive")) && (short.includes("f") || flags.includes("--force"));
      const ps = flags.some((f) => /^-r(ecurse)?$/i.test(f)) && flags.some((f) => /^-fo(rce)?$/i.test(f));
      recursiveForce = unix || ps;
    } else if (["remove-item", "ri", "del", "erase", "rd", "rmdir"].includes(cmd)) {
      recursiveForce = flags.some((f) => /^-r(ecurse)?$/i.test(f)) && flags.some((f) => /^-fo(rce)?$/i.test(f));
    }
    if (!recursiveForce) continue;

    const safe =
      targets.length > 0 &&
      targets.every((t) => {
        const clean = t.replace(/[\\/]+$/, "");
        return !/[*?$~]|\.\./.test(clean) && DISPOSABLE.has(path.basename(clean));
      });
    if (!safe) {
      block(
        `Blocked: recursive force delete (${segment.trim()}). Only build output (${[...DISPOSABLE].join(", ")}) may be deleted this way. Ask the user to confirm anything else.`,
      );
    }
  }
}

process.exit(0);
