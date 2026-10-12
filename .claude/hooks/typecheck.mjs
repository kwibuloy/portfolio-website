// Stop: type-checks the project before Claude finishes a turn. Type errors send Claude back to fix them;
// a clean check plays the "done" sound. Does nothing until TypeScript is installed.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readInput, projectDir, block } from "./utils.mjs";
import { playSound } from "./notify-sound.mjs";

const input = readInput();
const root = projectDir(input);
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

// stop_hook_active means this hook already blocked once this turn; don't loop forever.
if (!input.stop_hook_active && existsSync(tsc) && existsSync(path.join(root, "tsconfig.json"))) {
  const result = spawnSync(process.execPath, [tsc, "--noEmit", "--pretty", "false"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    const lines = (result.stdout || result.stderr || "").trim().split(/\r?\n/);
    const shown = lines.slice(0, 40).join("\n");
    const more = lines.length > 40 ? `\n...and ${lines.length - 40} more lines` : "";
    block(`TypeScript errors must be fixed before finishing:\n${shown}${more}`);
  }
}

playSound();
process.exit(0);
