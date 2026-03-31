import gameData from '../data/gameData.json';

const { tagEffects, damageTiers } = gameData;

// --- Dice ---

export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function roll2d6() {
  return [rollDie(6), rollDie(6)];
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

export function resolveAttack({ STR, DEX, INT, modifier, isRanged, isMagic, attackerZone, defenderZone, zones }) {
  const dice = roll2d6();
  const dexBonus = isRanged ? (DEX || 0) : 0;
  const raw = dice[0] + dice[1] + modifier + dexBonus;

  let zoneBonus = 0;
  if (isRanged) {
    for (const tag of getZoneTags(zones, attackerZone)) {
      zoneBonus += getTagEffect(tag, 'rangedAttackBonus');
    }
  }

  const total = raw + zoneBonus;
  const tier = getTier(total);

  // Melee: +STR, Magic ranged: +INT, Physical ranged: tier only (DEX boosts the roll)
  let statBonus = 0;
  if (tier.damage > 0) {
    if (!isRanged) statBonus = STR || 0;
    else if (isMagic) statBonus = INT || 0;
  }
  let damage = tier.damage > 0 ? tier.damage + statBonus : 0;
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

  return { dice, total, tier, damage, bonusDice, zoneBonus, coverReduction };
}

export function makeDiceState(result) {
  return {
    results: result.dice,
    bonusDice: result.bonusDice,
    total: result.total,
    tier: result.tier.label,
    damage: result.damage,
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
    case 'Iron Stance':
      if (damage > 0 && !isRanged) {
        log = addLog(log, `Iron Stance absorbs 1 damage!`, 'passive');
        return { damage: Math.max(0, damage - 1), log };
      }
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

// --- Smoke bomb effect ---

export function applySmokeBomb(log) {
  return addLog(log, `Smoke Bomb! All enemies get -2 to their next attacks!`, 'defend');
}
