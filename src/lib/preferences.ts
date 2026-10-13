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

let noise: AudioBuffer | undefined;

// A mechanical key press, also synthesised. A real switch makes two sounds at
// once: a bright click (the switch) and a low "thock" (the keycap hitting the
// case). The click is a burst of filtered noise and the thock is a falling
// sine. Each press is pitched slightly differently so repeats do not sound
// like one sample on a loop.
export function playKeyPress() {
  if (document.documentElement.dataset.sound !== "on") return;
  audio ??= new AudioContext();
  const now = audio.currentTime;
  const pitch = 0.88 + Math.random() * 0.24;

  if (!noise) {
    const length = Math.floor(audio.sampleRate * 0.05);
    noise = audio.createBuffer(1, length, audio.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < length; i++) {
      samples[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
    }
  }

  const click = audio.createBufferSource();
  click.buffer = noise;
  click.playbackRate.value = pitch;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3000 * pitch;
  band.Q.value = 1.1;
  const clickGain = audio.createGain();
  clickGain.gain.setValueAtTime(0.3, now);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  click.connect(band).connect(clickGain).connect(audio.destination);
  click.start(now);

  const thock = audio.createOscillator();
  const thockGain = audio.createGain();
  thock.type = "sine";
  thock.frequency.setValueAtTime(190 * pitch, now);
  thock.frequency.exponentialRampToValueAtTime(85 * pitch, now + 0.07);
  thockGain.gain.setValueAtTime(0.22, now);
  thockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  thock.connect(thockGain).connect(audio.destination);
  thock.start(now);
  thock.stop(now + 0.09);
}
