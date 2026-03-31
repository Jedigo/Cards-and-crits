const TIER_COLORS = {
  'Miss': '#666',
  'Graze': '#b8a080',
  'Hit': '#e67e22',
  'Strong Hit': '#e74c3c',
  'Critical': '#f1c40f',
};

export default function DiceRoller({ dice }) {
  const hasRoll = dice.results.length > 0 || dice.bonusDice?.length > 0;
  if (!hasRoll) return null;

  return (
    <div className={`dice-roller${dice.isNatural16 ? ' exploding' : ''}`}>
      {/* Main 2d8 */}
      {dice.results.length > 0 && (
        <div className="dice-tray">
          {dice.results.map((value, i) => (
            <div key={i} className={`die d8${dice.isNatural16 ? ' natural16' : ''}`}>{value}</div>
          ))}
          {dice.total > 0 && (
            <div className="dice-total">= {dice.total}</div>
          )}
        </div>
      )}

      {/* Bonus dice from equipment, zone effects, crits */}
      {dice.bonusDice?.length > 0 && (
        <div className="dice-tray bonus">
          {dice.bonusDice.map((bd, i) => (
            <div key={i} className={`die d${bd.sides}`} title={bd.reason}>
              <span className="die-label">d{bd.sides}</span>
              <span className="die-value">{bd.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tier result */}
      {dice.tier && (
        <div className="dice-result" style={{ color: TIER_COLORS[dice.tier] || '#ccc' }}>
          {dice.tier}{dice.damage > 0 ? ` — ${dice.damage} damage` : ''}
        </div>
      )}
    </div>
  );
}
