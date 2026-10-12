// Notification: plays a sound when Claude needs the user. Also imported by typecheck.mjs.
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const WAV = "C:\\Windows\\Media\\Windows Notify System Generic.wav";

export function playSound() {
  if (process.platform !== "win32") {
    process.stderr.write("\x07");
    return;
  }
  const script = existsSync(WAV)
    ? `(New-Object System.Media.SoundPlayer '${WAV}').PlaySync()`
    : "[console]::beep(880,250)";
  // Detached so the hook returns immediately while the sound plays.
  spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  playSound();
}
