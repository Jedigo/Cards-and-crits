import gameData from '../data/gameData.json';
import {
  rollDie, roll2d8, getZone, isConnected, isHeroEngaged,
  getZoneTags, getTagEffect, getTier, addLog,
  resolveAttack, makeDiceState, formatRoll,
  applyDefensivePassive, applyOffensivePassive, getKeenEyeBonus,
  getMaxHp, getArmorReduction, getHoldTheLinePenalty, applySmokeBomb, resolveSkillEffect,
} from './combatHelpers.js';

const { tagEffects } = gameData;

// --- Helpers ---

function getEnvironment(id) {
  return gameData.environments.find(e => e.id === id);
}

function getNarrative(id) {
  return gameData.narratives.find(n => n.id === id);
}

function getSceneData(index) {
  return gameData.scenes[index];
}

// --- Initial state ---

export function createInitialState() {
  return {
    phase: 'hero_select',
    party: [],
    partyInventory: [],
    currentSceneIndex: 0,
    scenes: gameData.scenes,

    // Scene-level state (populated when scene is active)
    scene: null,

    log: [{ text: 'Welcome to the Starter Box! Choose your heroes.', type: 'narrative' }],
  };
}

// --- Scene initialization ---

function initCombatScene(sceneData, party, partyInventory, log) {
  const env = getEnvironment(sceneData.environmentId);
  const narrative = getNarrative(sceneData.narrativeId);

  const heroes = party.map((hero, i) => ({
    ...hero,
    equipment: hero.equipment.map(e => ({ ...e, usesLeft: e.uses ?? Infinity })),
  }));

  // Add any party inventory items to first hero's equipment
  if (partyInventory.length > 0) {
    heroes[0] = {
      ...heroes[0],
      equipment: [
        ...heroes[0].equipment,
        ...partyInventory.map(item => ({ ...item, usesLeft: item.uses ?? 1 })),
      ],
    };
  }

  const enemies = sceneData.enemies.map(e => ({
    ...e,
    hp: e.stats.maxHp,
    zoneId: e.startZone,
  }));

  const heroZones = {};
  heroes.forEach(h => { heroZones[h.id] = env.playerStart; });

  return {
    type: 'combat',
    environment: env,
    narrative,
    combatPhase: 'player_turn',
    turn: 1,
    activeHeroIndex: 0,
    heroZones,
    heroes,
    enemies,
    selectedTarget: enemies[0]?.id || null,
    dice: { results: [], bonusDice: [], total: 0, tier: '', damage: 0 },
    smokeBombActive: false,
    warCryActive: false,
    tauntHeroId: null,
  };
}

function initRestAndCheckScene(sceneData, party, log) {
  const env = getEnvironment(sceneData.environmentId);
  const narrative = getNarrative(sceneData.narrativeId);

  return {
    type: 'rest_and_check',
    environment: env,
    narrative,
    restPhase: 'resting', // resting → check_ready → check_rolling → check_done → complete
    heroes: party.map(h => ({ ...h })),
    healAmounts: null,
    checkHeroIndex: null,
    checkResult: null,
    checkStat: sceneData.checkStat,
    checkDC: sceneData.checkDC,
    checkDescription: sceneData.checkDescription,
    checkSuccess: sceneData.checkSuccess,
    checkFailure: sceneData.checkFailure,
    checkReward: sceneData.checkReward,
  };
}

// --- Enemy AI (multi-hero version) ---

function resolveEnemyTurns(scene, log) {
  let { enemies, heroZones } = scene;
  const zones = scene.environment.zones;
  let lastDiceState = scene.dice;
  const smokePenalty = scene.smokeBombActive ? -2 : 0;

  // Deep copy heroes so we never mutate the originals
  const heroCopies = scene.heroes.map(h => ({ ...h }));
  const livingHeroes = heroCopies.filter(h => h.hp > 0);
  if (livingHeroes.length === 0) return { scene, log };

  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    if (livingHeroes.every(h => h.hp <= 0)) return enemy;

    // Taunt override: if a hero taunted, enemies must target them if reachable
    const tauntHero = scene.tauntHeroId
      ? livingHeroes.find(h => h.id === scene.tauntHeroId && h.hp > 0)
      : null;

    // Find nearest hero target: same zone > connected zone, prefer lowest HP
    const sameZoneHeroes = livingHeroes.filter(h => h.hp > 0 && heroZones[h.id] === enemy.zoneId);
    const connectedHeroes = livingHeroes.filter(h =>
      h.hp > 0 && heroZones[h.id] !== enemy.zoneId && isConnected(zones, enemy.zoneId, heroZones[h.id])
    );

    let targetHero;
    if (tauntHero && (heroZones[tauntHero.id] === enemy.zoneId || isConnected(zones, enemy.zoneId, heroZones[tauntHero.id]))) {
      targetHero = tauntHero;
    } else {
      targetHero = sameZoneHeroes.sort((a, b) => a.hp - b.hp)[0]
        || connectedHeroes.sort((a, b) => a.hp - b.hp)[0];
    }

    if (!targetHero) {
      // No reachable hero — try to move closer
      if (enemy.behavior === 'aggressive') {
        const zone = getZone(zones, enemy.zoneId);
        const nearest = livingHeroes.reduce((best, h) => (!best || h.hp < best.hp) ? h : best, null);
        if (nearest) {
          const nextZone = zone.connections.find(c => c === heroZones[nearest.id])
            || zone.connections.find(c => isConnected(zones, c, heroZones[nearest.id]))
            || zone.connections[0];
          if (nextZone) {
            log = addLog(log, `${enemy.name} charges into ${getZone(zones, nextZone).name}!`, 'enemy');
            return { ...enemy, zoneId: nextZone };
          }
        }
      }
      if (enemy.behavior === 'ranged') {
        const zone = getZone(zones, enemy.zoneId);
        const nearest = livingHeroes.reduce((best, h) => (!best || h.hp < best.hp) ? h : best, null);
        if (nearest) {
          const reposition = zone.connections.find(c => isConnected(zones, c, heroZones[nearest.id]));
          if (reposition) {
            log = addLog(log, `${enemy.name} repositions to ${getZone(zones, reposition).name}.`, 'enemy');
            return { ...enemy, zoneId: reposition };
          }
        }
      }
      return enemy;
    }

    const targetZone = heroZones[targetHero.id];
    const sameZone = enemy.zoneId === targetZone;
    const connected = isConnected(zones, enemy.zoneId, targetZone);
    const engaged = sameZone;
    const holdPenalty = -getHoldTheLinePenalty(targetHero, enemy, heroCopies, heroZones);

    // --- AGGRESSIVE ---
    if (enemy.behavior === 'aggressive') {
      if (!sameZone) {
        const zone = getZone(zones, enemy.zoneId);
        const nextZone = zone.connections.find(c => c === targetZone)
          || zone.connections.find(c => isConnected(zones, c, targetZone))
          || zone.connections[0];
        if (nextZone) {
          log = addLog(log, `${enemy.name} charges into ${getZone(zones, nextZone).name}!`, 'enemy');
          return { ...enemy, zoneId: nextZone };
        }
      }
      if (sameZone) {
        const result = resolveAttack({
          STR: enemy.stats.STR || 0,
          DEX: enemy.stats.DEX || 0,
          weaponBonus: enemy.stats.damageBonus || 0,
          rollModifier: smokePenalty + holdPenalty,
          isRanged: false,
          attackerZone: enemy.zoneId,
          defenderZone: targetZone,
          zones,
        });
        lastDiceState = makeDiceState(result);
        if (holdPenalty < 0) log = addLog(log, `Hold the Line! -1 to attack roll.`, 'passive');

        let damage = result.damage;
        ({ damage, log } = applyDefensivePassive(targetHero, damage, false, log));
        const armorDR = getArmorReduction(targetHero);
        if (armorDR > 0 && damage > 0) {
          damage = Math.max(0, damage - armorDR);
          log = addLog(log, `Armor absorbs ${armorDR} damage.`, 'defend');
        }

        if (result.tier.damage > 0) {
          targetHero.hp = Math.max(0, targetHero.hp - damage);
          log = addLog(log, `${enemy.name} attacks ${targetHero.name}! ${formatRoll(result)} (${damage} after reduction)`, 'enemy');
        } else {
          log = addLog(log, `${enemy.name} attacks ${targetHero.name}! ${formatRoll(result)}`, 'enemy');
        }
        if (targetHero.hp <= 0) {
          log = addLog(log, `${targetHero.name} falls!`, 'narrative');
        }
      }
      return enemy;
    }

    // --- RANGED ---
    if (enemy.behavior === 'ranged') {
      if (sameZone && engaged) {
        // Try to retreat
        const retreatZone = getZone(zones, enemy.zoneId).connections.find(c => c !== targetZone);
        if (retreatZone) {
          log = addLog(log, `${enemy.name} tries to disengage and retreat!`, 'enemy');
          // Opportunity attack from the hero in this zone
          const meleeWeapon = targetHero.equipment.find(e => e.type === 'weapon' && e.subtype === 'melee');
          const weaponDmgBonus = meleeWeapon ? meleeWeapon.damageBonus : 0;
          const oppResult = resolveAttack({
            STR: targetHero.stats.STR || 0,
            DEX: targetHero.stats.DEX || 0,
            weaponBonus: weaponDmgBonus,
            isRanged: false,
            attackerZone: targetZone,
            defenderZone: enemy.zoneId,
            zones,
          });

          if (oppResult.damage > 0) {
            const newEnemyHp = Math.max(0, enemy.hp - oppResult.damage);
            log = addLog(log, `${targetHero.name} strikes as they flee! ${formatRoll(oppResult)}`, 'attack');
            if (newEnemyHp <= 0) {
              log = addLog(log, `${enemy.name} is cut down trying to escape!`, 'narrative');
              return { ...enemy, hp: 0 };
            }
            log = addLog(log, `${enemy.name} retreats to ${getZone(zones, retreatZone).name}.`, 'enemy');
            return { ...enemy, hp: newEnemyHp, zoneId: retreatZone };
          } else {
            log = addLog(log, `${targetHero.name} swings but misses. ${enemy.name} retreats to ${getZone(zones, retreatZone).name}.`, 'move');
            return { ...enemy, zoneId: retreatZone };
          }
        } else {
          // Cornered
          const result = resolveAttack({
            STR: enemy.stats.STR || 0,
            DEX: enemy.stats.DEX || 0,
            weaponBonus: enemy.stats.damageBonus || 0,
            rollModifier: -2 + smokePenalty + holdPenalty,
            isRanged: false,
            attackerZone: enemy.zoneId,
            defenderZone: targetZone,
            zones,
          });
          lastDiceState = makeDiceState(result);

          let damage = result.damage;
          ({ damage, log } = applyDefensivePassive(targetHero, damage, false, log));
          const armorDR = getArmorReduction(targetHero);
          if (armorDR > 0 && damage > 0) {
            damage = Math.max(0, damage - armorDR);
            log = addLog(log, `Armor absorbs ${armorDR} damage.`, 'defend');
          }

          if (result.tier.damage > 0) {
            targetHero.hp = Math.max(0, targetHero.hp - damage);
            log = addLog(log, `${enemy.name} is cornered and fights back against ${targetHero.name}! ${formatRoll(result)} (${damage} after reduction)`, 'enemy');
          } else {
            log = addLog(log, `${enemy.name} is cornered and flails wildly! ${formatRoll(result)}`, 'enemy');
          }
          if (targetHero.hp <= 0) {
            log = addLog(log, `${targetHero.name} falls!`, 'narrative');
          }
          return enemy;
        }
      }

      if (connected && !sameZone) {
        const result = resolveAttack({
          STR: enemy.stats.STR || 0,
          DEX: enemy.stats.DEX || 0,
          weaponBonus: enemy.stats.damageBonus || 0,
          rollModifier: smokePenalty + holdPenalty,
          isRanged: true,
          attackerZone: enemy.zoneId,
          defenderZone: targetZone,
          zones,
        });
        lastDiceState = makeDiceState(result);
        if (holdPenalty < 0) log = addLog(log, `Hold the Line! -1 to attack roll.`, 'passive');

        let damage = result.damage;
        ({ damage, log } = applyDefensivePassive(targetHero, damage, true, log));
        const armorDR = getArmorReduction(targetHero);
        if (armorDR > 0 && damage > 0) {
          damage = Math.max(0, damage - armorDR);
          log = addLog(log, `Armor absorbs ${armorDR} damage.`, 'defend');
        }

        if (result.tier.damage > 0) {
          targetHero.hp = Math.max(0, targetHero.hp - damage);
          log = addLog(log, `${enemy.name} shoots ${targetHero.name} from ${getZone(zones, enemy.zoneId).name}! ${formatRoll(result)}`, 'enemy');
        } else {
          log = addLog(log, `${enemy.name} shoots at ${targetHero.name} from ${getZone(zones, enemy.zoneId).name}! ${formatRoll(result)}`, 'enemy');
        }
        if (targetHero.hp <= 0) {
          log = addLog(log, `${targetHero.name} falls!`, 'narrative');
        }
        return enemy;
      }

      return enemy;
    }

    // --- DEFAULT ---
    if (sameZone) {
      const result = resolveAttack({
        STR: enemy.stats.STR || 0,
        DEX: enemy.stats.DEX || 0,
        weaponBonus: enemy.stats.damageBonus || 0,
        rollModifier: smokePenalty + holdPenalty,
        isRanged: false,
        attackerZone: enemy.zoneId,
        defenderZone: targetZone,
        zones,
      });
      lastDiceState = makeDiceState(result);
      if (holdPenalty < 0) log = addLog(log, `Hold the Line! -1 to attack roll.`, 'passive');

      let damage = result.damage;
      ({ damage, log } = applyDefensivePassive(targetHero, damage, false, log));
      const armorDR = getArmorReduction(targetHero);
      if (armorDR > 0 && damage > 0) {
        damage = Math.max(0, damage - armorDR);
        log = addLog(log, `Armor absorbs ${armorDR} damage.`, 'defend');
      }

      if (result.tier.damage > 0) {
        targetHero.hp = Math.max(0, targetHero.hp - damage);
        log = addLog(log, `${enemy.name} attacks ${targetHero.name}! ${formatRoll(result)} (${damage} after reduction)`, 'enemy');
      } else {
        log = addLog(log, `${enemy.name} attacks ${targetHero.name}! ${formatRoll(result)}`, 'enemy');
      }
      if (targetHero.hp <= 0) {
        log = addLog(log, `${targetHero.name} falls!`, 'narrative');
      }
    }

    return enemy;
  });

  // heroCopies already contain updated HP from enemy attacks
  const updatedHeroes = heroCopies;

  const allHeroesDead = updatedHeroes.every(h => h.hp <= 0);
  const allEnemiesDead = enemies.every(e => e.hp <= 0);

  let newCombatPhase = 'player_turn';
  if (allHeroesDead) newCombatPhase = 'defeat';
  else if (allEnemiesDead) newCombatPhase = 'victory';

  // Find next living hero for the new turn
  let nextActiveIndex = 0;
  if (newCombatPhase === 'player_turn') {
    for (let i = 0; i < updatedHeroes.length; i++) {
      if (updatedHeroes[i].hp > 0) { nextActiveIndex = i; break; }
    }
    log = addLog(log, `— Turn ${scene.turn + 1} —`, 'turn');
  }

  const updatedScene = {
    ...scene,
    combatPhase: newCombatPhase,
    turn: scene.turn + 1,
    activeHeroIndex: nextActiveIndex,
    heroes: updatedHeroes,
    enemies,
    dice: lastDiceState,
    smokeBombActive: false, // smoke bomb lasts 1 enemy round
    warCryActive: false, // war cry lasts 1 round
    tauntHeroId: null, // taunt lasts 1 enemy round
  };
  updatedScene.selectedTarget = ensureValidTarget(updatedScene);

  return { scene: updatedScene, log };
}

// --- Main reducer ---

export function runReducer(state, action) {
  switch (action.type) {

    // --- Hero Selection ---
    case 'TOGGLE_HERO': {
      const heroId = action.heroId;
      const isSelected = state.party.some(h => h.id === heroId);
      let newParty;
      if (isSelected) {
        newParty = state.party.filter(h => h.id !== heroId);
      } else if (state.party.length < 2) {
        const heroData = gameData.heroes.find(h => h.id === heroId);
        const maxHp = getMaxHp(heroData.stats);
        newParty = [...state.party, { ...heroData, hp: maxHp, stats: { ...heroData.stats, maxHp } }];
      } else {
        return state; // already have 2
      }
      return { ...state, party: newParty };
    }

    case 'START_RUN': {
      if (state.party.length !== 2) return state;
      const loadouts = {};
      state.party.forEach(h => { loadouts[h.id] = { skills: [], consumable: null }; });
      return {
        ...state,
        phase: 'loadout',
        loadouts,
      };
    }

    // --- Loadout ---
    case 'TOGGLE_SKILL_CARD': {
      if (state.phase !== 'loadout') return state;
      const { heroId, cardId } = action;
      const heroLoadout = state.loadouts[heroId];
      const hasCard = heroLoadout.skills.includes(cardId);
      let newSkills;
      if (hasCard) {
        newSkills = heroLoadout.skills.filter(id => id !== cardId);
      } else if (heroLoadout.skills.length < 3) {
        newSkills = [...heroLoadout.skills, cardId];
      } else {
        return state;
      }
      return {
        ...state,
        loadouts: { ...state.loadouts, [heroId]: { ...heroLoadout, skills: newSkills } },
      };
    }

    case 'SET_CONSUMABLE': {
      if (state.phase !== 'loadout') return state;
      const { heroId, cardId } = action;
      const heroLoadout = state.loadouts[heroId];
      const newConsumable = heroLoadout.consumable === cardId ? null : cardId;
      return {
        ...state,
        loadouts: { ...state.loadouts, [heroId]: { ...heroLoadout, consumable: newConsumable } },
      };
    }

    case 'CONFIRM_LOADOUT': {
      if (state.phase !== 'loadout') return state;
      const allReady = state.party.every(h => {
        const lo = state.loadouts[h.id];
        return lo.skills.length === 3 && lo.consumable !== null;
      });
      if (!allReady) return state;

      // Merge skill + consumable cards into hero equipment
      const skillCards = gameData.starterSkillCards;
      const consumableCards = gameData.starterConsumables;
      const updatedParty = state.party.map(h => {
        const lo = state.loadouts[h.id];
        const skills = lo.skills.map(id => skillCards.find(c => c.id === id)).filter(Boolean);
        const consumable = consumableCards.find(c => c.id === lo.consumable);
        const flexCards = consumable ? [...skills, consumable] : skills;
        return { ...h, equipment: [...h.equipment, ...flexCards] };
      });

      const names = updatedParty.map(h => h.name).join(' and ');
      return {
        ...state,
        phase: 'scene_intro',
        currentSceneIndex: 0,
        party: updatedParty,
        log: addLog(state.log, `${names} set out on their adventure!`, 'narrative'),
      };
    }

    // --- Scene Flow ---
    case 'START_SCENE': {
      const sceneData = getSceneData(state.currentSceneIndex);
      const narrative = getNarrative(sceneData.narrativeId);
      let log = addLog(state.log, `— ${sceneData.title} —`, 'turn');
      log = addLog(log, narrative.text, 'narrative');

      let scene;
      if (sceneData.type === 'combat') {
        scene = initCombatScene(sceneData, state.party, state.partyInventory, log);
        const env = scene.environment;
        log = addLog(log, `You enter the ${getZone(env.zones, env.playerStart).name}. Prepare for battle!`, 'narrative');
      } else if (sceneData.type === 'rest_and_check') {
        scene = initRestAndCheckScene(sceneData, state.party, log);
      }

      return { ...state, phase: 'scene_active', scene, log };
    }

    // --- Combat Actions ---
    case 'MOVE': {
      if (!state.scene || state.scene.type !== 'combat') return state;
      if (state.scene.combatPhase !== 'player_turn') return state;
      const { targetZone } = action;
      const scene = state.scene;
      const zones = scene.environment.zones;
      const hero = scene.heroes[scene.activeHeroIndex];
      if (!hero || hero.hp <= 0) return state;
      const heroZone = scene.heroZones[hero.id];

      if (!isConnected(zones, heroZone, targetZone)) return state;
      if (targetZone === heroZone) return state;

      if (isHeroEngaged(heroZone, scene.enemies)) {
        return { ...state, log: addLog(state.log, `${hero.name} is engaged! Use Retreat to disengage.`, 'warning') };
      }

      const zone = getZone(zones, targetZone);
      let log = addLog(state.log, `${hero.name} moves to the ${zone.name}. (Turn spent)`, 'move');

      const newHeroZones = { ...scene.heroZones, [hero.id]: targetZone };
      const newScene = { ...scene, heroZones: newHeroZones };

      // Advance to next hero or enemy turns
      return advanceAfterAction({ ...state, scene: newScene, log });
    }

    case 'RETREAT': {
      if (!state.scene || state.scene.type !== 'combat') return state;
      if (state.scene.combatPhase !== 'player_turn') return state;
      const { targetZone } = action;
      const scene = state.scene;
      const zones = scene.environment.zones;
      const hero = scene.heroes[scene.activeHeroIndex];
      if (!hero || hero.hp <= 0) return state;
      const heroZone = scene.heroZones[hero.id];

      if (!isConnected(zones, heroZone, targetZone)) return state;
      if (targetZone === heroZone) return state;
      if (!isHeroEngaged(heroZone, scene.enemies)) return state;

      let log = addLog(state.log, `${hero.name} retreats from the ${getZone(zones, heroZone).name}!`, 'move');
      let currentHp = hero.hp;

      // Shadow Step: no opportunity attack
      if (hero.passive && hero.passive.name === 'Shadow Step') {
        log = addLog(log, `Shadow Step! ${hero.name} slips away without provoking an attack!`, 'passive');
      } else {
        const attacker = scene.enemies.find(e => e.hp > 0 && e.zoneId === heroZone);
        if (attacker) {
          const result = resolveAttack({
            STR: attacker.stats.STR || 0,
            DEX: attacker.stats.DEX || 0,
            weaponBonus: attacker.stats.damageBonus || 0,
            isRanged: false,
            attackerZone: attacker.zoneId,
            defenderZone: heroZone,
            zones,
          });

          let damage = result.damage;
          ({ damage, log } = applyDefensivePassive(hero, damage, false, log));
          const armorDR = getArmorReduction(hero);
          if (armorDR > 0 && damage > 0) {
            damage = Math.max(0, damage - armorDR);
            log = addLog(log, `Armor absorbs ${armorDR} damage.`, 'defend');
          }

          if (result.tier.damage > 0) {
            currentHp = Math.max(0, currentHp - damage);
            log = addLog(log, `${attacker.name} strikes as ${hero.name} retreats! ${formatRoll(result)} (${damage} after reduction)`, 'enemy');
          } else {
            log = addLog(log, `${attacker.name} swings at ${hero.name} as they retreat — ${formatRoll(result)}`, 'enemy');
          }
        }
      }

      if (currentHp <= 0) {
        log = addLog(log, `${hero.name} falls while retreating!`, 'narrative');
        const updatedHeroes = scene.heroes.map(h => h.id === hero.id ? { ...h, hp: 0 } : h);
        const allDead = updatedHeroes.every(h => h.hp <= 0);
        const newScene = { ...scene, heroes: updatedHeroes, combatPhase: allDead ? 'defeat' : scene.combatPhase };
        if (allDead) {
          return { ...state, scene: newScene, log };
        }
        return advanceAfterAction({ ...state, scene: newScene, log });
      }

      const zone = getZone(zones, targetZone);
      log = addLog(log, `${hero.name} reaches the ${zone.name}. (Turn spent)`, 'move');

      const updatedHeroes = scene.heroes.map(h => h.id === hero.id ? { ...h, hp: currentHp } : h);
      const newHeroZones = { ...scene.heroZones, [hero.id]: targetZone };
      const newScene = { ...scene, heroes: updatedHeroes, heroZones: newHeroZones };

      return advanceAfterAction({ ...state, scene: newScene, log });
    }

    case 'ATTACK': {
      if (!state.scene || state.scene.type !== 'combat') return state;
      if (state.scene.combatPhase !== 'player_turn') return state;
      const { targetId } = action;
      const scene = state.scene;
      const zones = scene.environment.zones;
      const hero = scene.heroes[scene.activeHeroIndex];
      if (!hero || hero.hp <= 0) return state;
      const heroZone = scene.heroZones[hero.id];

      const enemy = scene.enemies.find(e => e.id === targetId);
      if (!enemy || enemy.hp <= 0) return state;

      const sameZone = enemy.zoneId === heroZone;
      const connected = isConnected(zones, heroZone, enemy.zoneId);
      if (!sameZone && !connected) {
        return { ...state, log: addLog(state.log, 'Target is out of range!', 'warning') };
      }

      const isRanged = !sameZone;
      const weaponType = isRanged ? 'ranged' : 'melee';
      const weapon = hero.equipment.find(e => e.type === 'weapon' && e.subtype === weaponType);
      if (!weapon) {
        const msg = isRanged ? 'No ranged weapon equipped!' : 'No melee weapon equipped!';
        return { ...state, log: addLog(state.log, msg, 'warning') };
      }
      const weaponDmgBonus = weapon.damageBonus || 0;
      const isMagic = weapon?.magic || false;
      const keenEyeBonus = getKeenEyeBonus(hero, zones, heroZone, isRanged);
      const warCryBonus = scene.warCryActive ? 1 : 0;

      const result = resolveAttack({
        STR: hero.stats.STR || 0,
        DEX: hero.stats.DEX || 0,
        INT: hero.stats.INT || 0,
        weaponBonus: weaponDmgBonus,
        rollModifier: keenEyeBonus + warCryBonus,
        isRanged,
        isMagic,
        attackerZone: heroZone,
        defenderZone: enemy.zoneId,
        zones,
      });

      let damage = result.damage;
      let log = state.log;

      // Apply offensive passives (e.g., Arcane Surge)
      ({ damage, log } = applyOffensivePassive(hero, result, damage, log));

      if (keenEyeBonus > 0) {
        log = addLog(log, `Keen Eye! +1 ranged attack from elevated position!`, 'passive');
      }

      const newEnemyHp = Math.max(0, enemy.hp - damage);
      const rangeLabel = isRanged ? ` at range` : '';
      log = addLog(log, `${hero.name} attacks ${enemy.name}${rangeLabel}! ${formatRoll(result)}`, 'attack');

      const newEnemies = scene.enemies.map(e =>
        e.id === targetId ? { ...e, hp: newEnemyHp } : e
      );

      if (newEnemyHp <= 0) {
        log = addLog(log, `${enemy.name} is defeated!`, 'narrative');
      }

      const allDead = newEnemies.every(e => e.hp <= 0);
      if (allDead) {
        log = addLog(log, `All enemies defeated!`, 'narrative');
        return {
          ...state,
          scene: { ...scene, enemies: newEnemies, dice: makeDiceState(result), combatPhase: 'victory' },
          log,
        };
      }

      const newScene = { ...scene, enemies: newEnemies, dice: makeDiceState(result) };
      return advanceAfterAction({ ...state, scene: newScene, log });
    }

    case 'USE_EQUIPMENT': {
      if (!state.scene || state.scene.type !== 'combat') return state;
      if (state.scene.combatPhase !== 'player_turn') return state;
      const { equipmentId } = action;
      const scene = state.scene;
      const hero = scene.heroes[scene.activeHeroIndex];
      if (!hero || hero.hp <= 0) return state;

      const eqIndex = hero.equipment.findIndex(e => e.id === equipmentId);
      if (eqIndex === -1) return state;
      const eq = hero.equipment[eqIndex];
      if (eq.usesLeft <= 0) {
        return { ...state, log: addLog(state.log, `${eq.name} has no uses left!`, 'warning') };
      }

      let log = state.log;
      let bonusDice = [];
      let updatedHero = { ...hero };

      if (eq.smokeBomb) {
        log = applySmokeBomb(log);
        const newEquipment = [...hero.equipment];
        newEquipment[eqIndex] = { ...eq, usesLeft: eq.usesLeft - 1 };
        updatedHero = { ...hero, equipment: newEquipment };
        const updatedHeroes = scene.heroes.map(h => h.id === hero.id ? updatedHero : h);
        const newScene = { ...scene, heroes: updatedHeroes, smokeBombActive: true, dice: { results: [], bonusDice: [], total: 0, tier: '', damage: 0 } };
        return advanceAfterAction({ ...state, scene: newScene, log });
      }

      // --- Throwing Axe: DEX-based ranged attack roll ---
      if (eq.throwingAxe) {
        const heroZone = scene.heroZones[hero.id];
        const zones = scene.environment.zones;
        const targetId = scene.selectedTarget;
        const enemy = scene.enemies.find(e => e.id === targetId && e.hp > 0);
        if (!enemy) {
          return { ...state, log: addLog(log, `No valid target selected!`, 'warning') };
        }
        const sameZone = enemy.zoneId === heroZone;
        const connected = isConnected(zones, heroZone, enemy.zoneId);
        if (!sameZone && !connected) {
          return { ...state, log: addLog(log, `${enemy.name} is out of range!`, 'warning') };
        }

        const result = resolveAttack({
          STR: hero.stats.STR || 0,
          DEX: hero.stats.DEX || 0,
          INT: hero.stats.INT || 0,
          weaponBonus: eq.throwDamage || 3,
          isRanged: !sameZone,
          attackerZone: heroZone,
          defenderZone: enemy.zoneId,
          zones,
        });

        let damage = result.damage;
        const newEnemyHp = Math.max(0, enemy.hp - damage);
        log = addLog(log, `${hero.name} hurls a Throwing Axe at ${enemy.name}! ${formatRoll(result)}`, 'attack');
        const newEnemies = scene.enemies.map(e => e.id === targetId ? { ...e, hp: newEnemyHp } : e);
        if (newEnemyHp <= 0) log = addLog(log, `${enemy.name} is defeated!`, 'narrative');
        if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

        const newEquipment = [...hero.equipment];
        newEquipment[eqIndex] = { ...eq, usesLeft: eq.usesLeft - 1 };
        updatedHero = { ...hero, equipment: newEquipment };
        const updatedHeroes = scene.heroes.map(h => h.id === hero.id ? updatedHero : h);
        const newScene = {
          ...scene,
          heroes: updatedHeroes,
          enemies: newEnemies,
          combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
          dice: makeDiceState(result),
        };
        if (newScene.combatPhase === 'victory') {
          return { ...state, scene: newScene, log };
        }
        return advanceAfterAction({ ...state, scene: newScene, log });
      }

      // --- Skill cards ---
      if (eq.type === 'skill') {
        const { scene: skillScene, log: skillLog } = resolveSkillEffect(eq, hero, scene, action, log);
        // Decrement uses on the hero in the updated scene
        const skillHero = skillScene.heroes.find(h => h.id === hero.id);
        const skillEqIndex = skillHero.equipment.findIndex(e => e.id === equipmentId);
        const newEquipment = [...skillHero.equipment];
        newEquipment[skillEqIndex] = { ...newEquipment[skillEqIndex], usesLeft: eq.usesLeft - 1 };
        const finalHeroes = skillScene.heroes.map(h =>
          h.id === hero.id ? { ...h, equipment: newEquipment } : h
        );
        const finalScene = { ...skillScene, heroes: finalHeroes };

        if (finalScene.combatPhase === 'victory') {
          return { ...state, scene: finalScene, log: skillLog };
        }
        return advanceAfterAction({ ...state, scene: finalScene, log: skillLog });
      }

      if (eq.type === 'consumable' && eq.healDie) {
        const healRoll = rollDie(eq.healDie);
        const heal = Math.min(healRoll, hero.stats.maxHp - hero.hp);
        updatedHero = { ...hero, hp: hero.hp + heal };
        bonusDice.push({ sides: eq.healDie, value: healRoll, reason: 'healing' });
        log = addLog(log, `${hero.name} uses ${eq.name} — rolls d${eq.healDie}→${healRoll}, restores ${heal} HP!`, 'heal');
      }

      const newEquipment = [...hero.equipment];
      newEquipment[eqIndex] = { ...eq, usesLeft: eq.usesLeft - 1 };
      updatedHero = { ...updatedHero, equipment: newEquipment };

      const updatedHeroes = scene.heroes.map(h => h.id === hero.id ? updatedHero : h);
      const newScene = { ...scene, heroes: updatedHeroes, dice: { results: [], bonusDice, total: 0, tier: '', damage: 0 } };

      return advanceAfterAction({ ...state, scene: newScene, log });
    }

    case 'SELECT_TARGET': {
      if (!state.scene) return state;
      return { ...state, scene: { ...state.scene, selectedTarget: action.targetId } };
    }

    case 'END_TURN': {
      if (!state.scene || state.scene.type !== 'combat') return state;
      if (state.scene.combatPhase !== 'player_turn') return state;
      return advanceAfterAction(state);
    }

    // --- Non-combat scene actions ---
    case 'REST_COMPLETE': {
      if (!state.scene || state.scene.type !== 'rest_and_check') return state;
      const scene = state.scene;
      const healAmounts = {};
      const updatedHeroes = scene.heroes.map(h => {
        const heal = (h.stats.CON || 0) * 2;
        const newHp = Math.min(h.hp + heal, h.stats.maxHp);
        healAmounts[h.id] = newHp - h.hp;
        return { ...h, hp: newHp };
      });

      let log = state.log;
      updatedHeroes.forEach(h => {
        const healed = healAmounts[h.id];
        if (healed > 0) {
          log = addLog(log, `${h.name} rests and recovers ${healed} HP. (CON x 2)`, 'heal');
        } else {
          log = addLog(log, `${h.name} rests but is already at full health.`, 'info');
        }
      });

      return {
        ...state,
        scene: { ...scene, heroes: updatedHeroes, healAmounts, restPhase: 'check_ready' },
        log,
      };
    }

    case 'SELECT_CHECK_HERO': {
      if (!state.scene || state.scene.restPhase !== 'check_ready') return state;
      return { ...state, scene: { ...state.scene, checkHeroIndex: action.heroIndex } };
    }

    case 'ROLL_CHECK': {
      if (!state.scene || state.scene.restPhase !== 'check_ready') return state;
      if (state.scene.checkHeroIndex === null) return state;
      const scene = state.scene;
      const hero = scene.heroes[scene.checkHeroIndex];
      const stat = hero.stats[scene.checkStat] || 0;
      const roll = rollDie(20);
      const total = roll + stat;
      const success = total >= scene.checkDC;

      let log = addLog(state.log, `${hero.name} attempts: ${scene.checkDescription}`, 'info');
      log = addLog(log, `Rolls d20: ${roll} + ${scene.checkStat} ${stat} = ${total} vs DC ${scene.checkDC}`, 'attack');

      if (success) {
        log = addLog(log, `Success! ${scene.checkSuccess}`, 'narrative');
      } else {
        log = addLog(log, `Failed. ${scene.checkFailure}`, 'info');
      }

      const checkResult = { roll, stat, statName: scene.checkStat, total, dc: scene.checkDC, success };

      return {
        ...state,
        scene: { ...scene, checkResult, restPhase: 'check_done' },
        log,
      };
    }

    case 'COMPLETE_SCENE': {
      const scene = state.scene;
      // Persist HP back to party
      let updatedParty;
      if (scene.heroes) {
        updatedParty = state.party.map(p => {
          const sceneHero = scene.heroes.find(h => h.id === p.id);
          return sceneHero ? { ...p, hp: sceneHero.hp } : p;
        });
      } else {
        updatedParty = state.party;
      }

      // Check for skill check rewards
      let inventory = [...state.partyInventory];
      if (scene.checkResult && scene.checkResult.success && scene.checkReward) {
        inventory.push(scene.checkReward);
      }

      const isLastScene = state.currentSceneIndex >= state.scenes.length - 1;
      const allDead = updatedParty.every(h => h.hp <= 0);

      if (allDead) {
        return {
          ...state,
          phase: 'run_defeat',
          party: updatedParty,
          partyInventory: inventory,
          scene: null,
          log: addLog(state.log, `All heroes have fallen. The adventure ends here.`, 'narrative'),
        };
      }

      if (isLastScene) {
        return {
          ...state,
          phase: 'run_victory',
          party: updatedParty,
          partyInventory: inventory,
          scene: null,
          log: addLog(state.log, `Victory! The starter adventure is complete!`, 'narrative'),
        };
      }

      return {
        ...state,
        phase: 'scene_intro',
        currentSceneIndex: state.currentSceneIndex + 1,
        party: updatedParty,
        partyInventory: inventory,
        scene: null,
      };
    }

    case 'RESTART': {
      return createInitialState();
    }

    default:
      return state;
  }
}

// --- Ensure selectedTarget points to a living enemy ---

function ensureValidTarget(scene) {
  const current = scene.enemies.find(e => e.id === scene.selectedTarget && e.hp > 0);
  if (current) return scene.selectedTarget;
  const firstLiving = scene.enemies.find(e => e.hp > 0);
  return firstLiving ? firstLiving.id : null;
}

// --- Turn advancement helper ---

function advanceAfterAction(state) {
  const scene = { ...state.scene, selectedTarget: ensureValidTarget(state.scene) };
  const heroes = scene.heroes;
  const nextIndex = scene.activeHeroIndex + 1;

  // Find next living hero
  let foundNext = false;
  for (let i = nextIndex; i < heroes.length; i++) {
    if (heroes[i].hp > 0) {
      return {
        ...state,
        scene: { ...scene, activeHeroIndex: i },
        log: addLog(state.log, `${heroes[i].name}'s turn.`, 'turn'),
      };
    }
  }

  // All heroes have acted — resolve enemy turns
  const { scene: updatedScene, log } = resolveEnemyTurns(scene, state.log);
  return { ...state, scene: updatedScene, log };
}
