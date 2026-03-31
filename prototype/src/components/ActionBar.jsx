import gameData from '../data/gameData.json';

const { encounter } = gameData;

function getZone(id) {
  return encounter.zones.find(z => z.id === id);
}

export default function ActionBar({ state, dispatch }) {
  const gameOver = state.phase === 'victory' || state.phase === 'defeat';
  const isPlayerTurn = state.phase === 'player_turn';

  if (gameOver) {
    return (
      <div className="action-bar">
        <div className={`game-over ${state.phase}`}>
          {state.phase === 'victory' ? 'VICTORY!' : 'DEFEATED'}
        </div>
        <button className="action-btn restart" onClick={() => dispatch({ type: 'RESTART' })}>
          New Encounter
        </button>
      </div>
    );
  }

  const currentZone = getZone(state.heroZone);
  const connectedZones = currentZone.connections.map(id => getZone(id));
  const engaged = state.enemies.some(e => e.hp > 0 && e.zoneId === state.heroZone);

  // Target info
  const target = state.enemies.find(e => e.id === state.selectedTarget);
  const targetAlive = target && target.hp > 0;
  const targetSameZone = targetAlive && target.zoneId === state.heroZone;
  const targetConnected = targetAlive && currentZone.connections.includes(target.zoneId);
  const canAttack = isPlayerTurn && targetAlive && (targetSameZone || targetConnected);
  const attackLabel = targetSameZone ? `Melee ${target?.name}` : targetConnected ? `Ranged ${target?.name}` : 'Attack';

  return (
    <div className="action-bar">
      <div className="turn-info">
        Turn {state.turn} — {currentZone.name}
        <span className="zone-tags">
          {currentZone.tags.map(t => {
            const effect = gameData.tagEffects[t];
            return effect?.description ? ` [${effect.description}]` : '';
          }).join('')}
        </span>
      </div>

      {/* Target selector */}
      {state.enemies.filter(e => e.hp > 0).length > 1 && (
        <div className="target-selector">
          Target:{' '}
          {state.enemies.filter(e => e.hp > 0).map(e => (
            <button
              key={e.id}
              className={`target-btn ${e.id === state.selectedTarget ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_TARGET', targetId: e.id })}
            >
              {e.name} ({getZone(e.zoneId).name})
            </button>
          ))}
        </div>
      )}

      {engaged && (
        <div className="engaged-warning">ENGAGED — cannot move freely. Retreat provokes a free attack!</div>
      )}

      <div className="actions">
        {/* Movement / Retreat buttons */}
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
          onClick={() => dispatch({ type: 'ATTACK', targetId: state.selectedTarget })}
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
        {state.equipment.filter(e => e.type !== 'weapon').map(eq => (
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
