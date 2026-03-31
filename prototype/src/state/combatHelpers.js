import gameData from '../data/gameData.json';

const { tagEffects, damageTiers } = gameData;

// --- Dice ---

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function roll2d8() {
  return [rollDie(8), rollDie(8)];
}

export function rollExplodingDamage() {
  const rolls = [];
  let value = rollDie(8);
  rolls.push(value);
  while (value === 8) {
    value = rollDie(8);
    rolls.push(value);
  }
  return rolls;
}

// --- Zone helpers ---

export function getZone(zones, id) {
  return zones.find(z => z.id === id);
}

export function isConnected(zones, zoneA, zoneB) {
  if (zoneA === zoneB) return true;
  const zone = getZone(zones, zoneA);
  return zone && zone.connections.includes(zoneB);
}

export function isHeroEngaged(heroZone, enemies) {
  return enemies.some(e => e.hp > 0 && e.zoneId === heroZone);
}

export function getZoneTags(zones, zoneId) {
  const zone = getZone(zones, zoneId);
  return zone ? zone.tags : [];
}

export function getTagEffect(tag, key) {
  const effect = tagEffects[tag];
  return effect ? (effect[key] || 0) : 0;
}

// --- Damage tiers ---

export function getTier(total) {
  return damageTiers.find(t => total >= t.min && total <= t.max);
}

// --- Log helper ---

export function addLog(log, text, type = 'info') {
  return [...log, { text, type }];
}

// --- Attack resolution ---

export function resolveAttack({ STR, DEX, INT, weaponBonus, rollModifier, isRanged, isMagic, attackerZone, defenderZone, zones }) {
  const dice = roll2d8();
  const isNatural16 = dice[0] === 8 && dice[1] === 8;

  // Stats add to the attack roll (accuracy)
  let statBonus = 0;
  if (!isRanged) statBonus = STR || 0;
  else if (isMagic) statBonus = INT || 0;
  else statBonus = DEX || 0;

  const raw = dice[0] + dice[1] + statBonus + (rollModifier || 0);

  let zoneBonus = 0;
  if (isRanged) {
    for (const tag of getZoneTags(zones, attackerZone)) {
      zoneBonus += getTagEffect(tag, 'rangedAttackBonus');
    }
  }

  const total = raw + zoneBonus;
  const tier = getTier(total);

  // Weapons add to damage, scaled by tier multiplier
  const weaponDmg = (weaponBonus || 0) * (tier.weaponMultiplier || 0);
  let damage = tier.damage > 0 ? tier.damage + weaponDmg : 0;
  const bonusDice = [];
  let coverReduction = 0;

  if (isRanged && damage > 0) {
    for (const tag of getZoneTags(zones, defenderZone)) {
      const reduction = getTagEffect(tag, 'rangedDamageReduction');
      if (reduction) {
        coverReduction += reduction;
        damage = Math.max(0, damage - reduction);
      }
    }
  }

  // Exploding crits: natural 16 (double 8s) adds bonus d8 damage, chains on 8
  if (tier.label === 'Critical' && isNatural16) {
    const explosions = rollExplodingDamage();
    for (const val of explosions) {
      bonusDice.push({ sides: 8, value: val, reason: 'exploding crit' });
      damage += val;
    }
  }

  // Zone-based crit bonus (e.g., shadowed)
  if (tier.label === 'Critical') {
    for (const tag of getZoneTags(zones, attackerZone)) {
      const critDie = getTagEffect(tag, 'critBonusDie');
      if (critDie) {
        const bonus = rollDie(critDie);
        bonusDice.push({ sides: critDie, value: bonus, reason: 'shadowed crit' });
        damage += bonus;
      }
    }
  }

  return { dice, total, tier, damage, bonusDice, zoneBonus, coverReduction, isNatural16 };
}

export function makeDiceState(result) {
  return {
    results: result.dice,
    bonusDice: result.bonusDice,
    total: result.total,
    tier: result.tier.label,
    damage: result.damage,
    isNatural16: result.isNatural16 || false,
  };
}

export function formatRoll(result) {
  const base = `[${result.dice.join(' + ')}]`;
  const mods = result.total !== result.dice[0] + result.dice[1]
    ? ` + ${result.total - result.dice[0] - result.dice[1]} = ${result.total}`
    : ` = ${result.total}`;
  const bonusStr = result.bonusDice.length
    ? ' + ' + result.bonusDice.map(b => `d${b.sides}→${b.value}`).join(' + ')
    : '';
  const coverStr = result.coverReduction > 0 ? ` (cover absorbs ${result.coverReduction})` : '';
  const dmgStr = result.damage > 0 ? `${result.damage} damage` : (result.coverReduction > 0 ? '0 damage' : '');
  return `${base}${mods} — ${result.tier.label}!${bonusStr} ${dmgStr}${coverStr}`;
}

// --- Passive application ---

export function applyDefensivePassive(hero, damage, isRanged, log) {
  if (!hero.passive) return { damage, log };

  switch (hero.passive.name) {
    case 'Hold the Line':
      // Not a damage reduction passive — handled in enemy AI
      break;
    case 'Shadow Step':
      // Handled in retreat logic, not damage reduction
      break;
  }
  return { damage, log };
}

export function applyOffensivePassive(hero, result, damage, log) {
  if (!hero.passive) return { damage, log };

  switch (hero.passive.name) {
    case 'Arcane Surge':
      if (result.tier.label === 'Critical') {
        const intBonus = hero.stats.INT || 0;
        if (intBonus > 0) {
          log = addLog(log, `Arcane Surge! +${intBonus} bonus damage from INT!`, 'passive');
          return { damage: damage + intBonus, log };
        }
      }
      break;
    case 'Keen Eye':
      // Already handled via zone tag bonus — Keen Eye gives +1 ranged from elevated
      // We handle this in the attack flow by checking attacker zone
      break;
  }
  return { damage, log };
}

export function getKeenEyeBonus(hero, zones, attackerZone, isRanged) {
  if (!isRanged || !hero.passive || hero.passive.name !== 'Keen Eye') return 0;
  const tags = getZoneTags(zones, attackerZone);
  return tags.includes('elevated') ? 1 : 0;
}

// --- Hero HP from stats ---

export function getMaxHp(stats) {
  return 8 + (stats.CON || 0) * 2;
}

// --- Armor reduction ---

export function getArmorReduction(hero) {
  if (!hero.equipment) return 0;
  return hero.equipment
    .filter(e => e.type === 'armor' && e.damageReduction)
    .reduce((sum, e) => sum + e.damageReduction, 0);
}

// --- Hold the Line check ---

export function getHoldTheLinePenalty(targetHero, enemy, heroes, heroZones) {
  // If an ally with Hold the Line is engaged with the attacking enemy,
  // and the target is NOT the Hold the Line hero, apply -1 to attack roll
  for (const hero of heroes) {
    if (hero.hp <= 0) continue;
    if (hero.id === targetHero.id) continue;
    if (!hero.passive || hero.passive.name !== 'Hold the Line') continue;
    if (heroZones[hero.id] === enemy.zoneId) return 1;
  }
  return 0;
}

// --- Smoke bomb effect ---

export function applySmokeBomb(log) {
  return addLog(log, `Smoke Bomb! All enemies get -2 to their next attacks!`, 'defend');
}

// --- Skill resolution ---

export function resolveSkillEffect(eq, hero, scene, action, log) {
  const zones = scene.environment.zones;
  const heroZone = scene.heroZones[hero.id];
  let updatedScene = { ...scene };
  let dice = { results: [], bonusDice: [], total: 0, tier: '', damage: 0 };

  switch (eq.skillType) {

    // --- BANDAGE: heal CON HP ---
    case 'bandage': {
      const heal = Math.max(1, hero.stats.CON || 0);
      const actual = Math.min(heal, hero.stats.maxHp - hero.hp);
      const updatedHero = { ...hero, hp: hero.hp + actual };
      updatedScene = {
        ...updatedScene,
        heroes: scene.heroes.map(h => h.id === hero.id ? updatedHero : h),
      };
      log = addLog(log, `${hero.name} uses Bandage — heals ${actual} HP! (CON ${hero.stats.CON})`, 'heal');
      break;
    }

    // --- WAR CRY: +1 attack rolls for all heroes until enemy turn ---
    case 'war_cry': {
      updatedScene = { ...updatedScene, warCryActive: true };
      log = addLog(log, `${hero.name} lets out a War Cry! All heroes get +1 to attack rolls!`, 'passive');
      break;
    }

    // --- DISENGAGE: move without opportunity attacks ---
    case 'disengage': {
      const targetZone = action.targetZone;
      if (!targetZone) break;
      const connected = isConnected(zones, heroZone, targetZone);
      if (!connected || targetZone === heroZone) break;

      const zone = getZone(zones, targetZone);
      updatedScene = {
        ...updatedScene,
        heroZones: { ...scene.heroZones, [hero.id]: targetZone },
      };
      log = addLog(log, `${hero.name} disengages safely to the ${zone.name}!`, 'move');
      break;
    }

    // --- GRAPPLING HOOK: move to ANY zone ---
    case 'grappling_hook': {
      const targetZone = action.targetZone;
      if (!targetZone || targetZone === heroZone) break;

      const zone = getZone(zones, targetZone);
      updatedScene = {
        ...updatedScene,
        heroZones: { ...scene.heroZones, [hero.id]: targetZone },
      };
      log = addLog(log, `${hero.name} fires a grappling hook to the ${zone.name}!`, 'move');
      break;
    }

    // --- POWER STRIKE: melee attack with boosted weapon scaling ---
    case 'power_strike': {
      const targetId = action.targetId || scene.selectedTarget;
      const enemy = scene.enemies.find(e => e.id === targetId);
      if (!enemy || enemy.hp <= 0 || enemy.zoneId !== heroZone) break;

      const weapon = hero.equipment.find(e => e.type === 'weapon' && e.subtype === 'melee');
      const weaponDmgBonus = weapon ? weapon.damageBonus : 0;

      const result = resolveAttack({
        STR: hero.stats.STR || 0,
        DEX: hero.stats.DEX || 0,
        INT: hero.stats.INT || 0,
        weaponBonus: weaponDmgBonus + 1,
        isRanged: false,
        attackerZone: heroZone,
        defenderZone: enemy.zoneId,
        zones,
      });

      let damage = result.damage;
      ({ damage, log } = applyOffensivePassive(hero, result, damage, log));

      const newEnemyHp = Math.max(0, enemy.hp - damage);
      log = addLog(log, `${hero.name} uses Power Strike on ${enemy.name}! ${formatRoll(result)}`, 'attack');

      const newEnemies = scene.enemies.map(e => e.id === targetId ? { ...e, hp: newEnemyHp } : e);
      if (newEnemyHp <= 0) log = addLog(log, `${enemy.name} is defeated!`, 'narrative');
      if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

      dice = makeDiceState(result);
      updatedScene = {
        ...updatedScene,
        enemies: newEnemies,
        combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
      };
      break;
    }

    // --- AIMED SHOT: ranged attack with +2 accuracy ---
    case 'aimed_shot': {
      const targetId = action.targetId || scene.selectedTarget;
      const enemy = scene.enemies.find(e => e.id === targetId);
      if (!enemy || enemy.hp <= 0) break;
      if (enemy.zoneId === heroZone || !isConnected(zones, heroZone, enemy.zoneId)) break;

      const weapon = hero.equipment.find(e => e.type === 'weapon' && e.subtype === 'ranged');
      const weaponDmgBonus = weapon ? weapon.damageBonus : 0;
      const isMagic = weapon?.magic || false;
      const keenEyeBonus = getKeenEyeBonus(hero, zones, heroZone, true);

      const result = resolveAttack({
        STR: hero.stats.STR || 0,
        DEX: hero.stats.DEX || 0,
        INT: hero.stats.INT || 0,
        weaponBonus: weaponDmgBonus,
        rollModifier: 2 + keenEyeBonus,
        isRanged: true,
        isMagic,
        attackerZone: heroZone,
        defenderZone: enemy.zoneId,
        zones,
      });

      let damage = result.damage;
      ({ damage, log } = applyOffensivePassive(hero, result, damage, log));
      if (keenEyeBonus > 0) log = addLog(log, `Keen Eye! +1 ranged attack from elevated position!`, 'passive');

      const newEnemyHp = Math.max(0, enemy.hp - damage);
      log = addLog(log, `${hero.name} takes an Aimed Shot at ${enemy.name}! ${formatRoll(result)}`, 'attack');

      const newEnemies = scene.enemies.map(e => e.id === targetId ? { ...e, hp: newEnemyHp } : e);
      if (newEnemyHp <= 0) log = addLog(log, `${enemy.name} is defeated!`, 'narrative');
      if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

      dice = makeDiceState(result);
      updatedScene = {
        ...updatedScene,
        enemies: newEnemies,
        combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
      };
      break;
    }

    // --- CHARGE: move to connected zone + melee attack ---
    case 'charge': {
      const targetZone = action.targetZone;
      if (!targetZone || targetZone === heroZone) break;
      if (!isConnected(zones, heroZone, targetZone)) break;

      const zone = getZone(zones, targetZone);
      log = addLog(log, `${hero.name} charges into the ${zone.name}!`, 'move');

      // Move hero
      const newHeroZones = { ...scene.heroZones, [hero.id]: targetZone };

      // Find first enemy in target zone
      const enemy = scene.enemies.find(e => e.hp > 0 && e.zoneId === targetZone);
      if (!enemy) {
        updatedScene = { ...updatedScene, heroZones: newHeroZones };
        log = addLog(log, `No enemies here — ${hero.name} takes position.`, 'info');
        break;
      }

      const weapon = hero.equipment.find(e => e.type === 'weapon' && e.subtype === 'melee');
      const weaponDmgBonus = weapon ? weapon.damageBonus : 0;

      const result = resolveAttack({
        STR: hero.stats.STR || 0,
        DEX: hero.stats.DEX || 0,
        INT: hero.stats.INT || 0,
        weaponBonus: weaponDmgBonus,
        isRanged: false,
        attackerZone: targetZone,
        defenderZone: enemy.zoneId,
        zones,
      });

      let damage = result.damage;
      ({ damage, log } = applyOffensivePassive(hero, result, damage, log));

      const newEnemyHp = Math.max(0, enemy.hp - damage);
      log = addLog(log, `${hero.name} strikes ${enemy.name}! ${formatRoll(result)}`, 'attack');

      const newEnemies = scene.enemies.map(e => e.id === enemy.id ? { ...e, hp: newEnemyHp } : e);
      if (newEnemyHp <= 0) log = addLog(log, `${enemy.name} is defeated!`, 'narrative');
      if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

      dice = makeDiceState(result);
      updatedScene = {
        ...updatedScene,
        heroZones: newHeroZones,
        enemies: newEnemies,
        combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
      };
      break;
    }

    // --- ARCANE BLAST: INT+1 damage to all enemies in target zone ---
    case 'arcane_blast': {
      const targetZone = action.targetZone;
      if (!targetZone) break;
      if (targetZone !== heroZone && !isConnected(zones, heroZone, targetZone)) break;

      const zone = getZone(zones, targetZone);
      const flatDamage = (hero.stats.INT || 0) + 1;
      const targets = scene.enemies.filter(e => e.hp > 0 && e.zoneId === targetZone);

      if (targets.length === 0) {
        log = addLog(log, `${hero.name} casts Arcane Blast into the ${zone.name} — but no enemies are there!`, 'info');
        break;
      }

      log = addLog(log, `${hero.name} casts Arcane Blast into the ${zone.name}! ${flatDamage} damage to all enemies!`, 'attack');

      let newEnemies = [...scene.enemies];
      for (const target of targets) {
        const newHp = Math.max(0, target.hp - flatDamage);
        newEnemies = newEnemies.map(e => e.id === target.id ? { ...e, hp: newHp } : e);
        if (newHp <= 0) log = addLog(log, `${target.name} is defeated!`, 'narrative');
        else log = addLog(log, `${target.name} takes ${flatDamage} damage!`, 'enemy');
      }

      if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

      dice = { results: [], bonusDice: [], total: flatDamage, tier: 'Arcane Blast', damage: flatDamage };
      updatedScene = {
        ...updatedScene,
        enemies: newEnemies,
        combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
      };
      break;
    }

    // --- FIRE FLASK: 3 flat damage to all enemies in target zone ---
    case 'fire_flask': {
      const targetZone = action.targetZone;
      if (!targetZone) break;
      if (targetZone !== heroZone && !isConnected(zones, heroZone, targetZone)) break;

      const zone = getZone(zones, targetZone);
      const flatDamage = 3;
      const targets = scene.enemies.filter(e => e.hp > 0 && e.zoneId === targetZone);

      if (targets.length === 0) {
        log = addLog(log, `${hero.name} hurls a Fire Flask into the ${zone.name} — but no enemies are there!`, 'info');
        break;
      }

      log = addLog(log, `${hero.name} hurls a Fire Flask into the ${zone.name}! ${flatDamage} damage to all enemies!`, 'attack');

      let newEnemies = [...scene.enemies];
      for (const target of targets) {
        const newHp = Math.max(0, target.hp - flatDamage);
        newEnemies = newEnemies.map(e => e.id === target.id ? { ...e, hp: newHp } : e);
        if (newHp <= 0) log = addLog(log, `${target.name} is defeated!`, 'narrative');
        else log = addLog(log, `${target.name} takes ${flatDamage} damage!`, 'enemy');
      }

      if (newEnemies.every(e => e.hp <= 0)) log = addLog(log, `All enemies defeated!`, 'narrative');

      dice = { results: [], bonusDice: [], total: flatDamage, tier: 'Fire Flask', damage: flatDamage };
      updatedScene = {
        ...updatedScene,
        enemies: newEnemies,
        combatPhase: newEnemies.every(e => e.hp <= 0) ? 'victory' : scene.combatPhase,
      };
      break;
    }

    default:
      log = addLog(log, `${hero.name} uses ${eq.name}. (No effect implemented)`, 'info');
  }

  updatedScene = { ...updatedScene, dice };
  return { scene: updatedScene, log };
}
