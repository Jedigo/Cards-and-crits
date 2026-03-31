import gameData from '../data/gameData.json';
import { isConnected as checkConnected } from '../state/combatHelpers.js';

export default function ActionBar({ scene, dispatch }) {
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
  const engaged = enemies.some(e => e.hp > 0 && e.zoneId === heroZone);

  // Target info
  const target = enemies.find(e => e.id === scene.selectedTarget);
  const targetAlive = target && target.hp > 0;
  const targetSameZone = targetAlive && target.zoneId === heroZone;
  const targetConnected = targetAlive && checkConnected(zones, heroZone, target.zoneId) && !targetSameZone;
  const canAttack = isPlayerTurn && targetAlive && (targetSameZone || targetConnected);
  const attackLabel = targetSameZone ? `Melee ${target?.name}` : targetConnected ? `Ranged ${target?.name}` : 'Attack';

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

      {engaged && (
        <div className="engaged-warning">ENGAGED — cannot move freely. Retreat provokes a free attack!</div>
      )}

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

      <div className="equipment-actions">
        {hero.equipment.filter(e => e.type !== 'weapon').map(eq => (
          <button
            key={eq.id}
            className="action-btn equipment"
            disabled={!isPlayerTurn || eq.usesLeft <= 0}
            onClick={() => dispatch({ type: 'USE_EQUIPMENT', equipmentId: eq.id })}
          >
            {eq.name} {eq.usesLeft < Infinity ? `(${eq.usesLeft})` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
