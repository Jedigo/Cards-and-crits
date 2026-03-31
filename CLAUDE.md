# RPG Card Game Prototype

Pack-based adventure card RPG with dice combat and a tabletop aesthetic. See `Game_Design_Document_v0.7.md` for the full GDD.

## Project Structure

```
prototype/          — React + Vite Phase 2 combat + run prototype
  src/
    data/gameData.json       — All game data (heroes, environments, scenes, enemies, equipment, dice tiers, zone tags)
    state/
      runReducer.js          — Run-level state machine (hero select → scene intro → combat/rest → scene complete → run end)
      combatHelpers.js       — Extracted pure combat functions (attack resolution, dice, zone helpers, passives)
      gameReducer.js         — Phase 1 legacy reducer (unused, kept as reference)
    components/
      RangeBandDisc.jsx      — Zone map SVG (dynamic layout, multi-hero standees)
      ActionBar.jsx           — Player actions (move, retreat, attack, equipment, end turn) — multi-hero aware
      DiceRoller.jsx          — Dice tray display (2d6 + bonus dice + d20 for skill checks)
      HealthBar.jsx           — HP bars with passive display
      CombatLog.jsx           — Scrolling combat event log
      HeroSelect.jsx          — Hero picker (choose 2 of 4 starter heroes)
      SceneIntro.jsx          — Scene title card with narrative text
      SceneComplete.jsx       — Scene outcome + continue flow
      PartyBar.jsx            — Party HP display with active hero indicator
      RestScene.jsx           — Rest + skill check scene UI
```

## Commands

```bash
cd prototype && npm run dev    # Start dev server (localhost:5173)
cd prototype && npx vite build # Production build
```

## Key Design Decisions

### Combat Zones
- Graph-based location system (not abstract range bands)
- Zones are named places with tags and connections
- Same zone = melee + ranged; connected zone = ranged only; not connected = out of range
- Moving between zones costs your entire turn (1 action per turn)
- Engagement: if enemies share your zone, you're engaged and can't freely move — must Retreat (provokes opportunity attack)

### Dice System
- 2d6 attack roll with tier-based damage (Miss/Graze/Hit/Strong Hit/Critical)
- Modifiers shift the 2d6 total (weapon bonuses, zone tag bonuses)
- Other dice (d4, d6, d8, d10, d12, d20) appear for special moments only (healing, blocking, crit bonuses, skill checks)
- No separate damage roll on normal attacks — tier determines base damage + stat bonus
- Stat bonus by attack type: STR (melee), INT (magic ranged via `"magic": true` flag), 0 (physical ranged — DEX boosts roll, not damage)

### Enemy AI Behaviors
- `aggressive`: charges toward player, melees in same zone
- `ranged`: shoots from connected zones, retreats if engaged (costs their turn + provokes opportunity attack), fights with penalty if cornered

### Hero Party & Stats
- 2–3 heroes per run, each with 5 loadout slots (1 weapon, 1 armor, 3 flex)
- 4 stats: STR, DEX, INT, CON (range 0–3)
- 6 classes: Warrior, Ranger, Rogue, Mage, Healer/Cleric, Tinkerer/Artificer
- **Weapon specialization**: heroes are specialists, not generalists (Warrior = melee only, Ranger = ranged only, Mage = spells only, Rogue = both). Gap-filling comes from skill/spell cards in flex slots, not redundant weapons
- Equipment is unrestricted — any class can use any card
- Figure passives define identity; active skills come from card packs

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

### 2026-03-29
- Scaffolded React + Vite prototype (Phase 1: Dice & Combat)
- Iterated through 4 zone system designs: 4-band concentric rings → relative range → Here/There → graph-based named locations. Settled on **graph-based zones** inspired by Dungeon Craft's "Ultimate Dungeon Terrain" / Fate RPG / ICRPG zones
- Zones are connected locations (e.g., Tavern: Balcony, Main Floor, Bar, Back Room) with tag-based modifiers (elevated, cover, shadowed, etc.)
- Movement costs entire turn (1 action per turn) — decided to keep flexible (can double-move or double-attack)
- Added **engagement rules**: enemies in your zone lock you down, retreating provokes opportunity attacks. Fixes infinite kiting by ranged enemies
- Reworked **archer AI**: retreats when engaged (costs turn + provokes attack), fights with penalty if cornered, shoots from adjacent zones, repositions if too far
- Replaced hit-count dice system with **2d6 tier-based damage** (Miss/Graze/Hit/Strong Hit/Critical) — no separate damage roll
- Other dice types (d4, d6, d8, d10, d12, d20) reserved for special moments: healing potions (d6), shield blocks (d4), shadowed crit bonus (d8)
- Built multi-enemy encounter (Bandit Brute + Bandit Archer) with target selection
- Created CLAUDE.md and `/close-session` custom command
- Set up memory system with project overview
- **Next steps**: Continue playtesting combat feel, consider zone reveal/fog-of-war (Phase 2), balance damage tiers and enemy stats

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
