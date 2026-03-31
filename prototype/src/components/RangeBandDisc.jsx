import gameData from '../data/gameData.json';

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

const HERO_COLORS = ['#2980b9', '#27ae60', '#8e44ad'];

// Compute zone positions dynamically based on zone count
function computeZonePositions(zones) {
  const cx = 210, cy = 210, radius = 130;

  if (zones.length === 1) {
    return { [zones[0].id]: { x: cx, y: cy } };
  }
  if (zones.length === 2) {
    return {
      [zones[0].id]: { x: cx, y: cy - 80 },
      [zones[1].id]: { x: cx, y: cy + 80 },
    };
  }
  if (zones.length === 3) {
    return {
      [zones[0].id]: { x: cx - 120, y: cy + 80 },
      [zones[1].id]: { x: cx, y: cy - 80 },
      [zones[2].id]: { x: cx + 120, y: cy + 80 },
    };
  }
  // 4+ zones: arrange in a circle
  const positions = {};
  zones.forEach((zone, i) => {
    const angle = (i / zones.length) * Math.PI * 2 - Math.PI / 2;
    positions[zone.id] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });
  return positions;
}

export default function ZoneMap({ zones, heroZones, heroes, enemies, selectedTarget, onSelectTarget }) {
  const size = 420;
  const positions = computeZonePositions(zones);

  return (
    <div className="zone-map-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Draw connections */}
        {zones.map(zone =>
          zone.connections.map(connId => {
            const from = positions[zone.id];
            const to = positions[connId];
            if (!from || !to) return null;
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
        {zones.map(zone => {
          const pos = positions[zone.id];
          if (!pos) return null;

          const heroesHere = heroes ? heroes.filter(h => h.hp > 0 && heroZones[h.id] === zone.id) : [];
          const enemiesHere = enemies ? enemies.filter(e => e.zoneId === zone.id && e.hp > 0) : [];
          const hasOccupant = heroesHere.length > 0 || enemiesHere.length > 0;
          const activeTags = zone.tags.filter(t => TAG_ICONS[t]);

          const occupants = [];
          heroesHere.forEach((h, idx) => {
            const heroIndex = heroes.findIndex(hero => hero.id === h.id);
            occupants.push({
              type: 'hero',
              label: h.name[0],
              name: h.name,
              color: HERO_COLORS[heroIndex % HERO_COLORS.length],
            });
          });
          enemiesHere.forEach(e => {
            const isSelected = e.id === selectedTarget;
            occupants.push({
              type: 'enemy',
              id: e.id,
              label: e.name[0],
              name: e.name,
              color: isSelected ? '#e74c3c' : '#c0392b',
            });
          });

          const spacing = 30;
          const startX = pos.x - ((occupants.length - 1) * spacing) / 2;

          return (
            <g key={zone.id}>
              <circle
                cx={pos.x} cy={pos.y} r={55}
                fill={heroesHere.length > 0 ? '#3d2b1a' : '#2a1f14'}
                stroke={hasOccupant ? '#d4a574' : '#5c3a1e'}
                strokeWidth={hasOccupant ? 2.5 : 1.5}
                opacity={hasOccupant ? 1 : 0.6}
              />

              <text
                x={pos.x} y={pos.y - 38}
                textAnchor="middle" fill="#d4a574"
                fontSize="11" fontFamily="serif" fontWeight="bold"
              >
                {zone.name}
              </text>

              <text
                x={pos.x} y={pos.y - 26}
                textAnchor="middle" fill="#b8a080"
                fontSize="9" fontFamily="serif"
              >
                {activeTags.map(t => `${TAG_ICONS[t]} ${t}`).join('  ')}
              </text>

              {occupants.map((occ, i) => (
                <g
                  key={occ.type + (occ.id || '') + i}
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
              ))}
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
