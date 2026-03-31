import gameData from '../data/gameData.json';

const { encounter, tagEffects, damageTiers } = gameData;

function getZone(id) {
  return encounter.zones.find(z => z.id === id);
}

function isConnected(zoneA, zoneB) {
  if (zoneA === zoneB) return true;
  const zone = getZone(zoneA);
  return zone.connections.includes(zoneB);
}

function isHeroEngaged(heroZone, enemies) {
  return enemies.some(e => e.hp > 0 && e.zoneId === heroZone);
}

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function roll2d6() {
  return [rollDie(6), rollDie(6)];
}

function getTier(total) {
  return damageTiers.find(t => total >= t.min && total <= t.max);
}

function addLog(state, text, type = 'info') {
  return [...state.log, { text, type }];
}

function getZoneTags(zoneId) {
  const zone = getZone(zoneId);
  return zone ? zone.tags : [];
}

function getTagEffect(tag, key) {
  const effect = tagEffects[tag];
  return effect ? (effect[key] || 0) : 0;
}

// Core attack resolution: 2d6 + modifiers → tier damage + strength
function resolveAttack({ attackerName, strength, modifier, isRanged, attackerZone, defenderZone }) {
  const dice = roll2d6();
  const raw = dice[0] + dice[1] + modifier;

  // Zone tag bonuses to attack roll
  let zoneBonus = 0;
  if (isRanged) {
    for (const tag of getZoneTags(attackerZone)) {
      zoneBonus += getTagEffect(tag, 'rangedAttackBonus');
    }
  }

  const total = raw + zoneBonus;
  const tier = getTier(total);

  let damage = tier.damage > 0 ? tier.damage + strength : 0;
  const bonusDice = []; // track extra dice rolled for display

  // Zone tag damage modifiers
  if (isRanged && damage > 0) {
    for (const tag of getZoneTags(defenderZone)) {
      const reduction = getTagEffect(tag, 'rangedDamageReduction');
      if (reduction) damage = Math.max(0, damage - reduction);
    }
  }

  // Shadowed crit bonus: roll a d8
  if (tier.label === 'Critical') {
    for (const tag of getZoneTags(attackerZone)) {
      const critDie = getTagEffect(tag, 'critBonusDie');
      if (critDie) {
        const bonus = rollDie(critDie);
        bonusDice.push({ sides: critDie, value: bonus, reason: 'shadowed crit' });
        damage += bonus;
      }
    }
  }

  return { dice, total, tier, damage, bonusDice, zoneBonus };
}

// Build the dice display object
function makeDiceState(result) {
  return {
    results: result.dice,
    bonusDice: result.bonusDice,
    total: result.total,
    tier: result.tier.label,
    damage: result.damage,
  };
}

function formatRoll(result) {
  const base = `[${result.dice.join(' + ')}]`;
  const mods = result.total !== result.dice[0] + result.dice[1]
    ? ` + ${result.total - result.dice[0] - result.dice[1]} = ${result.total}`
    : ` = ${result.total}`;
  const bonusStr = result.bonusDice.length
    ? ' + ' + result.bonusDice.map(b => `d${b.sides}→${b.value}`).join(' + ')
    : '';
  return `${base}${mods} — ${result.tier.label}!${bonusStr} ${result.damage > 0 ? result.damage + ' damage' : ''}`;
}

export function createInitialState() {
  const enemies = encounter.enemies.map(e => ({
    ...e,
    hp: e.stats.maxHp,
    zoneId: e.startZone,
  }));

  return {
    phase: 'player_turn',
    turn: 1,

    heroZone: encounter.playerStart,
    hero: {
      ...gameData.hero,
      hp: gameData.hero.stats.maxHp,
    },

    enemies,
    equipment: gameData.equipment.map(e => ({ ...e, usesLeft: e.uses ?? Infinity })),
    selectedTarget: enemies[0]?.id || null,

    dice: { results: [], bonusDice: [], total: 0, tier: '', damage: 0 },

    log: [{
      text: `You enter the ${getZone(encounter.playerStart).name}. A brawl is about to begin!`,
      type: 'narrative',
    }],
  };
}

function resolveEnemyTurns(state) {
  let { enemies, hero, heroZone } = state;
  let log = state.log;
  let newHeroHp = hero.hp;
  let lastDiceState = null;

  enemies = enemies.map(enemy => {
    if (enemy.hp <= 0) return enemy;
    if (newHeroHp <= 0) return enemy;

    const sameZone = enemy.zoneId === heroZone;
    const connected = isConnected(enemy.zoneId, heroZone);
    const engaged = sameZone;

    // --- AGGRESSIVE ---
    if (enemy.behavior === 'aggressive') {
      if (!sameZone) {
        const zone = getZone(enemy.zoneId);
        const nextZone = zone.connections.find(c => c === heroZone)
          || zone.connections.find(c => isConnected(c, heroZone))
          || zone.connections[0];
        if (nextZone) {
          log = addLog({ log }, `${enemy.name} charges into ${getZone(nextZone).name}!`, 'enemy');
          return { ...enemy, zoneId: nextZone };
        }
      }
      if (sameZone) {
        const result = resolveAttack({
          attackerName: enemy.name,
          strength: enemy.stats.strength,
          modifier: 0,
          isRanged: false,
          attackerZone: enemy.zoneId,
          defenderZone: heroZone,
        });
        lastDiceState = makeDiceState(result);

        let damage = result.damage;
        // Iron Stance
        if (damage > 0) {
          damage = Math.max(0, damage - 1);
          log = addLog({ log }, `Iron Stance absorbs 1 damage!`, 'passive');
        }

        if (result.tier.damage > 0) {
          newHeroHp = Math.max(0, newHeroHp - damage);
          log = addLog({ log }, `${enemy.name} attacks! ${formatRoll(result)} (reduced to ${damage})`, 'enemy');
        } else {
          log = addLog({ log }, `${enemy.name} attacks! ${formatRoll(result)}`, 'enemy');
        }
      }
      return enemy;
    }

    // --- RANGED ---
    if (enemy.behavior === 'ranged') {
      if (sameZone && engaged) {
        const retreatZone = getZone(enemy.zoneId).connections.find(c => c !== heroZone);
        if (retreatZone) {
          log = addLog({ log }, `${enemy.name} tries to disengage and retreat!`, 'enemy');
          // Hero opportunity attack
          const weapon = state.equipment.find(e => e.type === 'weapon' && e.subtype === 'melee');
          const bonus = weapon ? weapon.attackBonus : 0;
          const oppResult = resolveAttack({
            attackerName: hero.name,
            strength: hero.stats.strength,
            modifier: bonus,
            isRanged: false,
            attackerZone: heroZone,
            defenderZone: enemy.zoneId,
          });

          if (oppResult.damage > 0) {
            const newEnemyHp = Math.max(0, enemy.hp - oppResult.damage);
            log = addLog({ log }, `${hero.name} strikes as they flee! ${formatRoll(oppResult)}`, 'attack');
            if (newEnemyHp <= 0) {
              log = addLog({ log }, `${enemy.name} is cut down trying to escape!`, 'narrative');
              return { ...enemy, hp: 0 };
            }
            log = addLog({ log }, `${enemy.name} retreats to ${getZone(retreatZone).name}.`, 'enemy');
            return { ...enemy, hp: newEnemyHp, zoneId: retreatZone };
          } else {
            log = addLog({ log }, `${hero.name} swings but misses. ${enemy.name} retreats to ${getZone(retreatZone).name}.`, 'move');
            return { ...enemy, zoneId: retreatZone };
          }
        } else {
          // Cornered: attack with -2 penalty
          const result = resolveAttack({
            attackerName: enemy.name,
            strength: enemy.stats.strength,
            modifier: -2,
            isRanged: false,
            attackerZone: enemy.zoneId,
            defenderZone: heroZone,
          });
          lastDiceState = makeDiceState(result);

          let damage = result.damage;
          if (damage > 0) {
            damage = Math.max(0, damage - 1);
            log = addLog({ log }, `Iron Stance absorbs 1 damage!`, 'passive');
          }

          if (result.tier.damage > 0) {
            newHeroHp = Math.max(0, newHeroHp - damage);
            log = addLog({ log }, `${enemy.name} is cornered and fights back! ${formatRoll(result)} (reduced to ${damage})`, 'enemy');
          } else {
            log = addLog({ log }, `${enemy.name} is cornered and flails wildly! ${formatRoll(result)}`, 'enemy');
          }
          return enemy;
        }
      }

      if (connected && !sameZone) {
        const result = resolveAttack({
          attackerName: enemy.name,
          strength: enemy.stats.strength,
          modifier: 0,
          isRanged: true,
          attackerZone: enemy.zoneId,
          defenderZone: heroZone,
        });
        lastDiceState = makeDiceState(result);

        if (result.tier.damage > 0) {
          newHeroHp = Math.max(0, newHeroHp - result.damage);
          log = addLog({ log }, `${enemy.name} shoots from ${getZone(enemy.zoneId).name}! ${formatRoll(result)}`, 'enemy');
        } else {
          log = addLog({ log }, `${enemy.name} shoots from ${getZone(enemy.zoneId).name}! ${formatRoll(result)}`, 'enemy');
        }
        return enemy;
      }

      if (!connected) {
        const zone = getZone(enemy.zoneId);
        const reposition = zone.connections.find(c => isConnected(c, heroZone));
        if (reposition) {
          log = addLog({ log }, `${enemy.name} repositions to ${getZone(reposition).name}.`, 'enemy');
          return { ...enemy, zoneId: reposition };
        }
      }

      return enemy;
    }

    // --- DEFAULT ---
    if (sameZone) {
      const result = resolveAttack({
        attackerName: enemy.name,
        strength: enemy.stats.strength,
        modifier: 0,
        isRanged: false,
        attackerZone: enemy.zoneId,
        defenderZone: heroZone,
      });
      lastDiceState = makeDiceState(result);

      let damage = result.damage;
      if (damage > 0) {
        damage = Math.max(0, damage - 1);
        log = addLog({ log }, `Iron Stance absorbs 1 damage!`, 'passive');
      }

      if (result.tier.damage > 0) {
        newHeroHp = Math.max(0, newHeroHp - damage);
        log = addLog({ log }, `${enemy.name} attacks! ${formatRoll(result)} (reduced to ${damage})`, 'enemy');
      } else {
        log = addLog({ log }, `${enemy.name} attacks! ${formatRoll(result)}`, 'enemy');
      }
    }

    return enemy;
  });

  const defeated = newHeroHp <= 0;

  return {
    ...state,
    phase: defeated ? 'defeat' : 'player_turn',
    turn: state.turn + 1,
    hero: { ...hero, hp: newHeroHp },
    enemies,
    dice: lastDiceState || state.dice,
    log: defeated
      ? addLog({ log }, `${hero.name} falls!`, 'narrative')
      : addLog({ log }, `— Turn ${state.turn + 1} —`, 'turn'),
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'MOVE': {
      const { targetZone } = action;
      if (state.phase !== 'player_turn') return state;
      if (!isConnected(state.heroZone, targetZone)) return state;
      if (targetZone === state.heroZone) return state;

      if (isHeroEngaged(state.heroZone, state.enemies)) {
        return { ...state, log: addLog(state, 'You are engaged! Use Retreat to disengage (costs your turn + free enemy attack).', 'warning') };
      }

      const zone = getZone(targetZone);
      const log = addLog(state, `${state.hero.name} moves to the ${zone.name}. (Turn spent)`, 'move');
      return resolveEnemyTurns({ ...state, heroZone: targetZone, log });
    }

    case 'RETREAT': {
      const { targetZone } = action;
      if (state.phase !== 'player_turn') return state;
      if (!isConnected(state.heroZone, targetZone)) return state;
      if (targetZone === state.heroZone) return state;
      if (!isHeroEngaged(state.heroZone, state.enemies)) return state;

      let log = addLog(state, `${state.hero.name} retreats from the ${getZone(state.heroZone).name}!`, 'move');
      let currentHp = state.hero.hp;

      // Opportunity attack from one enemy
      const attacker = state.enemies.find(e => e.hp > 0 && e.zoneId === state.heroZone);
      if (attacker) {
        const result = resolveAttack({
          attackerName: attacker.name,
          strength: attacker.stats.strength,
          modifier: 0,
          isRanged: false,
          attackerZone: attacker.zoneId,
          defenderZone: state.heroZone,
        });

        let damage = result.damage;
        if (damage > 0) {
          damage = Math.max(0, damage - 1);
          log = addLog({ log }, `Iron Stance absorbs 1 damage!`, 'passive');
        }

        if (result.tier.damage > 0) {
          currentHp = Math.max(0, currentHp - damage);
          log = addLog({ log }, `${attacker.name} strikes as you retreat! ${formatRoll(result)} (reduced to ${damage})`, 'enemy');
        } else {
          log = addLog({ log }, `${attacker.name} swings as you retreat — ${formatRoll(result)}`, 'enemy');
        }
      }

      if (currentHp <= 0) {
        log = addLog({ log }, `${state.hero.name} falls while retreating!`, 'narrative');
        return { ...state, hero: { ...state.hero, hp: 0 }, log, phase: 'defeat' };
      }

      const zone = getZone(targetZone);
      log = addLog({ log }, `${state.hero.name} reaches the ${zone.name}. (Turn spent)`, 'move');
      return resolveEnemyTurns({ ...state, heroZone: targetZone, hero: { ...state.hero, hp: currentHp }, log });
    }

    case 'ATTACK': {
      if (state.phase !== 'player_turn') return state;
      const { targetId } = action;
      const enemy = state.enemies.find(e => e.id === targetId);
      if (!enemy || enemy.hp <= 0) return state;

      const sameZone = enemy.zoneId === state.heroZone;
      const connected = isConnected(state.heroZone, enemy.zoneId);
      if (!sameZone && !connected) {
        return { ...state, log: addLog(state, 'Target is out of range!', 'warning') };
      }

      const isRanged = !sameZone;
      const weaponType = isRanged ? 'ranged' : 'melee';
      const weapon = state.equipment.find(e => e.type === 'weapon' && e.subtype === weaponType);
      const attackBonus = weapon ? weapon.attackBonus : 0;

      const result = resolveAttack({
        attackerName: state.hero.name,
        strength: state.hero.stats.strength,
        modifier: attackBonus,
        isRanged,
        attackerZone: state.heroZone,
        defenderZone: enemy.zoneId,
      });

      const newEnemyHp = Math.max(0, enemy.hp - result.damage);
      const rangeLabel = isRanged ? ` at range` : '';
      let log;
      if (result.tier.damage > 0) {
        log = addLog(state, `${state.hero.name} attacks ${enemy.name}${rangeLabel}! ${formatRoll(result)}`, 'attack');
      } else {
        log = addLog(state, `${state.hero.name} attacks ${enemy.name}${rangeLabel}! ${formatRoll(result)}`, 'attack');
      }

      const newEnemies = state.enemies.map(e =>
        e.id === targetId ? { ...e, hp: newEnemyHp } : e
      );

      if (newEnemyHp <= 0) {
        log = addLog({ log }, `${enemy.name} is defeated!`, 'narrative');
      }

      const allDead = newEnemies.every(e => e.hp <= 0);
      if (allDead) {
        log = addLog({ log }, `All enemies defeated!`, 'narrative');
        return {
          ...state,
          enemies: newEnemies,
          dice: makeDiceState(result),
          log,
          phase: 'victory',
        };
      }

      return resolveEnemyTurns({
        ...state,
        enemies: newEnemies,
        dice: makeDiceState(result),
        log,
      });
    }

    case 'USE_EQUIPMENT': {
      if (state.phase !== 'player_turn') return state;
      const { equipmentId } = action;
      const eqIndex = state.equipment.findIndex(e => e.id === equipmentId);
      if (eqIndex === -1) return state;

      const eq = state.equipment[eqIndex];
      if (eq.usesLeft <= 0) {
        return { ...state, log: addLog(state, `${eq.name} has no uses left!`, 'warning') };
      }

      let newState = { ...state };
      let log = state.log;
      let bonusDice = [];

      if (eq.type === 'consumable' && eq.healDie) {
        const healRoll = rollDie(eq.healDie);
        const heal = Math.min(healRoll, state.hero.stats.maxHp - state.hero.hp);
        newState.hero = { ...state.hero, hp: state.hero.hp + heal };
        bonusDice.push({ sides: eq.healDie, value: healRoll, reason: 'healing' });
        log = addLog(state, `${state.hero.name} drinks ${eq.name} — rolls d${eq.healDie}→${healRoll}, restores ${heal} HP!`, 'heal');
      } else if (eq.type === 'armor' && eq.blockDie) {
        const blockRoll = rollDie(eq.blockDie);
        bonusDice.push({ sides: eq.blockDie, value: blockRoll, reason: 'block' });
        log = addLog(state, `${state.hero.name} raises ${eq.name} — rolls d${eq.blockDie}→${blockRoll}, will block ${blockRoll} damage!`, 'defend');
      }

      const newEquipment = [...state.equipment];
      newEquipment[eqIndex] = { ...eq, usesLeft: eq.usesLeft - 1 };

      newState = {
        ...newState,
        equipment: newEquipment,
        dice: { results: [], bonusDice, total: 0, tier: '', damage: 0 },
        log,
      };

      return resolveEnemyTurns(newState);
    }

    case 'SELECT_TARGET': {
      return { ...state, selectedTarget: action.targetId };
    }

    case 'END_TURN': {
      return resolveEnemyTurns(state);
    }

    case 'RESTART': {
      return createInitialState();
    }

    default:
      return state;
  }
}
