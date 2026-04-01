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

const TAG_STYLES = {
  elevated: { bg: '#443d2e', border: '#8b7a5a' },
  cover: { bg: '#2a3d28', border: '#4a7a44' },
  shadowed: { bg: '#28263d', border: '#5a5880' },
  open: { bg: '#3d2b1a', border: '#6a4a2a' },
  chaotic: { bg: '#4a2a1a', border: '#8a4a2a' },
  tight: { bg: '#383828', border: '#5a5a3a' },
  exposed: { bg: '#4a3a28', border: '#7a6a4a' },
  difficult: { bg: '#3a2818', border: '#5a3a1a' },
};

// Terrain textures per zone — CSS backgrounds that look like battle map surfaces
const ZONE_TERRAIN = {
  // Dusty Road
  treeline: {
    background: `
      radial-gradient(ellipse at 15% 25%, rgba(30,70,25,0.6) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 20%, rgba(25,65,20,0.5) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 75%, rgba(35,75,30,0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 70%, rgba(20,55,18,0.5) 0%, transparent 35%),
      linear-gradient(135deg, #1e3318 0%, #243d1e 50%, #1a2e15 100%)`,
    borderColor: '#3a6a30',
  },
  road: {
    background: `
      repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(0,0,0,0.08) 18px, rgba(0,0,0,0.08) 20px),
      repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(0,0,0,0.06) 14px, rgba(0,0,0,0.06) 16px),
      radial-gradient(ellipse at 50% 50%, rgba(140,110,70,0.2) 0%, transparent 70%),
      linear-gradient(180deg, #5a4228 0%, #4a3820 50%, #5a4228 100%)`,
    borderColor: '#7a6040',
  },
  hillside: {
    background: `
      radial-gradient(ellipse at 30% 40%, rgba(100,90,70,0.4) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 25%, rgba(90,80,60,0.3) 0%, transparent 35%),
      radial-gradient(ellipse at 55% 75%, rgba(110,100,75,0.3) 0%, transparent 45%),
      linear-gradient(160deg, #4a4030 0%, #56493a 40%, #3d3528 100%)`,
    borderColor: '#8b7a5a',
  },
  // Roadside Camp
  campfire: {
    background: `
      radial-gradient(circle at 50% 50%, rgba(180,100,30,0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(120,60,10,0.1) 0%, transparent 70%),
      radial-gradient(ellipse at 30% 60%, rgba(80,60,40,0.3) 0%, transparent 40%),
      linear-gradient(135deg, #3d3020 0%, #4a3828 50%, #3a2e1e 100%)`,
    borderColor: '#8a6030',
  },
  perimeter: {
    background: `
      radial-gradient(ellipse at 40% 30%, rgba(60,50,35,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(50,40,30,0.3) 0%, transparent 45%),
      linear-gradient(180deg, #3a3025 0%, #302820 50%, #3a3025 100%)`,
    borderColor: '#6a5a40',
  },
  // Bandit Hideout
  entrance: {
    background: `
      radial-gradient(ellipse at 50% 30%, rgba(70,65,55,0.3) 0%, transparent 50%),
      repeating-linear-gradient(0deg, transparent 0px, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 12px),
      linear-gradient(180deg, #4a4540 0%, #3a3530 50%, #4a4540 100%)`,
    borderColor: '#6a6458',
  },
  main_chamber: {
    background: `
      radial-gradient(ellipse at 25% 35%, rgba(80,70,55,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 75% 65%, rgba(70,60,45,0.3) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 50%, rgba(90,75,55,0.15) 0%, transparent 60%),
      repeating-linear-gradient(45deg, transparent 0px, transparent 20px, rgba(0,0,0,0.03) 20px, rgba(0,0,0,0.03) 22px),
      linear-gradient(135deg, #3a3530 0%, #453f38 50%, #3a3530 100%)`,
    borderColor: '#7a7060',
  },
  ledge: {
    background: `
      radial-gradient(ellipse at 40% 30%, rgba(100,90,70,0.4) 0%, transparent 35%),
      radial-gradient(ellipse at 70% 60%, rgba(90,80,65,0.3) 0%, transparent 40%),
      linear-gradient(170deg, #504838 0%, #453d30 30%, #584f40 100%)`,
    borderColor: '#8a7a60',
  },
  supply_alcove: {
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(30,28,40,0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 70%, rgba(40,35,50,0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 30%, rgba(35,30,45,0.3) 0%, transparent 35%),
      linear-gradient(135deg, #2a2838 0%, #322e40 50%, #28263a 100%)`,
    borderColor: '#5a5870',
  },
  // Tavern (legacy)
  balcony: {
    background: `
      repeating-linear-gradient(90deg, transparent 0px, transparent 22px, rgba(0,0,0,0.06) 22px, rgba(0,0,0,0.06) 24px),
      linear-gradient(180deg, #4a4035 0%, #554a3e 50%, #4a4035 100%)`,
    borderColor: '#7a6a55',
  },
  main_floor: {
    background: `
      repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(0,0,0,0.05) 30px, rgba(0,0,0,0.05) 32px),
      repeating-linear-gradient(0deg, transparent 0px, transparent 30px, rgba(0,0,0,0.04) 30px, rgba(0,0,0,0.04) 32px),
      linear-gradient(135deg, #4a3828 0%, #553f2e 50%, #4a3828 100%)`,
    borderColor: '#7a6040',
  },
  bar: {
    background: `
      repeating-linear-gradient(0deg, rgba(80,60,35,0.15) 0px, rgba(80,60,35,0.15) 8px, transparent 8px, transparent 16px),
      linear-gradient(90deg, #3d2e1e 0%, #4a3828 50%, #3d2e1e 100%)`,
    borderColor: '#6a5030',
  },
  back_room: {
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(30,25,35,0.4) 0%, transparent 60%),
      linear-gradient(135deg, #2e2830 0%, #382e35 50%, #2a2530 100%)`,
    borderColor: '#5a4858',
  },
};

const HERO_COLORS = ['#2980b9', '#27ae60', '#8e44ad'];

const SURFACE_W = 580;
const SURFACE_H = 440;
const TILE_W = 150;
const TILE_H = 95;

function computeZonePositions(zones) {
  const cx = SURFACE_W / 2;
  const cy = SURFACE_H / 2;

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
      [zones[0].id]: { x: cx - 140, y: cy + 60 },
      [zones[1].id]: { x: cx, y: cy - 70 },
      [zones[2].id]: { x: cx + 140, y: cy + 60 },
    };
  }
  if (zones.length === 4) {
    return {
      [zones[0].id]: { x: cx, y: cy - 110 },
      [zones[1].id]: { x: cx, y: cy + 10 },
      [zones[2].id]: { x: cx - 160, y: cy + 120 },
      [zones[3].id]: { x: cx + 160, y: cy + 120 },
    };
  }
  // 5+ zones: circle
  const radius = 150;
  const positions = {};
  zones.forEach((zone, i) => {
    const angle = (i / zones.length) * Math.PI * 2 - Math.PI / 2;
    positions[zone.id] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.7,
    };
  });
  return positions;
}

function getZoneStyle(tags) {
  for (const tag of tags) {
    if (TAG_STYLES[tag]) return TAG_STYLES[tag];
  }
  return TAG_STYLES.open;
}

function ConnectionLine({ from, to }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <div className="zone-connection" style={{
      position: 'absolute',
      left: midX - distance / 2,
      top: midY,
      width: distance,
      transform: `rotate(${angle}deg)`,
    }} />
  );
}

export default function ZoneMap({ zones, heroZones, heroes, enemies, selectedTarget, onSelectTarget }) {
  const positions = computeZonePositions(zones);

  return (
    <div className="zone-map-container">
      <div className="zone-map-surface">
        {/* Connection lines */}
        {zones.map(zone =>
          zone.connections.map(connId => {
            if (zone.id > connId) return null;
            const from = positions[zone.id];
            const to = positions[connId];
            if (!from || !to) return null;
            return <ConnectionLine key={`${zone.id}-${connId}`} from={from} to={to} />;
          })
        )}

        {/* Zone tiles */}
        {zones.map(zone => {
          const pos = positions[zone.id];
          if (!pos) return null;
          const style = getZoneStyle(zone.tags);
          const heroesHere = heroes ? heroes.filter(h => h.hp > 0 && heroZones[h.id] === zone.id) : [];
          const enemiesHere = enemies ? enemies.filter(e => e.zoneId === zone.id && e.hp > 0) : [];
          const hasOccupant = heroesHere.length > 0 || enemiesHere.length > 0;
          const activeTags = zone.tags.filter(t => TAG_ICONS[t]);

          const occupants = [];
          heroesHere.forEach((h) => {
            const heroIndex = heroes.findIndex(hero => hero.id === h.id);
            occupants.push({
              type: 'hero',
              label: h.name[0],
              name: h.name,
              color: HERO_COLORS[heroIndex % HERO_COLORS.length],
            });
          });
          enemiesHere.forEach(e => {
            occupants.push({
              type: 'enemy',
              id: e.id,
              label: e.name[0],
              name: e.name,
              color: e.id === selectedTarget ? '#e74c3c' : '#c0392b',
              selected: e.id === selectedTarget,
            });
          });

          const terrain = ZONE_TERRAIN[zone.id];

          return (
            <div
              key={zone.id}
              className={`zone-tile ${hasOccupant ? 'occupied' : ''}`}
              style={{
                left: pos.x - TILE_W / 2,
                top: pos.y - TILE_H / 2,
                width: TILE_W,
                height: TILE_H,
                background: terrain ? terrain.background : style.bg,
                borderColor: hasOccupant ? '#d4a574' : (terrain ? terrain.borderColor : style.border),
              }}
            >

              <div className="zone-tile-name">{zone.name}</div>
              {activeTags.length > 0 && (
                <div className="zone-tile-tags">
                  {activeTags.map(t => `${TAG_ICONS[t]} ${t}`).join('  ')}
                </div>
              )}

              {/* Standees */}
              {occupants.length > 0 && (
                <div className="zone-standees">
                  {occupants.map((occ, i) => (
                    <div
                      key={occ.type + (occ.id || '') + i}
                      className={`standee ${occ.type} ${occ.selected ? 'selected' : ''}`}
                      style={{ backgroundColor: occ.color }}
                      onClick={occ.type === 'enemy' ? () => onSelectTarget(occ.id) : undefined}
                    >
                      <span className="standee-label">{occ.label}</span>
                      <span className="standee-name">{occ.name}</span>
                      <div className="standee-base" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
