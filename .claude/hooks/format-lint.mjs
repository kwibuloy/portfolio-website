// PostToolUse (Edit|Write): runs Prettier, then ESLint --fix, on the file that was just changed.
// Does nothing until the tools are installed in node_modules.
import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { readInput, projectDir, block } from "./utils.mjs";

const input = readInput();
const root = projectDir(input);
const file = path.resolve(input.tool_response?.filePath || input.tool_input?.file_path || "");

const FORMATTABLE = /\.(tsx?|jsx?|mjs|cjs|css|json|md|mdx)$/i;
const LINTABLE = /\.(tsx?|jsx?|mjs|cjs)$/i;
const rel = path.relative(root, file);
const skipped = /^(node_modules|\.next|out|dist|\.claude)([\\/]|$)/;

if (!file || rel.startsWith("..") || path.isAbsolute(rel) || skipped.test(rel) || !FORMATTABLE.test(file) || !existsSync(file)) {
  process.exit(0);
}

function run(script, args) {
  const bin = path.join(root, "node_modules", script);
  if (!existsSync(bin)) return null;
  return spawnSync(process.execPath, [bin, ...args], { cwd: root, encoding: "utf8" });
}

const prettier = run("prettier/bin/prettier.cjs", ["--write", "--ignore-unknown", "--log-level", "warn", file]);
if (prettier && prettier.status !== 0) {
  block(`Prettier could not format ${rel}:\n${prettier.stderr || prettier.stdout}`);
}

const hasEslintConfig = readdirSync(root).some((f) => /^eslint\.config\.(js|mjs|cjs|ts|mts)$/.test(f));
if (LINTABLE.test(file) && hasEslintConfig) {
  const eslint = run("eslint/bin/eslint.js", ["--fix", "--no-warn-ignored", file]);
  if (eslint && eslint.status !== 0) {
    block(`ESLint found problems in ${rel} that --fix could not resolve. Fix them:\n${eslint.stdout || eslint.stderr}`);
  }
}

process.exit(0);
