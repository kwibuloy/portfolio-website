"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import {
  type ComponentRef,
  type RefObject,
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  CanvasTexture,
  Color,
  type Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  TOUCH,
} from "three";
import {
  fallbackKeyStyle,
  type KeyStyle,
  keyStyles,
} from "@/components/three/tech-keyboard/key-styles";
import { technologies } from "@/content/technologies";
import { gsap, useGSAP } from "@/lib/gsap";

const MODEL = "/models/tech-keyboard.glb";

// Scene units match the Blender model (see scripts/blender/build_keyboard.py).
const LOGO_SIZE = 0.4;
const LOGO_HEIGHT = 0.27; // above the key's centre: just over the dished top
const HOVER_DEPTH = 0.1;
const SELECT_DEPTH = 0.2;
const FIT_WIDTH = 11.5; // view width the tilted keyboard needs at full size

const labels = new Map(technologies.map((tech) => [tech.id, tech.keyLabel]));

/** Draws a key's logo (or its text label) onto a transparent texture. */
function logoTexture(id: string, style: KeyStyle) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  // Dark logo on light keycaps, white on the rest.
  const { r, g, b } = new Color(style.color);
  context.fillStyle =
    0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? "#111111" : "#ffffff";

  if (style.path) {
    const scale = size / (style.viewBox ?? 24);
    context.scale(scale, scale);
    context.fill(new Path2D(style.path), style.evenOdd ? "evenodd" : "nonzero");
  } else {
    context.font = `700 ${size * 0.42}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(labels.get(id) ?? id, size / 2, size / 2, size * 0.9);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Walks up from whatever mesh the pointer hit to the key it belongs to. */
function keyIdOf(object: Object3D | null) {
  for (let node = object; node; node = node.parent) {
    if (node.name.startsWith("key_")) return node.name.slice(4);
  }
  return null;
}

type SceneProps = {
  activeId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
  /** Changing this number puts the camera back where it started. */
  resetSignal: number;
  /**
   * The element that receives pointer input. The canvas itself is larger than
   * this element and ignores the pointer, so the keyboard can float past the
   * section's edges without blocking the content around it.
   */
  stage: RefObject<HTMLDivElement | null>;
};

function Keyboard({
  activeId,
  hoveredId,
  onHover,
  onSelect,
  reducedMotion,
}: Omit<SceneProps, "stage" | "resetSignal">) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const viewWidth = useThree((state) => state.viewport.width);

  // Give every key its brand colour and logo. The model itself is plain, so
  // adding a technology never needs a re-texture in Blender. The loaded scene
  // is cached by useGLTF, so userData.rest marks keys that are already styled.
  const keys = useMemo(() => {
    const found = new Map<string, { mesh: Mesh; rest: number }>();
    scene.traverse((object) => {
      if (!(object instanceof Mesh) || !object.name.startsWith("key_")) return;
      const id = object.name.slice(4);
      if (object.userData.rest === undefined) {
        const style = keyStyles[id] ?? fallbackKeyStyle;
        object.userData.rest = object.position.y;
        object.material = new MeshStandardMaterial({
          color: style.color,
          roughness: 0.35,
        });
        const logo = new Mesh(
          new PlaneGeometry(LOGO_SIZE, LOGO_SIZE),
          new MeshBasicMaterial({
            map: logoTexture(id, style),
            transparent: true,
            toneMapped: false,
          }),
        );
        logo.rotation.x = -Math.PI / 2;
        logo.position.y = LOGO_HEIGHT;
        object.add(logo);
      }
      found.set(id, { mesh: object, rest: object.userData.rest });
    });
    return found;
  }, [scene]);

  // The canvas renders on demand (not every frame), so each tween asks for a
  // new frame while it runs.
  const redraw = () => invalidate();

  // Intro: the keyboard rises and swings into place once.
  useGSAP(() => {
    if (reducedMotion || !group.current) return;
    gsap.from(group.current.position, {
      y: -2,
      duration: 1.1,
      ease: "power3.out",
      onUpdate: redraw,
    });
    gsap.from(group.current.rotation, {
      y: -1.4,
      duration: 1.4,
      ease: "power3.out",
      onUpdate: redraw,
    });
  }, [reducedMotion]);

  // Press: the hovered key dips, the selected key sits lower.
  useGSAP(() => {
    keys.forEach(({ mesh, rest }, id) => {
      const depth =
        id === activeId ? SELECT_DEPTH : id === hoveredId ? HOVER_DEPTH : 0;
      gsap.to(mesh.position, {
        y: rest - depth,
        duration: reducedMotion ? 0 : 0.25,
        ease: "power2.out",
        overwrite: true,
        onUpdate: redraw,
      });
    });
  }, [activeId, hoveredId, keys, reducedMotion]);

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(keyIdOf(event.object));
  };
  // R3F only fires onClick when the pointer barely moved, so dragging to
  // rotate the keyboard never selects a key by accident.
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const id = keyIdOf(event.object);
    if (id) onSelect(id);
  };

  return (
    // Shrink the whole keyboard on narrow canvases so it always fits.
    <group
      ref={group}
      rotation-y={-0.3}
      scale={Math.min(1, viewWidth / FIT_WIDTH)}
    >
      <primitive
        object={scene}
        onPointerOver={onPointerOver}
        onPointerOut={() => onHover(null)}
        onClick={onClick}
      />
    </group>
  );
}

/**
 * Drag to rotate, pinch or ctrl + scroll to zoom. On touch screens rotating
 * takes two fingers, so one finger still scrolls the page past the keyboard
 * (the touch-pan-y class on the stage in tech-keyboard.tsx allows that).
 */
function Controls({ resetSignal }: { resetSignal: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const setEvents = useThree((state) => state.setEvents);

  // Pointer events arrive on the stage, which is smaller than the canvas, so
  // the pointer position is measured against the canvas's own rectangle.
  useEffect(() => {
    setEvents({
      compute: (event, state) => {
        const box = state.gl.domElement.getBoundingClientRect();
        state.pointer.set(
          ((event.clientX - box.left) / box.width) * 2 - 1,
          -((event.clientY - box.top) / box.height) * 2 + 1,
        );
        state.raycaster.setFromCamera(state.pointer, state.camera);
      },
    });
  }, [setEvents]);

  useEffect(() => {
    if (resetSignal > 0) controls.current?.reset();
  }, [resetSignal]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={8}
      maxDistance={20}
      minPolarAngle={0.15}
      maxPolarAngle={1.45} // stop just above the table, never underneath
      touches={{ TWO: TOUCH.DOLLY_ROTATE }}
    />
  );
}

export default function TechKeyboardScene({ stage, ...props }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 9, 9], fov: 32 }}
      eventSource={stage as RefObject<HTMLElement>}
      eventPrefix="client"
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 10, 6]} intensity={2.4} />
      <directionalLight position={[-6, 4, -4]} intensity={0.7} />
      <Suspense fallback={null}>
        <Keyboard {...props} />
      </Suspense>
      <Controls resetSignal={props.resetSignal} />
    </Canvas>
  );
}
