import gameData from '../data/gameData.json';
import { getMaxHp } from '../state/combatHelpers.js';

const CLASS_COLORS = {
  Warrior: '#c0392b',
  Ranger: '#27ae60',
  Rogue: '#8e44ad',
  Mage: '#2980b9',
};

export default function HeroSelect({ party, dispatch }) {
  const selectedIds = party.map(h => h.id);

  return (
    <div className="hero-select">
      <h2 className="hero-select-title">Choose Your Heroes</h2>
      <p className="hero-select-subtitle">Select exactly 2 heroes for your adventure</p>

      <div className="hero-cards">
        {gameData.heroes.map(hero => {
          const selected = selectedIds.includes(hero.id);
          const maxHp = getMaxHp(hero.stats);
          const color = CLASS_COLORS[hero.class] || '#888';

          return (
            <div
              key={hero.id}
              className={`hero-card ${selected ? 'selected' : ''}`}
              style={{ borderColor: selected ? color : undefined }}
              onClick={() => dispatch({ type: 'TOGGLE_HERO', heroId: hero.id })}
            >
              <div className="hero-card-header" style={{ backgroundColor: color }}>
                <span className="hero-card-initial">{hero.name[0]}</span>
              </div>
              <div className="hero-card-body">
                <div className="hero-card-name">{hero.name}</div>
                <div className="hero-card-class">{hero.class}</div>
                <div className="hero-card-stats">
                  <span>STR {hero.stats.STR}</span>
                  <span>DEX {hero.stats.DEX}</span>
                  <span>INT {hero.stats.INT}</span>
                  <span>CON {hero.stats.CON}</span>
                </div>
                <div className="hero-card-hp">HP: {maxHp}</div>
                <div className="hero-card-passive">
                  <strong>{hero.passive.name}:</strong> {hero.passive.description}
                </div>
                <div className="hero-card-equipment">
                  {hero.equipment.map(eq => (
                    <div key={eq.id} className={`hero-card-eq ${eq.type === 'skill' ? 'skill' : ''}`}>
                      {eq.name}
                      {eq.type === 'skill' && <span className="eq-effect"> — {eq.effect}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {selected && <div className="hero-card-check">&#10003;</div>}
            </div>
          );
        })}
      </div>

      <button
        className="action-btn start-run"
        disabled={party.length !== 2}
        onClick={() => dispatch({ type: 'START_RUN' })}
      >
        {party.length === 2 ? 'Begin Adventure!' : `Select ${2 - party.length} more hero${party.length === 1 ? '' : 'es'}`}
      </button>
    </div>
  );
}
