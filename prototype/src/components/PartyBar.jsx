const HERO_COLORS = ['#2980b9', '#27ae60', '#8e44ad'];

export default function PartyBar({ heroes, activeHeroIndex, heroZones }) {
  return (
    <div className="party-bar">
      {heroes.map((hero, i) => {
        const pct = Math.max(0, (hero.hp / hero.stats.maxHp) * 100);
        const isActive = i === activeHeroIndex;
        const isDead = hero.hp <= 0;
        const color = HERO_COLORS[i % HERO_COLORS.length];

        return (
          <div key={hero.id} className={`party-member ${isActive ? 'active' : ''} ${isDead ? 'dead' : ''}`}>
            <div className="party-member-header">
              <span className="party-member-name" style={{ color }}>{hero.name}</span>
              <span className="party-member-hp">{hero.hp}/{hero.stats.maxHp}</span>
            </div>
            <div className="health-track">
              <div className="health-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <div className="party-member-info">
              <span className="party-member-class">{hero.class}</span>
              {heroZones && <span className="party-member-zone">{heroZones[hero.id]}</span>}
            </div>
            {isActive && <div className="active-indicator">&#9654; Active</div>}
          </div>
        );
      })}
    </div>
  );
}
