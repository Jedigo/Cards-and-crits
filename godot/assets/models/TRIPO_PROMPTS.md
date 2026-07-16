# Tripo Prompt Library

Locked art style (decided 2026-07-15 after A/B testing chibi vs realistic vs 80s-simple):
**stylized chunky board-game miniature** — the knight/silvershade look.

## Template (constant sentences for every unit)

- Opens: `A stylized fantasy tabletop miniature of <character> standing on a round sculpted stone base.`
- Middle: stance sentence + gear sentence + costume/color sentence (swap per unit).
- Closes: `Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and <weapon> for readability at small scale. Strong clear silhouette, static <heroic|menacing> pose. Single character on one base, no extra props or scenery.`

Rules of thumb (learned from testing):
- Keep under 1000 characters (Tripo limit).
- Few bold materials beat many fine details — Tripo smears when overloaded.
- Weapons held vertically/close to the body: tall narrow silhouette, no base overhang.
- "No extra props or scenery" keeps the bounding box tight for auto-scaling.
- Heroes get one signature color each; bandits stay muted browns/greys + "menacing".

## Export settings

GLB with embedded textures, retopo to ~10-30k triangles, save as `<unit_id>.glb` in this folder.

## Completed

- `ironwall_knight.glb` — armored knight, iron longsword + round wooden shield, faded blue tabard ✔
- `silvershade.glb` — ranger, vertical longbow + quiver, forest-green cloak ✔

## Remaining prompts

### Whisper → whisper.glb

A stylized fantasy tabletop miniature of a hooded rogue standing on a round sculpted stone base. Poised, ready stance, feet planted shoulder-width apart. Each hand holds a curved dagger low at the sides, blades pointing down. Dark grey hooded cloak with the hood up, face in shadow, fitted black leather armor with a bandolier of small throwing knives across the chest. Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and daggers for readability at small scale. Strong clear silhouette, static heroic pose. Single character on one base, no extra props or scenery.

### Ember → ember.glb

A stylized fantasy tabletop miniature of a fire mage standing on a round sculpted stone base. Confident upright stance, feet planted shoulder-width apart. One hand grips a gnarled wooden staff held vertically, its tip carved into a flame shape; the other hand is raised palm-up with a small magical flame. Flowing crimson and orange robes with a wide belt, hood down. Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and staff for readability at small scale. Strong clear silhouette, static heroic pose. Single character on one base, no extra props or scenery.

### Bandit Thug → bandit_thug.glb

A stylized fantasy tabletop miniature of a scruffy bandit thug standing on a round sculpted stone base. Aggressive wide stance, feet planted. Both hands grip a crude wooden club resting over one shoulder. Patched leather jerkin, rough cloth trousers, a bandana over messy hair, snarling stubbled face. Muted browns and greys. Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and club for readability at small scale. Strong clear silhouette, static menacing pose. Single character on one base, no extra props or scenery.

### Bandit Fighter → bandit_fighter.glb (covers Fighter + Brawler)

A stylized fantasy tabletop miniature of a hardened bandit fighter standing on a round sculpted stone base. Aggressive stance, feet planted wide. One hand holds a notched one-handed sword angled low; the other a small battered iron buckler. Mismatched armor — a dented breastplate over a leather jerkin, a shoulder plate on one side only, dark half-mask. Muted iron and brown tones. Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and weapon for readability at small scale. Strong clear silhouette, static menacing pose. Single character on one base, no extra props or scenery.

### Bandit Marksman → bandit_marksman.glb

A stylized fantasy tabletop miniature of a bandit marksman standing on a round sculpted stone base. Wary upright stance, feet planted shoulder-width apart. Both hands cradle a loaded crossbow held diagonally across the chest, pointed downward. Dark leather armor with a quiver of bolts at the hip, hood up over a cloth half-mask. Muted greys and browns. Chunky exaggerated proportions like a board game miniature — oversized shoulders, hands, and crossbow for readability at small scale. Strong clear silhouette, static menacing pose. Single character on one base, no extra props or scenery.
