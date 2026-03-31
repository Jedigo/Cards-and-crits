export default function RestScene({ scene, dispatch }) {
  const { restPhase, heroes, healAmounts, checkHeroIndex, checkResult } = scene;

  return (
    <div className="rest-scene">
      <div className="rest-scene-card">
        <h2>{scene.narrative.title}</h2>
        <p className="rest-narrative">{scene.narrative.text}</p>

        {/* Rest Phase */}
        {restPhase === 'resting' && (
          <div className="rest-phase">
            <h3>Rest</h3>
            <p>Your heroes take a moment to recover. Each hero heals CON x 2 HP.</p>
            <div className="rest-heroes">
              {heroes.map(h => (
                <div key={h.id} className="rest-hero">
                  <span className="rest-hero-name">{h.name}</span>
                  <span className="rest-hero-hp">{h.hp}/{h.stats.maxHp} HP</span>
                  <span className="rest-hero-heal">+{(h.stats.CON || 0) * 2} HP</span>
                </div>
              ))}
            </div>
            <button className="action-btn" onClick={() => dispatch({ type: 'REST_COMPLETE' })}>
              Rest
            </button>
          </div>
        )}

        {/* Skill Check Phase */}
        {restPhase === 'check_ready' && (
          <div className="check-phase">
            <h3>Skill Check</h3>
            <p>{scene.checkDescription}</p>
            <p className="check-info">Roll d20 + {scene.checkStat} vs DC {scene.checkDC}</p>

            <div className="check-heroes">
              <p>Choose a hero to attempt the check:</p>
              {heroes.map((h, i) => (
                <button
                  key={h.id}
                  className={`action-btn ${checkHeroIndex === i ? 'selected' : ''}`}
                  onClick={() => dispatch({ type: 'SELECT_CHECK_HERO', heroIndex: i })}
                >
                  {h.name} ({scene.checkStat}: {h.stats[scene.checkStat] || 0})
                </button>
              ))}
            </div>

            {healAmounts && (
              <div className="rest-results">
                {heroes.map(h => (
                  <div key={h.id} className="rest-result">
                    {h.name}: {h.hp}/{h.stats.maxHp} HP
                    {healAmounts[h.id] > 0 && <span className="heal-amount"> (+{healAmounts[h.id]})</span>}
                  </div>
                ))}
              </div>
            )}

            <button
              className="action-btn attack"
              disabled={checkHeroIndex === null}
              onClick={() => dispatch({ type: 'ROLL_CHECK' })}
            >
              Roll Check!
            </button>
          </div>
        )}

        {/* Check Done */}
        {restPhase === 'check_done' && checkResult && (
          <div className="check-done">
            <h3>Skill Check Result</h3>
            <div className="check-roll">
              <span className="die d20">{checkResult.roll}</span>
              <span className="check-math">
                + {checkResult.statName} {checkResult.stat} = {checkResult.total} vs DC {checkResult.dc}
              </span>
            </div>
            <div className={`check-outcome ${checkResult.success ? 'success' : 'failure'}`}>
              {checkResult.success ? 'SUCCESS!' : 'FAILED'}
            </div>
            <p>{checkResult.success ? scene.checkSuccess : scene.checkFailure}</p>

            <button
              className="action-btn start-scene"
              onClick={() => dispatch({ type: 'COMPLETE_SCENE' })}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
