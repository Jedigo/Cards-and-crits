import { useState } from 'react';
import gameData from '../data/gameData.json';
import { isConnected as checkConnected } from '../state/combatHelpers.js';

export default function ActionBar({ scene, dispatch }) {
  const [pendingSkill, setPendingSkill] = useState(null);

  const { combatPhase, heroes, enemies, activeHeroIndex, heroZones, environment } = scene;
  const zones = environment.zones;

  const gameOver = combatPhase === 'victory' || combatPhase === 'defeat';
  const isPlayerTurn = combatPhase === 'player_turn';

  const hero = heroes[activeHeroIndex];
  const heroZone = hero ? heroZones[hero.id] : null;
  const currentZone = heroZone ? zones.find(z => z.id === heroZone) : null;

  if (gameOver) {
    return (
      <div className="action-bar">
        <div className={`game-over ${combatPhase}`}>
          {combatPhase === 'victory' ? 'VICTORY!' : 'DEFEATED'}
        </div>
        <button className="action-btn start-scene" onClick={() => dispatch({ type: 'COMPLETE_SCENE' })}>
          Continue
        </button>
      </div>
    );
  }

  if (!hero || hero.hp <= 0 || !currentZone) return null;

  const connectedZones = currentZone.connections.map(id => zones.find(z => z.id === id)).filter(Boolean);
  const allZones = zones.filter(z => z.id !== heroZone);
  const engaged = enemies.some(e => e.hp > 0 && e.zoneId === heroZone);

  // Target info
  const target = enemies.find(e => e.id === scene.selectedTarget);
  const targetAlive = target && target.hp > 0;
  const targetSameZone = targetAlive && target.zoneId === heroZone;
  const targetConnected = targetAlive && checkConnected(zones, heroZone, target.zoneId) && !targetSameZone;
  const hasMeleeWeapon = hero.equipment.some(e => e.type === 'weapon' && e.subtype === 'melee');
  const hasRangedWeapon = hero.equipment.some(e => e.type === 'weapon' && e.subtype === 'ranged');
  const canMelee = targetSameZone && hasMeleeWeapon;
  const canRanged = targetConnected && hasRangedWeapon;
  const canAttack = isPlayerTurn && targetAlive && (canMelee || canRanged);
  const attackLabel = canMelee ? `Melee ${target?.name}` : canRanged ? `Ranged ${target?.name}` : 'Attack';

  // Pending skill info
  const pendingEq = pendingSkill ? hero.equipment.find(e => e.id === pendingSkill) : null;
  const isGrapple = pendingEq?.skillType === 'grappling_hook';
  const pendingZones = isGrapple ? allZones : connectedZones;

  function dispatchSkill(eq, extra = {}) {
    dispatch({ type: 'USE_EQUIPMENT', equipmentId: eq.id, ...extra });
    setPendingSkill(null);
  }

  function handleSkillClick(eq) {
    if (eq.targeting === 'none') {
      dispatchSkill(eq);
    } else if (eq.targeting === 'enemy') {
      const targetId = scene.selectedTarget;
      if (!targetId) return;
      // Validate range for enemy-targeting skills
      const enemy = enemies.find(e => e.id === targetId && e.hp > 0);
      if (!enemy) return;
      if (eq.range === 'melee' && enemy.zoneId !== heroZone) return;
      if (eq.range === 'ranged' && (enemy.zoneId === heroZone || !checkConnected(zones, heroZone, enemy.zoneId))) return;
      dispatchSkill(eq, { targetId });
    } else if (eq.targeting === 'zone') {
      // Toggle pending skill for zone selection
      setPendingSkill(pendingSkill === eq.id ? null : eq.id);
    }
  }

  function canUseSkill(eq) {
    if (!isPlayerTurn || eq.usesLeft <= 0) return false;
    if (eq.targeting === 'enemy') {
      const enemy = enemies.find(e => e.id === scene.selectedTarget && e.hp > 0);
      if (!enemy) return false;
      if (eq.range === 'melee' && enemy.zoneId !== heroZone) return false;
      if (eq.range === 'ranged' && (enemy.zoneId === heroZone || !checkConnected(zones, heroZone, enemy.zoneId))) return false;
    }
    return true;
  }

  return (
    <div className="action-bar">
      <div className="turn-info">
        Turn {scene.turn} — {hero.name} — {currentZone.name}
        <span className="zone-tags">
          {currentZone.tags.map(t => {
            const effect = gameData.tagEffects[t];
            return effect?.description ? ` [${effect.description}]` : '';
          }).join('')}
        </span>
      </div>

      {/* Target selector */}
      {enemies.filter(e => e.hp > 0).length > 1 && (
        <div className="target-selector">
          Target:{' '}
          {enemies.filter(e => e.hp > 0).map(e => {
            const eZone = zones.find(z => z.id === e.zoneId);
            return (
              <button
                key={e.id}
                className={`target-btn ${e.id === scene.selectedTarget ? 'selected' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_TARGET', targetId: e.id })}
              >
                {e.name} ({eZone?.name || e.zoneId})
              </button>
            );
          })}
        </div>
      )}

      {engaged && !pendingSkill && (
        <div className="engaged-warning">ENGAGED — cannot move freely. Retreat provokes a free attack!</div>
      )}

      {/* Zone selection for pending skill */}
      {pendingEq && (
        <div className="skill-zone-select">
          <div className="skill-zone-prompt">{pendingEq.name}: Select a zone</div>
          <div className="actions">
            {pendingZones.map(zone => (
              <button
                key={zone.id}
                className="action-btn skill-zone"
                onClick={() => dispatchSkill(pendingEq, { targetZone: zone.id })}
              >
                {pendingEq.skillType === 'charge' ? 'Charge' : pendingEq.name} → {zone.name}
              </button>
            ))}
            <button
              className="action-btn cancel"
              onClick={() => setPendingSkill(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Normal actions (hidden when selecting zone for a skill) */}
      {!pendingSkill && (
        <div className="actions">
          {connectedZones.map(zone => (
            engaged ? (
              <button
                key={zone.id}
                className="action-btn retreat"
                disabled={!isPlayerTurn}
                onClick={() => dispatch({ type: 'RETREAT', targetZone: zone.id })}
              >
                Retreat → {zone.name}
              </button>
            ) : (
              <button
                key={zone.id}
                className="action-btn move"
                disabled={!isPlayerTurn}
                onClick={() => dispatch({ type: 'MOVE', targetZone: zone.id })}
              >
                Move → {zone.name}
              </button>
            )
          ))}

          <button
            className="action-btn attack"
            disabled={!canAttack}
            onClick={() => dispatch({ type: 'ATTACK', targetId: scene.selectedTarget })}
          >
            {attackLabel}
          </button>

          <button
            className="action-btn end-turn"
            disabled={!isPlayerTurn}
            onClick={() => dispatch({ type: 'END_TURN' })}
          >
            End Turn
          </button>
        </div>
      )}

      {/* Equipment and skills */}
      <div className="equipment-actions">
        {hero.equipment.filter(e => e.type !== 'weapon' && e.type !== 'armor').map(eq => {
          const isSkill = eq.type === 'skill';
          const isPending = pendingSkill === eq.id;
          const disabled = !canUseSkill(eq);

          return (
            <button
              key={eq.id}
              className={`action-btn ${isSkill ? 'skill' : 'equipment'}${isPending ? ' pending' : ''}`}
              disabled={disabled}
              title={eq.effect}
              onClick={() => {
                if (isSkill) handleSkillClick(eq);
                else dispatch({ type: 'USE_EQUIPMENT', equipmentId: eq.id });
              }}
            >
              {eq.name} {eq.usesLeft < Infinity ? `(${eq.usesLeft})` : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
