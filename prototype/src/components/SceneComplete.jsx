export default function SceneComplete({ scene, party, isLastScene, dispatch }) {
  const allDead = party.every(h => h.hp <= 0);
  const isCombatDefeat = scene && scene.type === 'combat' && scene.combatPhase === 'defeat';

  if (isCombatDefeat || allDead) {
    return (
      <div className="scene-complete">
        <div className="scene-complete-card">
          <div className="game-over defeat">DEFEATED</div>
          <p>Your heroes have fallen.</p>
          <div className="scene-complete-party">
            {party.map(h => (
              <div key={h.id} className="scene-complete-hero">
                {h.name}: {Math.max(0, h.hp)}/{h.stats.maxHp} HP
              </div>
            ))}
          </div>
          <button
            className="action-btn restart"
            onClick={() => dispatch({ type: 'COMPLETE_SCENE' })}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scene-complete">
      <div className="scene-complete-card">
        <div className="scene-complete-outcome">Scene Complete!</div>
        <div className="scene-complete-party">
          {party.map(h => {
            const sceneHero = scene?.heroes?.find(sh => sh.id === h.id);
            const currentHp = sceneHero ? sceneHero.hp : h.hp;
            return (
              <div key={h.id} className="scene-complete-hero">
                {h.name}: {currentHp}/{h.stats.maxHp} HP
              </div>
            );
          })}
        </div>
        <button
          className="action-btn start-scene"
          onClick={() => dispatch({ type: 'COMPLETE_SCENE' })}
        >
          {isLastScene ? 'Finish Adventure' : 'Next Scene'}
        </button>
      </div>
    </div>
  );
}
