# RPG Card Game Prototype

Pack-based adventure card RPG with dice combat and a tabletop aesthetic. See `Game_Design_Document_v0.8.md` for the full GDD.

## Project Structure

```
godot/              — Godot 4.7 production project (3D miniatures on a tabletop board)
  project.godot              — Godot 4.7, Forward+ renderer
  data/gameData.json         — Symlink to prototype's gameData.json (single source of truth)
  autoload/game_data.gd      — GameData singleton: loads/queries the shared JSON
  scenes/main.tscn           — Entry scene (everything else built procedurally in script)
  scripts/
    main.gd                  — Tabletop setup (lighting, table, HUD), scene switching (keys 1-3),
                               click-to-select raycast, BOARD_SCREENSHOT env debug hook
    battle_board.gd          — Builds zone tiles/connections/minis from a gameData scene entry
    mini.gd                  — Miniature: auto-loads assets/models/<id>.glb (Tripo drop folder)
                               or placeholder capsule; normalizes scale/origin; base + label + ring
    orbit_camera.gd          — Orbit rig (RMB drag, wheel zoom, Q/E rotate, R reset)
  assets/models/             — Drop Tripo GLB exports here, named <hero_or_enemy_id>.glb
                               TRIPO_PROMPTS.md = prompt library + locked art style template
prototype/          — React + Vite Phase 2+ combat + run prototype
  src/
    data/gameData.json       — All game data (heroes, environments, scenes, enemies, skill/consumable pools, dice tiers, zone tags)
    state/
      runReducer.js          — Run-level state machine (hero select → loadout → scene intro → combat/rest → scene complete → run end)
      combatHelpers.js       — Extracted pure combat functions (attack resolution, dice, zone helpers, passives, skill effects)
      gameReducer.js         — Phase 1 legacy reducer (unused, kept as reference)
    components/
      RangeBandDisc.jsx      — 2.5D isometric zone map (CSS perspective, terrain-textured tiles, counter-rotated standees)
      ActionBar.jsx           — Player actions (move, retreat, attack, skills, equipment, end turn) — zone-targeting skill UI
      DiceRoller.jsx          — Dice tray display (2d8 + bonus dice + exploding crits + d20 for skill checks)
      HealthBar.jsx           — HP bars with passive display
      CombatLog.jsx           — Scrolling combat event log
      HeroSelect.jsx          — Hero picker (choose 2 of 4 starter heroes)
      LoadoutScreen.jsx       — Loadout picker (3 skill slots + 1 consumable per hero from shared pool)
      SceneIntro.jsx          — Scene title card with narrative text
      SceneComplete.jsx       — Scene outcome + continue flow
      PartyBar.jsx            — Party HP display with active hero indicator
      RestScene.jsx           — Rest + skill check scene UI
```

## Commands

```bash
cd prototype && npm run dev    # Start dev server (localhost:5173)
cd prototype && npx vite build # Production build
cd godot && ~/.local/bin/godot -e   # Open Godot editor (4.7.1 installed at ~/.local/bin/godot)
cd godot && ~/.local/bin/godot      # Run the 3D board directly
# Debug screenshot: BOARD_SCREENSHOT=/path.png BOARD_SCENE=3 ~/.local/bin/godot --quit-after 45
```

## Key Design Decisions

### Combat Zones
- Graph-based location system (not abstract range bands)
- Zones are named places with tags and connections
- Same zone = melee + ranged; connected zone = ranged only; not connected = out of range
- Moving between zones costs your entire turn (1 action per turn)
- Engagement: if enemies share your zone, you're engaged and can't freely move — must Retreat (provokes opportunity attack)

### Dice System (2d8 Tier-Based with Exploding Crits)
- 2d8 attack roll + stat modifier (STR melee, DEX ranged, INT magic) for accuracy
- Damage tiers: Miss 2-6 (0), Graze 7-10 (2+w×1), Hit 11-13 (3+w×1), Strong Hit 14-15 (4+w×2), Critical 16+ (5+w×2)
- **Stats add to roll (accuracy), weapons add to damage (via damageBonus × weaponMultiplier)**
- Weapon scaling: Graze/Hit = weapon×1, Strong Hit/Crit = weapon×2
- Exploding crits: natural 16 (double 8s) adds bonus d8 damage, chains on 8
- Other dice (d4, d6, d8, d10, d12, d20) appear for special moments only (healing, crit bonuses, skill checks)

### Enemy AI Behaviors
- `aggressive`: charges toward player, melees in same zone
- `ranged`: shoots from connected zones, retreats if engaged (costs their turn + provokes opportunity attack), fights with penalty if cornered

### Hero Party & Stats
- 2–3 heroes per run, each with 5 loadout slots (1 weapon, 1 armor, 3 flex)
- 5 stats: STR, DEX, INT, CON, WITS (range 0–3, budget 9 per hero)
- WITS: primary stat for all skill checks, future attack stat for divine/nature/martial classes (Cleric, Druid, Monk, Bard)
- Stat budget is fixed at 9 across all rarities — rarity differentiates through passives, not raw stats
- 6+ classes: Warrior, Ranger, Rogue, Mage, Healer/Cleric, Tinkerer/Artificer (more planned)
- **Weapon specialization**: heroes are specialists, not generalists (Warrior = melee only, Ranger = ranged only, Mage = spells only, Rogue = both). Gap-filling comes from skill/spell cards in flex slots, not redundant weapons
- Equipment is unrestricted — any class can use any card
- Figure passives define identity; active skills come from card packs

### Skill & Equipment Cards
- 13 starter skill cards in shared pool: Charge, Power Strike, Aimed Shot, Arcane Blast, Disengage, Grappling Hook, Bandage, War Cry, Fire Flask, Shield Bash, Sneak Attack, Healing Touch, Taunt
- Consumables are separate from skills (own slot): Healing Potion, Smoke Bomb, Throwing Axe
- Skills use the `USE_EQUIPMENT` dispatch with `type: "skill"` and `skillType` field
- Zone-targeting skills use pending skill UI state in ActionBar
- Armor is passive `damageReduction`, not an active ability
- Enemies have `damageBonus` on their stats for weapon-like damage scaling

### Cooldown System (Not Consumption)
- Loadout cards (equipment + skills) go on cooldown after a run: Common/Uncommon = 1 run, Rare = 2, Legendary = 3
- Environment cards, narrative cards, wild cards, and all figures are permanent — never consumed
- Starter gear never goes on cooldown
- Drives collection depth: need backup options while favorites recharge

### Run Structure & Scenes
- A run = sequence of player-designed scenes (2–3 quick, 4–5 standard, 6+ epic)
- Each scene: 1 environment card (zone graph) + 1 narrative card (story beat) + optional enemy figures
- Play modes: Shuffle (random), Crafted (player-arranged), Hybrid (mix)
- Non-combat scenes: rest, choice, skill check, reward, twist
- Tier-based rewards (Tier 1–4 + bonus) — even failed runs pay out

### Data-Driven
- All game data lives in `gameData.json` for hot-swapping during balance testing
- Zone tags drive combat modifiers (elevated, cover, shadowed, etc.)
- Damage tiers are configurable in the JSON

## Production Target

React prototype validates mechanics → rebuild in Godot for Steam release. No premium currency / no microtransactions — gold only.

## Session Log

### 2026-03-30
- GDD updated from v0.3 → v0.6: added cooldown system, scene-based run structure, hero parties (2–3 per run), 4-stat system (STR/DEX/INT/CON), 6 classes, figure passives, campaign packs, pack structure (5-card with pity system), non-combat scenes, and 14 open design questions
- **Next steps**: Phase 2 — Run Structure (draw pile, card-driven adventure flow, narrative/choice scenes, tier tracker, win/lose conditions)

### 2026-03-30 (Session 2)
- **Built Phase 2: Starter Box Tutorial Run** — 3-scene adventure (tutorial combat → rest + skill check → full combat) representing the free starter box content
- **New architecture**: `runReducer.js` wraps combat in a run-level state machine (hero_select → scene_intro → scene_active → scene_complete → run end). Combat helpers extracted to `combatHelpers.js` for reuse
- **Party system**: pick 2 of 4 starter heroes (Warrior, Ranger, Rogue, Mage), multi-hero turn order, per-hero zones and equipment
- **Non-combat scenes**: rest (heal CON x 2) and skill checks (d20 + stat vs DC) with rewards carrying into next scene
- **Stats rework**: renamed strength/agility/wits to STR/DEX/INT/CON. STR adds to melee damage, DEX adds to ranged attack rolls, INT adds to magic weapon damage (`"magic": true` flag), CON determines maxHP (8 + CON x 2) and rest healing
- **Weapon specialization**: decided heroes should be specialists — Warrior melee-only, Ranger ranged-only, Mage spells-only, Rogue gets both. Reasoning: having both options reduces zone positioning importance. Gap-filling comes from skill/spell cards in flex slots (Blink, Charge, etc.)
- **Balance tuning from playtesting**: nerfed Bandit Marksman (DEX 3→1, removed shadowed from Ledge), reduced Brawler HP (12→9), moved shadowed tag to Supply Alcove to reward player aggression
- **Bug fixes**: fixed mutation bug in `resolveEnemyTurns` (shared hero object references causing phantom HP loss), added `ensureValidTarget` to auto-select living enemies on turn/hero changes, added cover absorption feedback to combat log
- **GDD converted** from .docx to markdown (`Game_Design_Document_v0.7.md`) with all new design decisions integrated
- **Next steps**: Phase 3 — more hero passives in action (Keen Eye, Shadow Step need testing with Ranger/Rogue picks), skill/spell cards in flex loadout slots, additional enemy behaviors, second run with different environment cards

### 2026-03-31
- **2d8 Exploding Dice System**: Replaced 2d6 with 2d8, new damage tiers, exploding crits on natural 16 (double 8s), stat/damage flip (stats→accuracy, weapons→damage with tier-scaled multipliers)
- **Starter Skill Cards + Loadout Screen**: 9 skill cards + 2 consumables in shared pools. New loadout phase: 3 skill slots + 1 consumable slot per hero. Zone-targeting UI for skills like Charge, Arcane Blast, Fire Flask
- **Passive Armor + Enemy Rebalance**: Armor is passive DR (not active block). All enemies get damageBonus: 1. Knight passive changed from Iron Stance (self-DR) to Hold the Line (enemies engaged with Knight get -1 to attack allies). Weapon specialization enforced (no ranged without ranged weapon)
- **GDD v0.8**: New version with 2d8 system, stat/damage flip, exploding crits, future features
- **Next steps**: Gear durability/repair (Tales of Arydia style), crafting consumables, more enemy behaviors, Parry skill (deferred — needs status tracking), second run environment

### 2026-04-01
- **Expanded starter box**: 4 new skills (Shield Bash, Sneak Attack, Healing Touch, Taunt) + 1 new consumable (Throwing Axe). Pool now 13 skills + 3 consumables
- **WITS stat added** as 5th stat. Stat budget formalized at 9 points per hero, all rarities. Hero stats rebalanced: Mage is squishiest (CON 1, 10HP), Rogue gets CON 2 (12HP). Skill checks now use WITS
- **Damage tiers buffed +1 across the board** (Graze 1→2, Hit 2→3, etc.) after playtesting showed grindy combat
- **2.5D isometric zone map**: Replaced SVG circles with CSS perspective-tilted surface (rotateX 58° + rotateZ -45°), rectangular tiles with CSS terrain textures, counter-rotated standee figures. Inspired by Card Hunter's tabletop aesthetic
- **Sneak Attack uses DEX** (not STR) after playtesting showed STR 1 Rogue whiffing. Throwing Axe uses attack roll (DEX-based) for realism
- **Next steps**: Tune 2.5D map visual, gear durability/repair, more enemy behaviors, status effect system, second run environment

### 2026-07-15
- **Godot production project started** (`godot/`) — decided to skip polishing the temporary CSS 2.5D map and begin the real 3D build, motivated by user's Tripo 3D AI Studio skills for making miniatures. Godot 4.7.1 installed at `~/.local/bin/godot`
- **3D tabletop board**: procedural board built from `gameData.json` (symlinked from prototype — single source of truth). Zone tiles with tag-based colors + elevation, connection paths, name/tag labels, warm tabletop lighting, orbit camera, click-to-select enemies with highlight ring, HUD, scene switching (keys 1–3)
- **Tripo GLB drop-in pipeline**: any `assets/models/<id>.glb` auto-replaces that unit's placeholder capsule; models are auto-normalized (scale to 1.3u height, grounded, centered) since AI exports vary in scale/origin. Verified end-to-end with a generated mis-scaled test GLB. Numbered enemy ids share a model (`bandit_fighter_1` → `bandit_fighter.glb`)
- **First real Tripo minis generated and on the board**: Ironwall Knight + Silvershade. Style match between generations confirmed — the template approach works
- **Art style locked after A/B testing**: stylized chunky board-game proportions ("chibi") won over realistic-heroic and 80s-simple variants (realistic/simple attempts came out worse — Tripo struggles with fine detail). Full prompt library + template + lessons in `godot/assets/models/TRIPO_PROMPTS.md` (5 remaining unit prompts ready: Whisper, Ember, 3 bandits)
- **Miniatures pivot**: game system now assumes minis with sculpted bases (base included in the model, like physical minis). Tripo prompts have a 1000-char limit
- **Debug hooks added**: `BOARD_SCREENSHOT=/path.png` + `BOARD_SCENE=N` + `BOARD_CAM="yaw,pitch,dist[,tx,ty,tz]"` env vars capture board screenshots headless-ish for visual checks
- **Next steps**: generate remaining 5 minis from prompt library; faction-colored ring around sculpted bases (blue disc now hidden under real models); rotate minis to face nearest enemy zone; port combat logic (combatHelpers.js → GDScript) + turn loop; decide when React prototype goes reference-only
