import gameData from '../data/gameData.json';

function getEnvironment(id) {
  return gameData.environments.find(e => e.id === id);
}

function getNarrative(id) {
  return gameData.narratives.find(n => n.id === id);
}

const SCENE_TYPE_LABELS = {
  combat: 'Combat',
  rest_and_check: 'Rest & Exploration',
};

export default function SceneIntro({ sceneIndex, party, dispatch }) {
  const sceneData = gameData.scenes[sceneIndex];
  const env = getEnvironment(sceneData.environmentId);
  const narrative = getNarrative(sceneData.narrativeId);

  return (
    <div className="scene-intro">
      <div className="scene-intro-card">
        <div className="scene-intro-type">{SCENE_TYPE_LABELS[sceneData.type] || sceneData.type}</div>
        <h2 className="scene-intro-title">{sceneData.title}</h2>
        <div className="scene-intro-env">{env.name}</div>
        <p className="scene-intro-narrative">{narrative.text}</p>

        {sceneData.type === 'combat' && (
          <div className="scene-intro-enemies">
            <strong>Enemies:</strong>{' '}
            {sceneData.enemies.map(e => e.name).join(', ')}
          </div>
        )}

        <div className="scene-intro-zones">
          <strong>Zones:</strong>{' '}
          {env.zones.map(z => z.name).join(' — ')}
        </div>

        <div className="scene-intro-party">
          {party.map(h => (
            <div key={h.id} className="scene-intro-hero">
              {h.name}: {h.hp}/{h.stats.maxHp} HP
            </div>
          ))}
        </div>

        <button
          className="action-btn start-scene"
          onClick={() => dispatch({ type: 'START_SCENE' })}
        >
          Enter Scene
        </button>
      </div>
    </div>
  );
}
