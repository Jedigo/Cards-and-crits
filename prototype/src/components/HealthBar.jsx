export default function HealthBar({ name, hp, maxHp, passive, color }) {
  const pct = Math.max(0, (hp / maxHp) * 100);

  return (
    <div className="health-bar-container">
      <div className="health-label">
        <span className="char-name" style={{ color }}>{name}</span>
        <span className="hp-text">{hp} / {maxHp}</span>
      </div>
      <div className="health-track">
        <div
          className="health-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {passive && (
        <div className="passive-label">
          {passive.name}: {passive.description}
        </div>
      )}
    </div>
  );
}
