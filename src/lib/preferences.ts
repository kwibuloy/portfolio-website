// Theme and sound preferences. The source of truth is localStorage; the value
// is mirrored onto <html> as data-theme / data-sound so CSS can react to it.

export const THEME_KEY = "theme";
export const SOUND_KEY = "sound";

// Runs inline in <head> before first paint (see layout.tsx), so the page never
// flashes the wrong theme. Falls back to the OS colour scheme on a first visit.
export const preferencesScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t);d.setAttribute("data-sound",localStorage.getItem("${SOUND_KEY}")==="on"?"on":"off")}catch(e){}})()`;

export function applyStoredPreferences() {
  const root = document.documentElement;
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === "light" || theme === "dark") root.dataset.theme = theme;
    root.dataset.sound =
      localStorage.getItem(SOUND_KEY) === "on" ? "on" : "off";
  } catch {
    // localStorage can be unavailable (private mode); keep the defaults.
  }
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The attribute still applies for this page view.
  }
}

export function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  store(THEME_KEY, next);
}

export function toggleSound() {
  const root = document.documentElement;
  const next = root.dataset.sound === "on" ? "off" : "on";
  root.dataset.sound = next;
  store(SOUND_KEY, next);
}

let audio: AudioContext | undefined;

// A short synthesised click, so UI sounds need no audio files.
export function playTick() {
  if (document.documentElement.dataset.sound !== "on") return;
  audio ??= new AudioContext();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(720, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

const KEY_SOUND = "/sounds/keyboard-typing.mp3";

type Stroke = { start: number; length: number; gain: number };

let recording: AudioBuffer | undefined;
let strokes: Stroke[] = [];
let nextStroke = 0;
let loading: Promise<void> | undefined;

// The recording is eight seconds of continuous typing. This finds where each
// keystroke begins, so a single one can be played. It follows the loudness in
// 2 ms steps and marks a keystroke wherever the level jumps well above the
// 20 ms before it. Quiet strokes (mostly keys being released) and strokes cut
// short by the next one are left out. It runs on the decoded audio, not on
// times written down by hand, because browsers do not all decode an MP3 with
// the same few milliseconds of silence at the front.
function findStrokes(buffer: AudioBuffer): Stroke[] {
  const rate = buffer.sampleRate;
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(buffer.numberOfChannels > 1 ? 1 : 0);
  const hop = Math.round(rate * 0.002);
  const frames = Math.floor(buffer.length / hop);

  const level = new Float32Array(frames);
  let loudest = 0;
  for (let frame = 0; frame < frames; frame++) {
    let energy = 0;
    for (let i = frame * hop; i < (frame + 1) * hop; i++) {
      energy += ((left[i] + right[i]) / 2) ** 2;
    }
    level[frame] = Math.sqrt(energy / hop);
    loudest = Math.max(loudest, level[frame]);
  }

  const onsets: number[] = [];
  for (let frame = 10; frame < frames; frame++) {
    let before = 0;
    for (let k = frame - 10; k < frame; k++) before += level[k] / 10;
    const jumped =
      level[frame] > 0.08 * loudest &&
      level[frame] > 2.5 * before + 0.01 * loudest;
    // More than 60 ms apart, so one keystroke is not counted twice.
    if (jumped && frame - (onsets.at(-1) ?? -31) > 30) onsets.push(frame);
  }

  const found: Stroke[] = [];
  onsets.forEach((onset, index) => {
    const end = onsets[index + 1] ?? frames;
    let framePeak = 0;
    for (let k = onset; k < end; k++) framePeak = Math.max(framePeak, level[k]);
    let peak = 0;
    for (let i = onset * hop; i < end * hop; i++) {
      peak = Math.max(peak, Math.abs(left[i] + right[i]) / 2);
    }
    const gap = ((end - onset) * hop) / rate;
    if (framePeak < 0.3 * loudest || gap < 0.085) return;

    // The exact sample where the click starts, to within a millisecond.
    let attack = Math.max(0, onset * hop - Math.round(rate * 0.006));
    while (
      attack < (onset + 2) * hop &&
      Math.abs(left[attack] + right[attack]) / 2 < 0.15 * peak
    ) {
      attack++;
    }
    const start = attack / rate;
    found.push({
      start,
      length: Math.min((end * hop) / rate - start, 0.3),
      // Every stroke plays at the same loudness, whatever it was recorded at.
      gain: 0.4 / peak,
    });
  });
  return found;
}

// Fetches and decodes the recording once. It is only downloaded for visitors
// who have sound turned on, and only where the keyboard is on the page.
export function loadKeyPress() {
  if (document.documentElement.dataset.sound !== "on") return;
  audio ??= new AudioContext();
  const context = audio;
  loading ??= fetch(KEY_SOUND)
    .then((response) => {
      if (!response.ok) throw new Error(`key sound: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      strokes = findStrokes(buffer);
      recording = buffer;
    })
    .catch(() => {
      // No recording, no key sound; the keyboard works the same without it.
    });
}

// One keystroke from the recording, taken in the order they were typed so
// repeats do not sound like one sample on a loop. `delay` (seconds) is how
// long the 3D key takes to reach the bottom of its travel: the click is
// scheduled on the audio clock to land at that moment, not when the pointer
// arrives.
export function playKeyPress(delay = 0) {
  if (document.documentElement.dataset.sound !== "on") return;
  loadKeyPress();
  if (!audio || !recording || strokes.length === 0) return;
  // A browser keeps audio suspended until the visitor has clicked or pressed
  // a key on the page. Sounds started before then would all play at once
  // later, so skip them.
  if (audio.state !== "running") {
    void audio.resume();
    return;
  }

  const stroke = strokes[nextStroke];
  nextStroke = (nextStroke + 1) % strokes.length;
  const lead = 0.002; // start just before the click, faded in, to avoid a pop
  const at = audio.currentTime + Math.max(0, delay - lead);

  const source = audio.createBufferSource();
  source.buffer = recording;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(stroke.gain, at + lead);
  // Fade out before the next keystroke in the recording begins.
  gain.gain.setValueAtTime(stroke.gain, at + lead + stroke.length - 0.015);
  gain.gain.linearRampToValueAtTime(0, at + lead + stroke.length);
  source.connect(gain).connect(audio.destination);
  source.start(at, Math.max(0, stroke.start - lead), stroke.length + lead);
}
