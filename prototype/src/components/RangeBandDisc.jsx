import gameData from '../data/gameData.json';

const { encounter } = gameData;

// Layout positions for zones on the SVG canvas
const ZONE_POSITIONS = {
  main_floor: { x: 200, y: 200 },
  balcony: { x: 200, y: 60 },
  bar: { x: 60, y: 280 },
  back_room: { x: 340, y: 280 },
};

const TAG_ICONS = {
  elevated: '\u2191',
  cover: '\u26E8',
  shadowed: '\u263D',
  tight: '\u2194',
  open: '',
  chaotic: '',
  exposed: '',
  difficult: '',
};

export default function ZoneMap({ heroZone, enemies, selectedTarget, onSelectTarget }) {
  const size = 420;

  return (
    <div className="zone-map-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Draw connections first */}
        {encounter.zones.map(zone =>
          zone.connections.map(connId => {
            const from = ZONE_POSITIONS[zone.id];
            const to = ZONE_POSITIONS[connId];
            if (!from || !to) return null;
            // Only draw each line once
            if (zone.id > connId) return null;
            return (
              <line
                key={`${zone.id}-${connId}`}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#5c3a1e"
                strokeWidth="3"
                strokeDasharray="8,4"
                opacity="0.6"
              />
            );
          })
        )}

        {/* Draw zones */}
        {encounter.zones.map(zone => {
          const pos = ZONE_POSITIONS[zone.id];
          if (!pos) return null;

          const heroHere = heroZone === zone.id;
          const enemiesHere = enemies.filter(e => e.zoneId === zone.id && e.hp > 0);
          const hasOccupant = heroHere || enemiesHere.length > 0;
          const activeTags = zone.tags.filter(t => TAG_ICONS[t]);

          return (
            <g key={zone.id}>
              {/* Zone circle */}
              <circle
                cx={pos.x} cy={pos.y} r={55}
                fill={heroHere ? '#3d2b1a' : '#2a1f14'}
                stroke={hasOccupant ? '#d4a574' : '#5c3a1e'}
                strokeWidth={hasOccupant ? 2.5 : 1.5}
                opacity={hasOccupant ? 1 : 0.6}
              />

              {/* Zone name */}
              <text
                x={pos.x} y={pos.y - 38}
                textAnchor="middle" fill="#d4a574"
                fontSize="11" fontFamily="serif" fontWeight="bold"
              >
                {zone.name}
              </text>

              {/* Tags */}
              <text
                x={pos.x} y={pos.y - 26}
                textAnchor="middle" fill="#b8a080"
                fontSize="9" fontFamily="serif"
              >
                {activeTags.map(t => `${TAG_ICONS[t]} ${t}`).join('  ')}
              </text>

              {/* Standees inside zone */}
              {(() => {
                const occupants = [];
                if (heroHere) occupants.push({ type: 'hero', label: 'K', name: gameData.hero.name, color: '#2980b9' });
                enemiesHere.forEach(e => {
                  const isSelected = e.id === selectedTarget;
                  occupants.push({ type: 'enemy', id: e.id, label: e.name[0], name: e.name, color: isSelected ? '#e74c3c' : '#c0392b' });
                });

                const spacing = 30;
                const startX = pos.x - ((occupants.length - 1) * spacing) / 2;

                return occupants.map((occ, i) => (
                  <g
                    key={occ.type + (occ.id || '')}
                    onClick={occ.type === 'enemy' ? () => onSelectTarget(occ.id) : undefined}
                    style={occ.type === 'enemy' ? { cursor: 'pointer' } : {}}
                  >
                    <Standee
                      cx={startX + i * spacing}
                      cy={pos.y + 6}
                      label={occ.label}
                      name={occ.name}
                      color={occ.color}
                    />
                  </g>
                ));
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Standee({ cx, cy, label, name, color }) {
  return (
    <g>
      <rect x={cx - 12} y={cy + 8} width={24} height={5} rx={2} fill="#8b7355" stroke="#5c3a1e" strokeWidth="1" />
      <rect x={cx - 10} y={cy - 14} width={20} height={24} rx={3} fill={color} stroke="#222" strokeWidth="2" />
      <text x={cx} y={cy + 1} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold" fontFamily="serif">
        {label}
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#f5e6c8" fontSize="7" fontFamily="serif">
        {name}
      </text>
    </g>
  );
}
