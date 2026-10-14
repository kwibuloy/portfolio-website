# Planned feature: tech keyboard

A 3D interactive numpad-style keyboard where each key is a technology Derick uses.

- **Home page**: hovering a key (tapping on touch) shows a small card beside the pointer with a short summary. Nothing else sits under the keyboard.
- **Sound** (changed 2026-10-13): landing on a key plays one keystroke from a recording of mechanical typing, `public/sounds/keyboard-typing.mp3` ("Mechanical Keyboard Typing HD" by VirtualZero, Pixabay Content License, no attribution required). `findStrokes` in `src/lib/preferences.ts` finds where each keystroke starts in the decoded audio (30 usable ones), and `playKeyPress` plays them in recorded order, each at the same loudness. It only plays when the visitor has turned the sound toggle on, and the file is only downloaded then.
- **Sound and press in step**: the key goes down in `PRESS_TRAVEL` (0.07 s, in `tech-keyboard.tsx`) and the click is scheduled on the audio clock to land when the key reaches the bottom. With reduced motion the key moves instantly and so does the sound. Changing the press speed means changing that one constant.
- **`/tech-stack`**: the page is only the keyboard. Hovering shows the same card; clicking a key opens a popup (`tech-dialog.tsx`, a native `<dialog>` animated with Motion) in the key's brand colour with the detailed experience.

## Model

- Built from a `.glb` model wired up in React Three Fiber (decided 2026-10-13).
- Derick has no existing model, so Claude builds it with a Blender script (decided 2026-10-13). No Blender connector is needed: Blender 4.5 is installed at `D:\Blender` and runs headless.
- The script is `scripts/blender/build_keyboard.py`. It creates one key per `id` in `src/content/technologies.ts` and exports `public/models/tech-keyboard.glb`. Re-run it after changing the technology list or the model's shape:

  ```
  "D:/Blender/blender.exe" --background --python scripts/blender/build_keyboard.py
  ```

- The script also saves `scripts/blender/tech-keyboard.blend`, the same scene for opening in Blender. It is overwritten on every run, so shape changes belong in the script.
- Each key is its own object named `key_<id>` with its origin at its centre; the base is `base`. Materials are `keycap` and `base`.
- **Layout** (decided 2026-10-13): two blocks on one black base, four rows deep. The main block (5 keys wide) holds the tech stack; a numpad block to its right (3 keys wide) holds tools such as GitHub and VS Code, so the two are clearly distinct. A technology's `group` field (`"stack"` or `"tool"`) in `src/content/technologies.ts` decides which block its key goes in. A last row that is not full is centred.
- **State**: built and on the site (home page and `/tech-stack`). 20 stack keys (5×4) and 10 tool keys (rows of 3, 3, 3, 1). The model is plain; colours and logos are added in code.
- **Look to aim for**: `docs/design-reference/tech-keyboard-inspo.png` and `tech-keyboard.png`. Glossy keycaps in each technology's brand colour with a white logo on top, on a black base, with a "hint: press a key" line and the technology name and a one-line description beside the keyboard. Their dark backgrounds do not apply.
- **Colours and logos** (decided 2026-10-13): brand-coloured keys, applied in site code, with white logos from Simple Icons. The model stays plain.
- **Key list** (confirmed by Derick 2026-10-13): see `src/content/technologies.ts`. The experience text for every key is still placeholder.

## Scene code

- `src/components/three/tech-keyboard/tech-keyboard.tsx`: the section (canvas, detail panel, hidden buttons). `mode="summary"` on the home page, `mode="details"` on `/tech-stack`.
- `scene.tsx`: the R3F canvas. Loads the `.glb`, colours each key, draws its logo onto a texture, and animates the press with GSAP. The canvas renders on demand, not every frame.
- `key-styles.ts`: brand colour and logo per technology id, from the `simple-icons` package. VS Code and Antigravity are not in that set, so their logo paths are copied from Devicon (MIT).
- The keyboard floats: the canvas is twice the height of the section and ignores the pointer, and the section element receives the input (`eventSource` on the R3F canvas). Nothing frames or clips it, and the detail text sits below it, never on top. Drag rotates, Ctrl + scroll or pinch zooms (a plain scroll still scrolls the page), two fingers rotate on touch, and "Reset view" restores the camera.
- Adding a technology: add it to `technologies.ts`, add its entry to `key-styles.ts`, and re-run the Blender script.
- Not handled yet: a fallback for browsers without WebGL.

## Data and accessibility

- The technology list and experience text are in `src/content/technologies.ts`. The 3D scene and the accessible fallback both read from it.
- Keyboard access: visually hidden buttons inside the section mirror every key; focusing one presses its 3D key and shows the card, and activating one opens the popup on `/tech-stack`.
