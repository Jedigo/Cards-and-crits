# Tripo Model Drop Folder

Drop GLB exports from Tripo 3D AI Studio here. Any file named `<id>.glb` automatically
replaces that unit's placeholder capsule on the board — no code changes needed. Models
are auto-scaled to miniature height (1.3 units) and grounded on their base.

## Expected filenames

Heroes:

| File                  | Unit            |
| --------------------- | --------------- |
| `ironwall_knight.glb` | Ironwall Knight |
| `silvershade.glb`     | Silvershade     |
| `whisper.glb`         | Whisper         |
| `ember.glb`           | Ember           |

Enemies (numbered variants share one model — `bandit_fighter_1` and `_2` both use `bandit_fighter.glb`):

| File                  | Unit                          |
| --------------------- | ----------------------------- |
| `bandit_thug.glb`     | Bandit Thug (scene 1)         |
| `bandit_fighter.glb`  | Bandit Fighter/Brawler (sc 3) |
| `bandit_marksman.glb` | Bandit Marksman (scene 3)     |

## Tripo export tips

- Export **GLB with baked/embedded textures** (Godot imports it natively).
- Run Tripo's retopology/reduction first — aim for ~10–30k triangles per mini.
- Scale and origin don't matter; the game normalizes both on load.
- A-pose/T-pose or a static "miniature pose" both work; animation is ignored for now.
