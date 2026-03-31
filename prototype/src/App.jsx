import { useReducer } from 'react';
import { runReducer, createInitialState } from './state/runReducer';
import HeroSelect from './components/HeroSelect';
import LoadoutScreen from './components/LoadoutScreen';
import SceneIntro from './components/SceneIntro';
import SceneComplete from './components/SceneComplete';
import PartyBar from './components/PartyBar';
import RestScene from './components/RestScene';
import ZoneMap from './components/RangeBandDisc';
import DiceRoller from './components/DiceRoller';
import ActionBar from './components/ActionBar';
import HealthBar from './components/HealthBar';
import CombatLog from './components/CombatLog';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(runReducer, null, createInitialState);

  // --- Hero Selection ---
  if (state.phase === 'hero_select') {
    return (
      <div className="game-table">
        <h1 className="title">Starter Box — Choose Your Heroes</h1>
        <HeroSelect party={state.party} dispatch={dispatch} />
        <CombatLog log={state.log} />
      </div>
    );
  }

  // --- Loadout ---
  if (state.phase === 'loadout') {
    return (
      <div className="game-table">
        <h1 className="title">Starter Box — Loadout</h1>
        <LoadoutScreen party={state.party} loadouts={state.loadouts} dispatch={dispatch} />
      </div>
    );
  }

  // --- Scene Intro ---
  if (state.phase === 'scene_intro') {
    return (
      <div className="game-table">
        <h1 className="title">Starter Box Adventure</h1>
        <div className="scene-progress">
          Scene {state.currentSceneIndex + 1} of {state.scenes.length}
        </div>
        <SceneIntro
          sceneIndex={state.currentSceneIndex}
          party={state.party}
          dispatch={dispatch}
        />
        <CombatLog log={state.log} />
      </div>
    );
  }

  // --- Scene Active ---
  if (state.phase === 'scene_active' && state.scene) {
    const scene = state.scene;

    // Non-combat scene
    if (scene.type === 'rest_and_check') {
      return (
        <div className="game-table">
          <h1 className="title">Starter Box Adventure</h1>
          <div className="scene-progress">
            Scene {state.currentSceneIndex + 1} of {state.scenes.length}
          </div>
          <RestScene scene={scene} dispatch={dispatch} />
          <CombatLog log={state.log} />
        </div>
      );
    }

    // Combat scene
    if (scene.type === 'combat') {
      const activeHero = scene.heroes[scene.activeHeroIndex];

      return (
        <div className="game-table">
          <h1 className="title">Starter Box — {scene.environment.name}</h1>
          <div className="scene-progress">
            Scene {state.currentSceneIndex + 1} of {state.scenes.length}
          </div>

          <div className="battlefield">
            <div className="stats-column">
              <PartyBar
                heroes={scene.heroes}
                activeHeroIndex={scene.activeHeroIndex}
                heroZones={scene.heroZones}
              />
              {scene.enemies.filter(e => e.hp > 0).map(enemy => (
                <HealthBar
                  key={enemy.id}
                  name={enemy.name}
                  hp={enemy.hp}
                  maxHp={enemy.stats.maxHp}
                  passive={{ name: enemy.behavior, description: `${enemy.behavior} behavior` }}
                  color="#c0392b"
                />
              ))}
              <DiceRoller dice={scene.dice} />
            </div>

            <ZoneMap
              zones={scene.environment.zones}
              heroZones={scene.heroZones}
              heroes={scene.heroes}
              enemies={scene.enemies}
              selectedTarget={scene.selectedTarget}
              onSelectTarget={(id) => dispatch({ type: 'SELECT_TARGET', targetId: id })}
            />
          </div>

          <ActionBar scene={scene} dispatch={dispatch} />
          <CombatLog log={state.log} />
        </div>
      );
    }
  }

  // --- Run Victory ---
  if (state.phase === 'run_victory') {
    return (
      <div className="game-table">
        <h1 className="title">Starter Box Adventure</h1>
        <div className="run-end">
          <div className="game-over victory">ADVENTURE COMPLETE!</div>
          <p className="run-end-text">Your heroes have triumphed over the bandit threat!</p>
          <div className="run-end-party">
            {state.party.map(h => (
              <div key={h.id} className="run-end-hero">
                {h.name}: {h.hp}/{h.stats.maxHp} HP
              </div>
            ))}
          </div>
          <button className="action-btn restart" onClick={() => dispatch({ type: 'RESTART' })}>
            Play Again
          </button>
        </div>
        <CombatLog log={state.log} />
      </div>
    );
  }

  // --- Run Defeat ---
  if (state.phase === 'run_defeat') {
    return (
      <div className="game-table">
        <h1 className="title">Starter Box Adventure</h1>
        <div className="run-end">
          <div className="game-over defeat">ADVENTURE FAILED</div>
          <p className="run-end-text">Your heroes have fallen. But even failure teaches wisdom.</p>
          <button className="action-btn restart" onClick={() => dispatch({ type: 'RESTART' })}>
            Try Again
          </button>
        </div>
        <CombatLog log={state.log} />
      </div>
    );
  }

  return null;
}

export default App;
