import { useState } from 'react';
import gameData from '../data/gameData.json';

const CLASS_COLORS = {
  Warrior: '#c0392b',
  Ranger: '#27ae60',
  Rogue: '#8e44ad',
  Mage: '#2980b9',
};

export default function LoadoutScreen({ party, loadouts, dispatch }) {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const activeHero = party[activeHeroIndex];
  const activeLoadout = loadouts[activeHero.id];
  const skillCards = gameData.starterSkillCards;
  const consumableCards = gameData.starterConsumables;

  const allReady = party.every(h => {
    const lo = loadouts[h.id];
    return lo.skills.length === 3 && lo.consumable !== null;
  });

  return (
    <div className="loadout-screen">
      <h2 className="loadout-title">Equip Your Heroes</h2>
      <p className="loadout-subtitle">Choose 3 skills and 1 consumable for each hero</p>

      {/* Hero tabs */}
      <div className="loadout-hero-tabs">
        {party.map((hero, i) => {
          const lo = loadouts[hero.id];
          const color = CLASS_COLORS[hero.class] || '#888';
          const isActive = i === activeHeroIndex;
          const isReady = lo.skills.length === 3 && lo.consumable !== null;

          return (
            <button
              key={hero.id}
              className={`loadout-hero-tab ${isActive ? 'active' : ''} ${isReady ? 'ready' : ''}`}
              style={{ borderColor: isActive ? color : undefined }}
              onClick={() => setActiveHeroIndex(i)}
            >
              <span className="tab-name">{hero.name}</span>
              <span className="tab-class">{hero.class}</span>
              <span className="tab-slots">
                Skills {lo.skills.length}/3
                {lo.consumable ? ' | Item ready' : ' | No item'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active hero detail */}
      <div className="loadout-hero-detail">
        {/* Fixed gear */}
        <div className="loadout-fixed-gear">
          <div className="loadout-section-label">Fixed Gear</div>
          {activeHero.equipment.map(eq => (
            <div key={eq.id} className="loadout-card fixed">
              <div className="loadout-card-name">{eq.name}</div>
              <div className="loadout-card-type">{eq.type}</div>
              <div className="loadout-card-effect">{eq.effect}</div>
            </div>
          ))}
        </div>

        {/* Slots */}
        <div className="loadout-flex-slots">
          <div className="loadout-section-label">Skill Slots</div>
          <div className="loadout-slots-row">
            {[0, 1, 2].map(i => {
              const cardId = activeLoadout.skills[i];
              const card = cardId ? skillCards.find(c => c.id === cardId) : null;
              return (
                <div
                  key={i}
                  className={`loadout-slot ${card ? 'filled skill' : 'empty'}`}
                  onClick={() => card && dispatch({ type: 'TOGGLE_SKILL_CARD', heroId: activeHero.id, cardId: card.id })}
                >
                  {card ? (
                    <>
                      <div className="loadout-card-name">{card.name}</div>
                      <div className="loadout-card-effect">{card.effect}</div>
                      <div className="loadout-card-remove">click to remove</div>
                    </>
                  ) : (
                    <div className="loadout-slot-empty">Empty</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="loadout-section-label" style={{ marginTop: '12px' }}>Consumable Slot</div>
          <div className="loadout-slots-row">
            {(() => {
              const card = activeLoadout.consumable
                ? consumableCards.find(c => c.id === activeLoadout.consumable)
                : null;
              return (
                <div
                  className={`loadout-slot consumable-slot ${card ? 'filled consumable' : 'empty'}`}
                  onClick={() => card && dispatch({ type: 'SET_CONSUMABLE', heroId: activeHero.id, cardId: card.id })}
                >
                  {card ? (
                    <>
                      <div className="loadout-card-name">{card.name}</div>
                      <div className="loadout-card-effect">{card.effect}</div>
                      <div className="loadout-card-remove">click to remove</div>
                    </>
                  ) : (
                    <div className="loadout-slot-empty">Empty</div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Skill card pool */}
      <div className="loadout-pool">
        <div className="loadout-section-label">Skills</div>
        <div className="loadout-pool-grid">
          {skillCards.map(card => {
            const isSelected = activeLoadout.skills.includes(card.id);
            const isFull = activeLoadout.skills.length >= 3 && !isSelected;

            return (
              <button
                key={card.id}
                className={`loadout-pool-card skill ${isSelected ? 'selected' : ''}`}
                disabled={isFull}
                onClick={() => dispatch({
                  type: 'TOGGLE_SKILL_CARD',
                  heroId: activeHero.id,
                  cardId: card.id,
                })}
              >
                <div className="pool-card-name">{card.name}</div>
                <div className="pool-card-type">Skill ({card.uses} use{card.uses > 1 ? 's' : ''})</div>
                <div className="pool-card-effect">{card.effect}</div>
                {isSelected && <div className="pool-card-check">Equipped</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consumable pool */}
      <div className="loadout-pool">
        <div className="loadout-section-label">Consumables</div>
        <div className="loadout-pool-grid">
          {consumableCards.map(card => {
            const isSelected = activeLoadout.consumable === card.id;

            return (
              <button
                key={card.id}
                className={`loadout-pool-card consumable ${isSelected ? 'selected' : ''}`}
                onClick={() => dispatch({
                  type: 'SET_CONSUMABLE',
                  heroId: activeHero.id,
                  cardId: card.id,
                })}
              >
                <div className="pool-card-name">{card.name}</div>
                <div className="pool-card-type">Consumable (1 use)</div>
                <div className="pool-card-effect">{card.effect}</div>
                {isSelected && <div className="pool-card-check">Equipped</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm */}
      <button
        className="action-btn start-run"
        disabled={!allReady}
        onClick={() => dispatch({ type: 'CONFIRM_LOADOUT' })}
      >
        {allReady
          ? 'Begin Adventure!'
          : `Equip all heroes (${party.filter(h => { const lo = loadouts[h.id]; return lo.skills.length === 3 && lo.consumable !== null; }).length}/${party.length} ready)`
        }
      </button>
    </div>
  );
}
