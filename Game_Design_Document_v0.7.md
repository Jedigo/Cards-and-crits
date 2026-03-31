# GAME DESIGN DOCUMENT

*Working Title: TBD*

**A Pack-Based Adventure Card RPG with Dice Combat**

Version 0.7 — Weapon Specialization & Stat-Damage Rules

March 2026

**Status: Early Concept / Phase 1 Prototype Complete**

---

# 1. Vision & Core Pillars

A digital tabletop RPG experience where players purchase booster packs, hero figure packs, and enemy figure packs from a virtual game shop, then design their own adventure runs by choosing their hero, selecting which enemies to face, and curating the narrative, skill, and equipment cards that shape the story. Encounters are resolved through dice-based combat on graph-based zone maps. The player is simultaneously the dungeon master and the adventurer — like a kid on the bedroom floor dumping out all their game boxes to build their own campaign.

## Core Pillars

- **Cards as content delivery:** Booster packs deliver narrative, skills, equipment, environments, and wild cards. Cards define what happens; dice determine how well it goes.
- **Figures as identity:** Hero figure packs deliver playable characters with unique passive abilities. Enemy figure packs deliver foes with their own behaviors and passives. The figure IS the character — art, identity, and mechanic are one package.
- **Player as dungeon master:** Players design their own adventures. They choose their hero, pick which enemies to face, curate the narrative tone, and select their gear. The game doesn't tell you what adventure to go on — you build it. Difficulty is self-selected: harder enemies mean better rewards.
- **Cooldown system:** Loadout cards (equipment, skills) go on cooldown after a run, temporarily unavailable for 1–3 runs based on rarity. Nothing is permanently lost — but you can't spam your best gear every run. This drives collection depth: you need backup options while your favorites recharge. Like a kid whose favorite sword is "lost under the couch" for a few days.
- **Tabletop nostalgia aesthetic:** Inspired by Card Hunter. The game is framed as visiting a brick-and-mortar game shop, buying packs and miniatures, and playing at a table with cardboard standees, felt mats, and physical dice.
- **Dice-driven RPG combat:** Classic RPG feel with dice rolling as the core resolution mechanic. Satisfying animations, sound design, and meaningful risk/reward choices.
- **High replayability:** Roguelike run structure with procedural campaign generation from the player's card collection. Same cards in different order equals a different story.

---

# 2. Core Game Loop

The game follows a cyclical loop centered on the virtual game shop:

1. **Earn currency:** Complete runs (or fail partway) to earn gold based on how far you progressed.
2. **Visit the shop:** Browse four sections: card packs, hero figure packs, enemy figure packs, and starter/campaign packs. Spend gold on purchases.
3. **Open packs:** Crack packs at the counter. Enjoy the reveal. Cards enter your collection; hero and enemy figures join your respective rosters.
4. **Select your party:** Choose 2–3 hero figures from your roster. Equip each with a weapon, armor, and up to 3 flex cards (skills, consumables, accessories).
5. **Design your adventure:** Build the run as a sequence of scenes. Each scene pairs an environment card (the stage), a narrative card (what happens), and optionally enemy figures (who you fight). Choose how many scenes, choose the play mode (Shuffle, Crafted, or Hybrid), and sit down at the table.
6. **Play the run:** Scenes play out one by one. Environment cards set the zone graph. Narrative cards reveal story beats, choices, checks, or trigger combat. Enemy figures appear as standees on the zones. Dice resolve everything.
7. **Loadout cools down, figures persist:** Loadout cards (equipment, skills) used in the run go on cooldown for 1–3 runs based on rarity. Environment and narrative cards are permanent collection pieces. All figures persist. Return to step 1.

---

# 3. Hero Figures & Player Identity

## 3.1 Hero Figures

Player characters are obtained through hero figure packs purchased in the shop — displayed on a dedicated shelf in blister-pack style packaging. Each figure is a complete character package: a class, a unique passive ability, and front/back standee art. The figure IS the character. Players do not pick "warrior" from a menu and then apply a skin; they buy a specific warrior figure that comes with a specific passive.

### Why Figures Are Packs, Not Menu Selections

- **Collection depth:** Players want multiple figures for the same class because different passives suit different strategies. A goblin-slayer warrior and a siege knight warrior are both warriors but play differently.
- **Economy driver:** Figures create a second product line in the shop alongside card packs, doubling the meaningful purchases available.
- **Identity investment:** The figure reveal is its own satisfying moment — spinning the standee around to show front and back art, then flashing the passive ability.
- **Setting-agnostic integration:** A sci-fi marine figure and a fantasy knight figure can both be "warrior class" with different passives and aesthetics. The figure line naturally supports genre variety.

## 3.2 Figure Anatomy

| Component | Description |
|-----------|-------------|
| Standee Art (Front/Back) | 2D illustrated cardboard cutout miniature with tab base. Thick black outlines, muted earthy color palette, slightly stocky stylized proportions. Visible cardboard/paper texture. White die-cut border edge. Art style inspired by Card Hunter. |
| Class | Warrior, Ranger, Rogue, Mage, Healer/Cleric, Tinkerer/Artificer. Determines base stat distribution. |
| Stats | Strength, Dexterity, Intelligence, Constitution. Values range 0–3. Total stat points ~6–7 for common figures, up to ~8 for legendary. Distribution varies by class. |
| Passive Ability | A unique always-on modifier tied to the figure. NOT an active skill — a permanent bonus that shapes how the figure interacts with the game's systems. Examples: "Bonus die when in Engaged zone," "Reduce ranged damage by 1," "Bonus die against creatures smaller than you." |
| Rarity | Common, Uncommon, Rare, Legendary. Rarity may affect total stat points and passive complexity/impact. |

## 3.3 Hero Stats

Four stats, designed to be setting-agnostic and immediately recognizable. Values range 0–3, keeping 2d6 modifiers tight. Every class cares about at least two stats.

| Stat | Governs | Combat Role |
|------|---------|-------------|
| Strength (STR) | Melee attack modifier, physical narrative checks, brute force interactions | Added to **melee damage only** (Graze = 1 + STR, Hit = 2 + STR, etc.). Does NOT apply to ranged damage. |
| Dexterity (DEX) | Ranged attack modifier, initiative/turn order, dodge, stealth, finesse checks | Added to **ranged attack rolls** (hit chance), but does NOT add to ranged damage. Determines who acts first. |
| Intelligence (INT) | Skill card effectiveness, special ability power, narrative card checks, trap detection, information gathering | Added to **magic attack damage** (spell weapons like Fire Bolt use INT instead of STR for damage). In sci-fi settings reads as technical brilliance; in fantasy reads as arcane knowledge. |
| Constitution (CON) | Max HP, damage resistance checks, healing received, endurance, resisting negative status effects from narrative/environment cards | **Max HP = 8 + (CON × 2).** Rest healing = CON × 2. CON checks resist poison, environmental hazards, or narrative card penalties. |

### Stat-to-Damage Summary

| Attack Type | Roll Modifier | Damage Bonus | Example |
|-------------|---------------|--------------|---------|
| Melee (physical weapon) | 2d6 + weapon bonus + zone tags | + STR | Iron Sword: 2d6+1, damage tiers add STR |
| Ranged (physical weapon) | 2d6 + DEX + weapon bonus + zone tags | + 0 (no stat bonus to damage) | Short Bow: 2d6+DEX to hit, flat damage tiers |
| Ranged Magic (spell weapon) | 2d6 + weapon bonus + zone tags | + INT | Fire Bolt: 2d6+1, damage tiers add INT |

### Example Stat Distributions

| Class | STR | DEX | INT | CON | Total |
|-------|-----|-----|-----|-----|-------|
| Warrior | 3 | 1 | 0 | 3 | 7 |
| Ranger | 1 | 3 | 1 | 2 | 7 |
| Rogue | 1 | 3 | 2 | 1 | 7 |
| Mage | 0 | 1 | 3 | 2 | 6 |
| Healer/Cleric | 1 | 1 | 2 | 3 | 7 |
| Tinkerer/Artificer | 1 | 2 | 3 | 1 | 7 |

*Note: These are example base distributions. Individual figures of the same class may have slightly different spreads, creating variety within a class. A "battle-mage" warrior figure could have STR 2, DEX 1, INT 2, CON 2 for a hybrid build.*

## 3.4 Hero Loadout (Per Hero)

Each hero in the party carries 5 equipment/skill card slots into a run:

| Slot | Type | Notes |
|------|------|-------|
| 1 | Weapon (locked) | One weapon matching class specialization (see below). Defines primary attack type. |
| 2 | Armor (locked) | Always one armor piece. Defines damage reduction or defensive bonuses. |
| 3 | Flex | Any card: skill, consumable, accessory, etc. |
| 4 | Flex | Any card |
| 5 | Flex | Any card |

### Weapon Specialization

**Heroes are specialists, not generalists.** Most classes carry only one weapon type in their weapon slot:

| Class | Weapon Slot | Damage Stat | Rationale |
|-------|-------------|-------------|-----------|
| Warrior | Melee weapon only | STR | Frontline fighter, must close distance to deal damage |
| Ranger | Ranged weapon only | 0 (flat damage tiers) | Keeps distance, DEX helps hit but damage is flat |
| Mage | Ranged spell weapon only | INT | Magic weapons carry the `"magic": true` flag and use INT for damage |
| Rogue | Melee OR ranged (player's choice) | STR (melee) or 0 (ranged) | Flexibility IS the rogue's class identity |
| Healer/Cleric | Melee OR ranged spell | STR or INT | Versatile support role |
| Tinkerer/Artificer | Any weapon type | Varies | Equipment specialist, adapts any tech |

**Design rationale:** If every hero could carry both melee and ranged weapons, zone positioning loses its importance. When movement costs your entire turn, choosing to close distance must be a meaningful commitment — not something you skip because you can attack from anywhere. Specialists force real tactical decisions and make party composition matter.

**Gap-filling:** Heroes who need to attack outside their specialty use skill/spell cards in their flex slots (e.g., a Warrior can bring a Charge skill card to close gaps, or a Blink spell to teleport). The answer isn't a second weapon — it's clever loadout building.

### Weapon Data Flag

Weapon cards carry a `"magic": true` flag for spell weapons. This tells the damage system to use INT instead of STR for damage bonus calculation. Physical ranged weapons (bows, guns) have no magic flag and add 0 stat bonus to damage (DEX only affects hit chance).

With a party of 2–3 heroes, the total party loadout is 10–15 cards on cooldown per run. The three flex slots are where deckbuilding meets character building. A warrior might fill flex slots with Shield Bash, Healing Potion, and Charge. A mage might go Fireball, Lightning Bolt, Healing Potion — heavy on skills, light on backup options.

## 3.5 Party Composition

Players select 2–3 hero figures from their roster for each run. This opens up tactical depth on the zone graph: split units across zones for flanking, have the ranger hold the Balcony while the warrior pushes into the Main Floor. Multiple heroes against multiple enemies on a graph map is where the combat system shines.

## 3.6 Classes

Classes define base stat distributions and preferred combat zones. They do NOT restrict skill card usage — anyone can use any skill card. Weapon slots are class-restricted (see 3.4). Multiple figures can share the same class but have different passives and stat variations.

| Class | Role | Preferred Zone | Identity |
|-------|------|----------------|----------|
| Warrior | Frontline melee fighter | Same zone as enemies | High STR/CON, close-the-gap playstyle |
| Ranger | Ranged attacker | Connected zones (adjacent) | High DEX, rewards keeping distance |
| Rogue | Fast, high risk/reward | Mobile (moves between zones) | High DEX/INT, first strike bonuses, glass cannon |
| Mage | Versatile but fragile | Cross-zone abilities | High INT, bends rules, manipulates zones |
| Healer/Cleric | Support / sustain | Same zone as allies | High CON/INT, restores health, buffs dice |
| Tinkerer/Artificer | Wild card / equipment specialist | Any | High INT/DEX, bonus effects from equipment cards |

**Key decision:** Skill cards are unrestricted — any class can use any skill card. Weapon slots are class-restricted to enforce specialization. No skill card is ever "useless" based on your build.

## 3.7 No Leveling — Collection IS Progression

Figures do not gain experience or level up. A freshly pulled figure is at full power immediately. This is a deliberate design decision for several reasons:

- **Preserves figure pack excitement:** If figures leveled up, new figures would feel weak compared to veterans. Every new pull should feel immediately viable.
- **Collection is horizontal progression:** Power grows through breadth of choices (more figures, more cards, more strategic options) not vertical power creep (bigger numbers).
- **Shop expansion as visible growth:** The shop expands, new shelves unlock, better pack types appear, the shopkeeper acknowledges achievements. The player's world gets richer even though individual figures stay the same.
- **Run mastery as bragging rights:** Tracking accomplishments per figure ("This warrior has completed 10 runs") could unlock cosmetic variants or titles — bragging rights, not power creep.

## 3.8 Starter Figures

New players receive a Starter Box (free) containing a small set of hero figures, enemy figures, and enough cards to build a couple basic runs. The shopkeeper walks the player through their first run using this set. The initial hero figure selection should cover the four most universally understood archetypes: Warrior, Ranger, Rogue, and Mage. Healer and Tinkerer figures enter the pool as early unlocks.

---

# 4. Enemy Figures

## 4.1 Enemies as Figures, Not Cards

Enemies are standees on the zone graph just like hero characters — they're the same physical thing in the tabletop fiction. It would feel inconsistent if the player's hero comes in a blister pack but the goblin is just a flat card. Enemy figures are purchased from a dedicated shelf in the shop, separate from hero figures.

## 4.2 Enemy Figure Anatomy

| Component | Description |
|-----------|-------------|
| Standee Art (Front/Back) | Same art style as hero figures: thick black outlines, muted earthy palette, cardboard texture, tab base cutout. Consistent style ensures all figures feel like they came from the same game box. |
| Enemy Type | Defines base stats, preferred zone behavior, and attack patterns. E.g., melee rusher, ranged sniper, area-of-effect caster. |
| Passive / Behavior | Each enemy figure has a unique behavior or passive that defines how it fights. A skeleton warrior "always rushes to player's zone" vs a skeleton archer that "stays in connected zones." Same enemy type, different tactical challenge. |
| Difficulty Tier | Linked to rarity. Common enemies are fodder. Rare enemies are mini-bosses. Legendary enemies are run-defining boss fights. |
| Rarity | Common, Uncommon, Rare, Legendary. Higher rarity enemies are harder but yield better run rewards when defeated. |

## 4.3 Themed Enemy Packs

Enemy figures are sold in themed sets on a dedicated shop shelf. Each themed pack contains a coherent group of enemies that feel like they belong together — like buying a box of minis at an actual game store.

### Example Themed Enemy Packs

| Pack Name | Contents (Examples) | Setting |
|-----------|---------------------|---------|
| Undead Horde | Skeleton warrior, zombie shambler, ghost, wraith, lich (legendary) | Fantasy / Horror |
| Forest Creatures | Wolves, treant, giant spider, forest drake, corrupted dryad (rare) | Fantasy |
| Rogue Machines | Scout drone, combat mech, security turret, hacker bot, rogue AI (legendary) | Sci-Fi |
| Bandit Gang | Thug, archer, knife-thrower, bandit captain (rare), masked kingpin (legendary) | Setting-Agnostic |
| Deep Sea Terrors | Crab swarm, merfolk raider, sea serpent, kraken tentacle, leviathan (legendary) | Fantasy / Horror |
| Frontier Outlaws | Gunslinger, dynamite tosser, rattlesnake, outlaw boss (rare) | Western |

## 4.4 Player Chooses Enemies (Player-as-DM)

When building a run, the player selects which enemy figures from their collection to include. This is a core part of the "player as dungeon master" design philosophy. The player is designing their own adventure — choosing the difficulty, the thematic tone, and the tactical challenges they'll face.

- **Difficulty is self-selected:** Include common goblins for an easy run, or throw in a legendary dragon for a brutal challenge. The tier reward system scales based on the difficulty of enemies included — harder enemies mean better payouts.
- **Thematic curation:** Players who want a coherent fantasy dungeon crawl pick all fantasy enemies. Players who want chaos throw sci-fi robots and undead into the same run. Both are valid.
- **Strategic deckbuilding:** Players consider their hero's passive, their equipment and skill cards, and the enemy behaviors when designing a run. A melee-focused warrior build might avoid packing too many sniper enemies in connected zones.
- **No difficulty toggle:** There is no easy/medium/hard setting. The difficulty is whatever you built. This is emergent and player-driven.

---

# 5. Starter & Campaign Packs

## 5.1 Starter Box

Every new player receives a free Starter Box — the first thing they interact with in the shop. It contains everything needed to learn the game and complete a few initial runs:

- A small set of hero figures (e.g., one common figure per core class, or player's choice of one)
- A handful of common enemy figures (enough for 2–3 basic encounters)
- A starter deck of cards: narrative, skill, equipment, and environment cards
- **Starter gear is permanent** — never goes on cooldown, always available as a safety net
- The shopkeeper walks the player through their first run using this set, serving as the tutorial
- After the tutorial run, the player keeps all Starter Box contents and begins earning gold to buy more

## 5.2 Campaign Packs

Campaign packs are pre-designed themed adventures sold on their own shelf in the shop. They are curated sets of narrative cards, enemy figures, environment cards, and a boss figure, all designed to tell a coherent story arc. They serve players who want a guided experience rather than (or in addition to) free-form sandbox runs.

- **Complete adventure in a box:** A campaign pack like "Tomb of the Lich King" includes everything needed for a multi-run storyline: themed narrative cards with a story arc, a curated set of enemy figures, environment cards, and a legendary boss figure.
- **Premium price point:** Campaign packs cost more gold than standard card or figure packs, but the player gets a guaranteed curated experience.
- **Reusable contents:** Once the campaign is played through, all figures remain in the player's collection permanently. All cards are permanent collection pieces reusable in future runs.
- **Two play styles coexist:** The creative sandbox player ignores campaigns and builds wild custom runs. The story-driven player buys campaign packs for guided adventures. Both players are in the same shop spending the same gold.
- **Content expansion vehicle:** New campaign packs are a natural DLC/content update format. Each one introduces a new storyline, new enemies, and new narrative cards that enrich the overall card pool.

### Example Campaign Packs

| Campaign Pack | Theme | Contents |
|---------------|-------|----------|
| Tomb of the Lich King | Fantasy / Undead | 12 narrative cards (story arc), 6 undead enemy figures, 3 environment cards, 1 legendary lich boss figure |
| Station Zero | Sci-Fi / Horror | 10 narrative cards, 5 rogue machine enemy figures, 4 environment cards, 1 legendary rogue AI boss figure |
| The Last Frontier | Western | 10 narrative cards, 5 outlaw enemy figures, 3 environment cards, 1 legendary masked bandit boss figure |

---

# 6. Skills System

## 6.1 Passive Skills (From Figures)

Each figure has one or two passive abilities that are always active during a run. These are not chosen or equipped — they are inherent to the figure. Passives define the figure's identity and create strategic differentiation between figures of the same class.

### Example Passives by Class

| Figure Name (Example) | Class | Passive |
|-----------------------|-------|---------|
| Ironwall Knight | Warrior | Reduce incoming melee damage by 1 in same zone |
| Goblin Slayer | Warrior | Bonus die against creatures smaller than you |
| Siege Breaker | Warrior | First attack each encounter ignores 1 armor |
| Shadow Archer | Ranger | Bonus die when attacking from connected zone |
| Trapper | Ranger | Enemies moving toward you must pass a dice check |
| Phantom Blade | Rogue | Bonus die on first attack each encounter |
| Alley Rat | Rogue | Can move 2 zones per turn instead of 1 |
| Storm Caller | Mage | Environment cards you play gain +1 to their effect |
| Runeweaver | Mage | Skill cards cost 1 less resource to play |
| Field Medic | Healer | Restore 1 health at the end of each encounter |
| Jury-Rigger | Tinkerer | Equipment cooldowns reduced by 1 run |

## 6.2 Active Skills (From Card Packs)

All active skills — offensive abilities, defensive maneuvers, spells, special attacks — come from skill cards found in booster packs. They go on cooldown after a run like other loadout cards. They are equipped in flex slots and used during encounters.

Any class can use any skill card. However, a figure's passive may synergize better with certain skill types. A warrior CAN use a fireball skill card, but a mage with the "Runeweaver" passive (skill cards cost 1 less) gets more value from it. This creates soft class affinity without hard restrictions.

### Skill Card Examples

| Skill Card | Effect | Rarity |
|------------|--------|--------|
| Shield Bash | Melee attack that pushes enemy 1 zone outward | Common |
| Sneak Attack | Double damage if you moved this turn | Uncommon |
| Fireball | Hits all enemies in one zone, medium damage | Rare |
| Healing Touch | Restore health to self, usable from any zone | Common |
| Overcharge | Next equipment card used has double effect | Rare |
| Time Slip | Take an extra action this turn | Legendary |
| Charge | Move to an adjacent zone AND melee attack (same turn) | Uncommon |
| Blink | Teleport to any zone on the map (ignores engagement) | Rare |

**Design principle:** Passives define WHO you are (from figures). Active skills define WHAT you can do (from card packs). This split means figure collection adds strategic depth while card collection adds tactical options.

---

# 7. Run Structure & Scenes

A run is a sequence of scenes. Each scene is a self-contained moment: a location, a story beat, and optionally a combat encounter. The player determines how many scenes make up their run and what goes into each one. This is the core of the player-as-dungeon-master experience.

## 7.1 Scene Anatomy

Each scene is built from up to three components:

| Component | Source | Required? | Role |
|-----------|--------|-----------|------|
| Environment Card | Card collection | Yes (1 per scene) | Sets the stage. Defines the zone graph: how many zones, their names, connections, and tags. This IS the battle mat for this scene. |
| Narrative Card | Card collection | Yes (1 per scene) | What happens here. Could trigger combat, present a choice, deliver a skill check, offer a reward, or introduce a twist. Setting-agnostic — works in any environment. |
| Enemy Figures | Figure roster | Optional (0–3+ per scene) | Who you fight, if combat triggers. Placed on the zone graph when combat begins. Not every scene needs enemies — narrative-only scenes are valid. |

## 7.2 Scene Flow

Each scene plays out in order:

1. **Environment reveals:** The environment card flips, showing the zone graph for this scene. Zone names, connections, and tags are displayed on the tabletop battle mat.
2. **Narrative reveals:** The narrative card flips, revealing its hidden content. The story beat plays out — text is displayed, choices are offered, or combat is triggered.
3. **Resolution:** If combat: enemy figures appear on zones, combat plays out using the 2d6 system with zone movement and engagement rules. If choice: player picks A or B. If check: player rolls d20 against a stat. If event: immediate effect applies.
4. **Aftermath:** Scene resolves. Surviving heroes carry their current health and remaining loadout into the next scene. Proceed to next scene or end run. When the run ends, loadout cards go on cooldown based on rarity.

## 7.3 Play Modes

The same cards and figures support three play modes. The only difference is whether the player arranges their scenes or lets randomness decide:

| Mode | How It Works | Best For |
|------|--------------|----------|
| Shuffle | All environment cards, narrative cards, and enemy assignments are randomized. The player has no idea what's coming next. Scenes are generated by random pairing. | The "kid on the floor" chaos energy. Maximum surprise and replayability. Genre-mashing emergent stories. |
| Crafted | The player builds each scene intentionally on a storyboard. They drag an environment card, a narrative card, and enemy figures into each scene slot, arranging them in their desired order. | The dungeon master fantasy. Designing a coherent themed adventure. Campaign pack play-throughs. |
| Hybrid | The player crafts some scenes (e.g., the opening and the finale) and leaves middle slots as "random scene" wildcards that are filled by shuffle. | Best of both worlds. Authored arc with surprises in the middle. |

The shopkeeper frames the choice naturally: "Want me to shuffle these up for you, or do you want to lay them out yourself?"

## 7.4 Run Length

**The player chooses how many scenes make up their run.** This fits the player-as-DM philosophy: your adventure, your rules, your time commitment.

- **Quick skirmish (2–3 scenes):** Fast, low-risk. Good for learning or short play sessions. Pays out Tier 1–2 rewards.
- **Standard adventure (4–5 scenes):** The default experience. Enough scenes for a narrative arc with rising tension. Pays out Tier 2–3 rewards.
- **Epic quest (6+ scenes):** High risk, high reward. More chances to die, more cards on cooldown afterward, but Tier 4 and bonus rewards are achievable.

## 7.5 Non-Combat Scenes

Not every scene needs combat. Narrative cards that don't trigger enemies create breathing room and variety in a run:

- **Rest scenes:** Heal between fights. A narrative card like "You find a sheltered camp" could restore health to the party (CON × 2 healing).
- **Choice scenes:** A/B decisions that affect later scenes. "The path splits: dark tunnel or lit stairway?"
- **Check scenes:** Pure skill checks with no enemies. "The bridge looks unstable" — roll d20 + DEX to cross safely.
- **Reward scenes:** "You find a cache of supplies" — gain temporary buffs, bonus items, or gold.
- **Twist scenes:** Rare narrative cards that change the rules for remaining scenes. "The ground shakes — all future encounters add the Unstable tag to one zone."

## 7.6 Card Cooldown per Run

After a run, loadout cards (equipment and skill cards from hero slots) go on cooldown based on their rarity. Environment cards, narrative cards, and all figures are permanent collection pieces — never on cooldown, always reusable. Only the gear and skills your heroes carry into combat need to recharge.

| Rarity | Cooldown Duration |
|--------|-------------------|
| Common | 1 run |
| Uncommon | 1 run |
| Rare | 2 runs |
| Legendary | 3 runs |

For a party of 2–3 heroes with 5 loadout slots each, a run puts 10–15 loadout cards on cooldown. This means the player needs collection depth — multiple good weapons, varied skill cards, backup options — to sustain consecutive runs without falling back on starter gear. This is what drives pack-buying: not restocking lost cards, but expanding your rotation.

## 7.7 Genre Mixing in Scenes

Because narrative cards are setting-agnostic and environment cards define the location, genre mixing happens naturally at the scene level. Scene 1 might pair an "Abandoned Tavern" environment with fantasy goblin enemies. Scene 2 might pair a "Space Station Corridor" environment with combat mechs. Scene 3 might bring everything together in a "Forest Clearing" where the goblins and mechs are fighting each other. The scenes don't need to make narrative sense — that's the kid-on-the-floor energy. Or in crafted mode, the player can build a coherent single-genre adventure. Both work.

---

# 8. Card Types & Pack Structure

## 8.1 Card Types

| Card Type | Purpose | Examples |
|-----------|---------|----------|
| Narrative | Scene setters, story beats, plot twists, branching choices. Hidden mechanic revealed during play. Card face shows a cryptic teaser; full effect is secret until encountered. | "The river runs red before the festival begins" — "A stranger offers a deal" — "The ground shakes beneath you" |
| Equipment | Weapons, armor, tools, consumable items. Provide stat modifiers and special dice effects. Any class can use any equipment (weapon slot is class-restricted). Weapons may carry a `"magic": true` flag indicating they use INT for damage instead of STR. | Magic sword, plasma rifle, healing potion, shield, sniper scope, enchanted cloak, Fire Bolt staff |
| Skill | Active abilities used during encounters. Offensive, defensive, utility. Any class can use any skill card. | Shield Bash, Fireball, Sneak Attack, Healing Touch, Time Slip, Charge, Blink |
| Environment | Defines the zone graph for a scene. Specifies zone names, connections, and zone tags. One environment card per scene. This IS the battle mat. | "Abandoned Tavern" (Balcony ↔ Main Floor ↔ Bar, Main Floor ↔ Back Room), "Space Station Corridor" (Airlock ↔ Command Deck ↔ Cargo Bay) |
| Wild | Rare rule-breakers. Powerful single-use effects that can dramatically alter a run. | Reroll any failed check. Duplicate another card. Revive on death. Skip an encounter. Double rewards. |

## 8.2 Hidden Information

Cards show partial information when building a run. The player sees the card's title, rarity, type, and a short thematic descriptor. The full mechanical effect and narrative text are hidden and revealed only during play. Rarity affects how much is hidden: common cards reveal most of their info upfront, while legendary cards show almost nothing — just a cryptic title and rarity glow.

## 8.3 Pack Structure

Every pack has a guaranteed card-type spread, but rarity is rolled per slot:

**Standard Card Pack (5 cards):** 1 Narrative, 1 Skill, 1 Equipment, 1 Environment, 1 Wild/Bonus (random type)

Each slot independently rolls for rarity: Common, Uncommon, Rare, or Legendary. Most pulls are Common/Uncommon, but any slot can hit Rare or Legendary.

### Themed Packs

Same 5-card structure but with weighted distributions. Examples: a "Treasure Pack" weights toward equipment; a "Lorekeeper Pack" guarantees an extra narrative card; a "Spellbook Pack" weights toward skill cards. Themed packs may cost more gold.

### Figure Packs (Hero & Enemy)

Sold on separate dedicated shelves from card packs. Hero figure packs and enemy figure packs are on different shelves so players can target what they need. Each figure pack contains one figure with its designation, passive/behavior ability, and front/back standee art. Figure packs have their own rarity tiers. Displayed in blister-pack style packaging.

### Pity System

After X packs without a Rare or higher pull, the next pack guarantees one. Applies to both card packs and figure packs independently. Prevents frustration from extended bad luck streaks. Exact threshold TBD during playtesting.

### Rarity Tiers

| Rarity | Visual Indicator | Info Visibility | Drop Rate (Approx) |
|--------|------------------|-----------------|---------------------|
| Common | Plain border | Most info visible | ~60% |
| Uncommon | Silver border/glow | Some info hidden | ~25% |
| Rare | Gold border/glow | Mostly hidden | ~12% |
| Legendary | Prismatic/animated border | Nearly all hidden — cryptic title only | ~3% |

---

# 9. Cooldown System & Economy

## 9.1 Cooldown, Not Consumption

Nothing in the player's collection is permanently destroyed. Instead, loadout cards (equipment and skill cards equipped to heroes) go on cooldown after a run. They're temporarily unavailable for 1–3 subsequent runs based on rarity, then return to full availability. Environment cards, narrative cards, wild cards, and all figures are always available — they are permanent collection pieces.

This system is inspired by the tabletop metaphor: your favorite sword isn't destroyed after a game — it's just "lost under the couch" for a few days. You still own it. It'll turn up. In the meantime, you use something else.

### Cooldown by Rarity

| Rarity | Cooldown Duration | Design Rationale |
|--------|-------------------|------------------|
| Common | 1 run | Quick rotation, always nearly available |
| Uncommon | 1 run | Same as common — reliable workhorse gear |
| Rare | 2 runs | Powerful but requires planning around downtime |
| Legendary | 3 runs | Game-changing effects balanced by longest cooldown |

### What's Permanent vs. What Cools Down

| Card/Figure Type | After a Run |
|------------------|-------------|
| Hero Figures | Always available. Never on cooldown. |
| Enemy Figures | Always available. Never on cooldown. |
| Environment Cards | Always available. Permanent collection pieces. |
| Narrative Cards | Always available. Permanent collection pieces. |
| Wild Cards | Always available. Permanent collection pieces. |
| Equipment Cards (loadout) | On cooldown for 1–3 runs based on rarity. |
| Skill Cards (loadout) | On cooldown for 1–3 runs based on rarity. |
| Starter Gear | Never on cooldown. Always available as a permanent safety net. |

## 9.2 Why Cooldown Drives Pack Buying

With 10–15 loadout cards going on cooldown per run (5 slots × 2–3 heroes), players need collection depth to sustain consecutive runs. If your Flame Blade is on cooldown for 2 runs, you need a backup weapon. If your Fireball skill is cooling down, you need alternative skill cards. The motivation to buy packs isn't "I lost my stuff" — it's "I need more options in my rotation." Every pack opened adds resilience to the player's ability to run back-to-back adventures.

> **Open question:** Does cooldown trigger on all cards brought on the run, or only cards actually used in combat? "All cards brought" is simpler to track and makes loadout selection more strategic. "Only used" is more forgiving but may encourage hoarding flex slots with just-in-case cards. TBD via playtesting.

> **Open question:** Can certain figure passives reduce cooldown? E.g., a Tinkerer passive: "Equipment cooldowns reduced by 1." This could create an interesting meta-role for Tinkerer figures in party composition. TBD via playtesting.

## 9.3 Economy Model

**No premium currency. No microtransactions.** All packs are earned through gameplay. This is a deliberate design and marketing decision.

Gold is the sole currency, earned through runs:

### Tier-Based Run Rewards

| Tier | Threshold | Reward |
|------|-----------|--------|
| Tier 1 | Survived opening encounters | Small gold reward |
| Tier 2 | Pushed through midgame | Enough gold for a basic pack |
| Tier 3 | Reached the climax | Better packs / rarer pulls |
| Tier 4 | Completed the run | Premium rewards / guaranteed Rare+ cards |
| Bonus | Exceptional achievement (hidden objectives, legendary enemy defeated) | Themed or premium pack drop |

Even failed runs yield rewards. Players always walk away with something. Completing a full run is significantly more rewarding, creating real tension in late-run dice rolls.

### The Shop Economy

The shop has four product sections: card packs, hero figure packs, enemy figure packs, and starter/campaign packs. Players allocate gold across all four based on their strategy and play style. Daily/weekly challenges provide supplemental income and encourage varied play (e.g., "Complete a run using only sci-fi cards" or "Defeat 3 legendary enemies in a single run").

### Content Expansion

New themed pack sets and figure lines function as natural DLC/content updates. A "Frozen North" set introduces cold-weather narratives, frost enemies, fur equipment, and new figures with cold-themed passives. Existing cards and figures remain compatible. The pool simply gets richer over time.

---

# 10. Combat System (Validated in Prototype)

*Note: This section reflects the combat system as built and tested in the Phase 1 React prototype. These mechanics are validated through playtesting, not theoretical.*

## 10.1 Graph-Based Zone Combat

Combat takes place on a graph of named locations (zones) connected to each other, inspired by Dungeon Craft's "Ultimate Dungeon Terrain," Fate RPG, and Index Card RPG. Each encounter consists of 3–5 named zones arranged in a connected graph — not abstract range bands or a grid.

### Example Encounter: Tavern Brawl

Balcony ↔ Main Floor ↔ Bar, Main Floor ↔ Back Room. Four zones, three connections. The Balcony is elevated (ranged bonus), the Back Room has cover (reduced incoming ranged damage). The layout tells a story and creates tactical decisions before a single die is rolled.

### Zone Rules

- **Same zone:** Both melee and ranged attacks are allowed
- **Connected zone:** Ranged attacks only
- **Not connected:** Out of range entirely — must move closer
- **Movement:** Moving between connected zones costs the entire turn (1 action per turn)

### Zone Tags

Each zone carries tags that modify combat. Environment cards from booster packs define what zones look like and what tags they carry.

| Tag | Effect |
|-----|--------|
| Elevated | +1 ranged attack modifier |
| Cover | -1 incoming ranged damage |
| Shadowed | Bonus d8 on critical hits |
| Tight | Limits movement options or imposes penalties |
| Open | No cover, full exposure |

## 10.2 Engagement & Retreat

- **Engagement:** If opposing units share a zone, they are engaged
- **Locked in combat:** Engaged units cannot freely move — must use a full-turn Retreat action
- **Opportunity attacks:** Retreating provokes a free opportunity attack from one enemy in the zone
- **Design purpose:** Prevents infinite kiting and makes closing distance a meaningful commitment

## 10.3 Dice System (2d6 Tier-Based)

Core attack: roll 2d6 + modifiers. Damage is determined by the result tier:

| Roll Total | Result | Damage |
|------------|--------|--------|
| 2–5 | Miss | 0 |
| 6–8 | Graze | 1 + stat bonus |
| 9–10 | Hit | 2 + stat bonus |
| 11 | Strong Hit | 3 + stat bonus |
| 12+ | Critical | 4 + stat bonus |

**Stat bonus by attack type:** STR for melee weapons, INT for magic weapons (`"magic": true`), 0 for physical ranged weapons (bows, guns — DEX adds to hit roll, not damage).

Modifiers shift the 2d6 total (weapon bonuses, zone tag bonuses, stat modifiers). No extra dice are rolled on every attack — keeping the core loop fast.

### Special Dice for Special Moments

**Design principle:** "Different dice create interesting moments — not extra steps." Other dice appear only for specific triggered effects:

| Die | Used For |
|-----|----------|
| d4 | Shield block amount |
| d6 | Healing potion recovery |
| d8 | Shadowed zone crit bonus damage |
| d10/d12 | Legendary weapon/ability effects (planned) |
| d20 | Skill checks, narrative card resolutions, interactions (planned) |

## 10.4 Enemy AI Behaviors

Each enemy figure has a behavior type that determines how it moves and fights on the zone graph:

- **Aggressive:** Charges toward the player's zone. Melees when sharing a zone. Simple, direct threat.
- **Ranged:** Shoots from connected zones. If the player enters their zone (engaged), the archer must choose: spend a turn retreating (provoking an opportunity attack from the hero) OR fight at melee with a -2 penalty if cornered with nowhere to retreat.
- **Additional behaviors planned:** Defensive (holds position with cover bonus), support (buffs other enemies), ambush (hidden until triggered), boss (multi-phase with zone manipulation).

## 10.5 Encounter Scaling

| Encounter Type | Zone Count | Pacing |
|----------------|------------|--------|
| Simple (common enemies) | 3 zones | Fast, resolved in a few rounds |
| Standard (uncommon) | 3–4 zones | More positioning decisions |
| Complex (rare enemies) | 4–5 zones | Tactical depth, flanking opportunities |
| Boss (legendary) | 4–5 zones, may change mid-fight | Dynamic — zones added/blocked by boss abilities |

---

# 11. Visual Style & Aesthetic

## 11.1 The Game Shop

The meta-game takes place in a virtual brick-and-mortar game shop. The player browses shelves, buys packs and figures, opens them at the counter, and sits down at a table to play. The shop is the hub, the UI, and the progression system.

- Shop starts small and sparse. As the player progresses and earns gold, the shop expands: new shelves, themed pack sections, a glass display case for premium figure packs, better dice, posters tracking best runs
- Four distinct product sections: card packs on one shelf, hero figure packs on another, enemy figure packs on a third, and starter/campaign packs in a featured display area
- A shopkeeper character provides personality, tutorials, commentary on purchases and run results, and hints at new stock. Serves as the game's narrative anchor
- Pack opening happens at the counter with full reveal ceremony: glow, flip animations, rarity sparkles. Figure reveals include a spinning standee showcase

## 11.2 The Tabletop

Gameplay takes place on a tabletop rendered in 2.5D isometric view (inspired by Card Hunter). The table features:

- **Cardboard standee miniatures:** 2D illustrated characters with cardboard tab bases, positioned in 3D space. Flat art that faces the camera with small shadows. Animations are minimal and tactile: wobble, shake on hit, tip-over on death. Front/back art shown based on facing direction.
- **Felt/leather battle mat:** The zone graph rendered as a physical mat with named location areas connected by paths. Each zone is a distinct area on the tabletop.
- **Physical dice:** Rendered to look like real dice with wear and character. Satisfying roll physics and sound.
- **Handmade aesthetic:** Everything looks like someone set up a game on a table. Pencil-drawn character sheets, hand-lettered cards, slightly rough edges. The aesthetic is forgiving and charming.

## 11.3 Art Style Reference

The established art style for standees uses: thick black outlines, muted earthy color palette, slightly stocky stylized proportions, visible cardboard/paper texture on the figure, a white die-cut border edge, and a tab base cutout between the feet. All figures (player characters and enemies) maintain this consistent style to feel like they came from the same game box.

### Why This Aesthetic Works

Genre mixing feels natural because it's all cardboard and imagination — a robot fighting a dragon on a pirate ship is just a kid throwing all their sets together. The 2D standee art is faster to produce than 3D models (and AI image generation can assist). No walk cycles, rigging, or complex animations needed. The roughness is a feature, not a limitation.

---

# 12. Setting & Genre Mixing

**Key decision: Settings are freely mixable.** There is no hard genre filter. Players can combine fantasy, sci-fi, horror, western, and any other themed cards in the same run deck. A rogue with a plasma rifle fighting a necromancer in a saloon is a valid and encouraged scenario.

Pack sets and figure lines are themed (fantasy packs contain fantasy content, sci-fi packs contain sci-fi content), but nothing prevents mixing them. This maximizes the value of every card and figure and creates emergent genre-blending moments that players will share and discuss.

---

# 13. AI Content Generation Strategy

As a solo developer project, AI is leveraged at multiple levels to achieve content volume:

- **Design-time generation:** Use LLMs (Claude, ChatGPT, etc.) to batch-generate card databases: narrative prompts, enemy stat blocks, equipment descriptions, skill card effects, figure passive abilities, flavor text. Developer curates and tweaks.
- **Art generation:** AI image generation for standee illustrations (front/back) and card art. The cardboard cutout aesthetic is forgiving of AI art's limitations. Consistent style achieved through master prompts with established style reference images.
- **Runtime narrative generation (stretch goal):** A local LLM (e.g., Ollama on Project NOMAD) could dynamically flesh out encounter text during play. Cards provide the skeleton; the LLM generates contextual narrative based on preceding cards, setting, and character. Every playthrough reads differently even with identical cards.
- **Hybrid approach recommended:** Hand-crafted cards for the core set, AI-generated cards for expansion content, light runtime generation for flavor text and scene transitions.

---

# 14. Prototype Plan

A React-based prototype will be built first to validate core mechanics before committing to a game engine. The prototype is intentionally ugly — it tests feel, not visuals.

### Phase 1 — Dice & Combat (COMPLETE)

Tavern Brawl encounter with 4 graph-based zones (Balcony, Main Floor, Bar, Back Room). 2 enemies with distinct AI behaviors (Bandit Brute — aggressive, Bandit Archer — ranged). Hero with passive ability, equipment loadout, target selection. 2d6 tier-based combat with color-coded combat log and dice tray showing bonus dice. Engagement and retreat mechanics. Zone tags (elevated, cover, shadowed). Validated: combat loop is satisfying, zones create interesting positioning decisions, 2d6 tier system is fast and readable.

### Phase 2 — Run Structure

Scene-based run system with environment + narrative + enemy figure scenes. Shuffle/Crafted/Hybrid play modes. Scene flow with reveals and resolution. Non-combat scenes (rest, choice, check, reward, twist). Validates: does the scene-based adventure flow work?

### Phase 3 — Deckbuilding & Packs

Collection screen showing cards and figures. Pack opening screen with one-at-a-time reveal. Figure selection screen. Run-building storyboard for crafted mode. Gold tracking. Cooldown tracking UI. Validates: does the economy loop feel right? Is building a run from your collection engaging?

### Phase 4 — Polish & Tuning

Tweak numbers: health pools (8 + CON × 2), dice counts, target numbers, cards per run, gold per tier, pack prices, figure passive balance, cooldown durations. This is where the fun is found through iteration.

### Prototype Tech Stack

React + Vite. Plain CSS or Tailwind. Game state in useReducer or Zustand. Card and figure data as JSON files for hot-swapping during balance testing. No backend needed — everything runs client-side with local storage for persistence between sessions.

---

# 15. Production Target

After the React prototype validates core mechanics, the game will be rebuilt in a proper game engine for Steam release.

**Recommended engine: Godot.** Free, open source, no revenue share, excellent 2D/2.5D support, exports to Steam natively. Lightweight and component-based. Strong community and tutorial ecosystem. The 2D tooling is well-suited for isometric standee rendering and graph-based zone combat.

---

# 16. Open Design Questions

The following questions remain unresolved and should be addressed during prototyping:

| Question | Options Under Consideration | Priority |
|----------|----------------------------|----------|
| Persistent character vs. roguelike? | Pure roguelike (fresh each run) vs. hybrid (roguelike runs with persistent meta-layer via collection growth). No leveling confirmed — collection IS progression. | High |
| Cooldown trigger scope? | Does cooldown apply to all loadout cards brought on a run, or only cards actually used in combat? Simpler vs. more forgiving. Needs playtesting. | High |
| Cooldown-reducing passives? | Can figure passives like Tinkerer's reduce cooldown duration? Creates meta-role for certain figures in party comp. | Medium |
| Run deck building rules? | How many cards and enemy figures per run? Minimum/maximum per type? What constraints feel right without limiting the player-as-DM freedom? | Medium |
| Starter Box contents? | How many free hero figures, enemy figures, and cards? Enough for 2–3 runs? Player's choice or fixed set? | Medium |
| Enemy figure behavior system? | How complex should enemy AI/behavior be beyond aggressive/ranged? Defensive, support, ambush, boss multi-phase patterns? | Medium |
| Campaign pack structure? | How many runs per campaign? Linear story or branching? Can campaign narrative cards be played in any order or are they numbered? | Medium |
| Difficulty-to-reward scaling? | How does including harder enemy figures scale tier rewards? Linear or exponential? Bonus multiplier for legendary enemies? | Medium |
| Figure passive balance? | How impactful should passives be? Subtle nudges vs. build-defining? Rarity correlation with power? | Medium |
| Pack earn rate tuning? | How much gold per tier? Pricing for card packs vs. hero figure packs vs. enemy figure packs vs. campaign packs? Needs extensive playtesting. | Medium |
| Zone reveal / fog of war? | Should enemies be hidden and revealed as the party progresses inward through zones? How does this interact with the player-as-DM model where they chose the enemies? | Medium |
| How do environment cards define zones? | At run-build time, do players place environment cards to define zone layouts and tags? Or are zones procedurally generated from the environment cards in the deck? | Medium |
| Class passive interactions with zones? | How do class-specific abilities interact with zones? E.g., Rogue moving + acting same turn, Ranger bonuses from adjacent zone attacks. | Medium |
| Pity system threshold? | How many packs before guaranteed rare? Separate thresholds for card packs and figure packs? | Low |
| Working title? | TBD — needs a name that evokes tabletop nostalgia, card collecting, and the player-as-DM fantasy | Low |
