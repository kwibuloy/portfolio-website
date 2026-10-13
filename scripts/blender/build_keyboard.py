"""Builds the tech keyboard model and exports it as a .glb.

Run from the project root (Blender does not need to be open):

    "D:/Blender/blender.exe" --background --python scripts/blender/build_keyboard.py

Optional: add `-- --preview path/to/preview.png` to also render a still.

One key is created per technology in src/content/technologies.ts. Entries with
group "stack" fill the main block; entries with group "tool" fill the numpad to
its right. Each key is its own object named `key_<id>`, with its origin at its centre, so
the site can match a key to a technology and animate it on its own.
"""

import math
import re
import sys
from pathlib import Path

import bmesh
import bpy

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "src" / "content" / "technologies.ts"
OUTPUT = ROOT / "public" / "models" / "tech-keyboard.glb"
# A .blend copy of the same scene, for opening in Blender (File > Open).
BLEND = Path(__file__).with_name("tech-keyboard.blend")

# Sizes in metres. The glTF exporter converts Blender's Z-up to Y-up.
KEY_SIZE = 0.9
KEY_HEIGHT = 0.62
KEY_GAP = 0.15
KEY_TAPER = 0.7  # top face width as a fraction of the bottom
DISH_INSET = 0.12  # width of the rim around the dished top
DISH_DEPTH = 0.07  # how far the middle of the top sinks
PITCH = KEY_SIZE + KEY_GAP
BASE_MARGIN = 0.3
STACK_COLS = 5  # main block width, in keys
TOOL_COLS = 3  # numpad width, in keys
BLOCK_GAP = 0.75  # space between the main block and the numpad
BASE_HEIGHT = 0.4
KEY_SINK = 0.1  # how far each key sits inside the base's top recess


def read_keys():
    """Returns {"stack": [ids], "tool": [ids]} in the order they appear."""
    pairs = re.findall(
        r'id:\s*"([^"]+)".*?group:\s*"(stack|tool)"',
        CONTENT.read_text("utf-8"),
        re.S,
    )
    if not pairs:
        raise SystemExit(f"No technologies found in {CONTENT}")
    keys = {"stack": [], "tool": []}
    for tech_id, group in pairs:
        keys[group].append(tech_id)
    return keys


def block_width(cols):
    return cols * PITCH - KEY_GAP


def material(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    mat.diffuse_color = (*color, 1)  # colour shown in Blender's solid view
    return mat


def bevel(obj, width, segments):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    for poly in obj.data.polygons:
        poly.use_smooth = True


def make_base(width, rows, mat):
    width += 2 * BASE_MARGIN
    depth = rows * PITCH - KEY_GAP + 2 * BASE_MARGIN
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, BASE_HEIGHT / 2))
    base = bpy.context.object
    base.name = "base"
    base.scale = (width, depth, BASE_HEIGHT)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel(base, 0.12, 6)
    base.data.materials.append(mat)
    return base


def make_key(tech_id, x, y, mat):
    z = BASE_HEIGHT - KEY_SINK + KEY_HEIGHT / 2
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    key = bpy.context.object
    key.name = f"key_{tech_id}"
    key.data.name = key.name
    key.scale = (KEY_SIZE, KEY_SIZE, KEY_HEIGHT)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    # Taper the top face inwards, like a real keycap.
    for vert in key.data.vertices:
        if vert.co.z > 0:
            vert.co.x *= KEY_TAPER
            vert.co.y *= KEY_TAPER
    # Dish the top: inset the top face to leave a rim, then sink the middle.
    mesh = bmesh.new()
    mesh.from_mesh(key.data)
    top = [face for face in mesh.faces if face.normal.z > 0.9]
    bmesh.ops.inset_region(mesh, faces=top, thickness=DISH_INSET)
    for vert in {vert for face in top for vert in face.verts}:
        vert.co.z -= DISH_DEPTH
    # Edge creases tell the subdivision modifier which edges to keep sharp:
    # a crisp bottom, firm sides and rim, and a soft dish.
    crease = mesh.edges.layers.float.new("crease_edge")
    rim_z = KEY_HEIGHT / 2
    for edge in mesh.edges:
        zs = sorted(vert.co.z for vert in edge.verts)
        if zs[1] < 0:
            edge[crease] = 1.0  # bottom outline
        elif zs[0] < 0:
            edge[crease] = 0.55  # the four side edges
        elif zs[0] > rim_z - 1e-4:
            edge[crease] = 0.65  # outer rim of the top
        else:
            edge[crease] = 0.2  # dish
    mesh.to_mesh(key.data)
    mesh.free()
    smooth = key.modifiers.new("Subdivision", "SUBSURF")
    smooth.levels = smooth.render_levels = 2
    for poly in key.data.polygons:
        poly.use_smooth = True
    key.data.materials.append(mat)
    return key


def render_preview(path, span):
    scene = bpy.context.scene
    bpy.ops.object.light_add(type="SUN", location=(3, -3, 6))
    bpy.context.object.data.energy = 3
    scene.world = bpy.data.worlds.new("preview")
    bpy.context.object.rotation_euler = (math.radians(40), 0, math.radians(30))
    bpy.ops.object.camera_add(location=(span * 1.2, -span * 1.6, span * 1.0))
    camera = bpy.context.object
    bpy.ops.object.empty_add(location=(0, 0, BASE_HEIGHT))
    track = camera.constraints.new("TRACK_TO")
    track.target = bpy.context.object
    scene.camera = camera
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_cavity = True
    scene.render.resolution_x = 1000
    scene.render.resolution_y = 750
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def main():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    preview = Path(args[args.index("--preview") + 1]) if "--preview" in args else None

    bpy.ops.wm.read_factory_settings(use_empty=True)

    keys = read_keys()
    rows = max(
        math.ceil(len(keys["stack"]) / STACK_COLS),
        math.ceil(len(keys["tool"]) / TOOL_COLS),
    )
    total = block_width(STACK_COLS) + BLOCK_GAP + block_width(TOOL_COLS)

    base_mat = material("base", (0.03, 0.03, 0.03), roughness=0.45)
    key_mat = material("keycap", (0.85, 0.85, 0.85), roughness=0.3)

    make_base(total, rows, base_mat)
    # Each block is laid out left to right, top row first. `left` is the x of
    # the centre of the block's first column.
    blocks = (
        ("stack", STACK_COLS, -total / 2 + KEY_SIZE / 2),
        ("tool", TOOL_COLS, total / 2 - block_width(TOOL_COLS) + KEY_SIZE / 2),
    )
    for group, cols, left in blocks:
        for index, tech_id in enumerate(keys[group]):
            col, row = index % cols, index // cols
            # Centre a last row that is not full.
            in_row = min(cols, len(keys[group]) - row * cols)
            x = left + (col + (cols - in_row) / 2) * PITCH
            y = ((rows - 1) / 2 - row) * PITCH
            make_key(tech_id, x, y, key_mat)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        export_apply=True,  # bake the bevel modifiers into the mesh
        export_cameras=False,
        export_lights=False,
    )
    count = len(keys["stack"]) + len(keys["tool"])
    print(f"Exported {count} keys to {OUTPUT}")

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    print(f"Saved {BLEND}")

    if preview:
        render_preview(preview, total * 0.85)


main()
