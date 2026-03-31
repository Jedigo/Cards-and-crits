import { useReducer } from 'react';
import { gameReducer, createInitialState } from './state/gameReducer';
import ZoneMap from './components/RangeBandDisc';
import DiceRoller from './components/DiceRoller';
import ActionBar from './components/ActionBar';
import HealthBar from './components/HealthBar';
import CombatLog from './components/CombatLog';
import './App.css';

function App() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  return (
    <div className="game-table">
      <h1 className="title">Combat Prototype — Tavern Brawl</h1>

      <div className="battlefield">
        <div className="stats-column">
          <HealthBar
            name={state.hero.name}
            hp={state.hero.hp}
            maxHp={state.hero.stats.maxHp}
            passive={state.hero.passive}
            color="#2980b9"
          />
          {state.enemies.filter(e => e.hp > 0).map(enemy => (
            <HealthBar
              key={enemy.id}
              name={enemy.name}
              hp={enemy.hp}
              maxHp={enemy.stats.maxHp}
              passive={{ name: enemy.behavior, description: `${enemy.behavior} behavior` }}
              color="#c0392b"
            />
          ))}
          <DiceRoller dice={state.dice} />
        </div>

        <ZoneMap
          heroZone={state.heroZone}
          enemies={state.enemies}
          selectedTarget={state.selectedTarget}
          onSelectTarget={(id) => dispatch({ type: 'SELECT_TARGET', targetId: id })}
        />
      </div>

      <ActionBar state={state} dispatch={dispatch} />
      <CombatLog log={state.log} />
    </div>
  );
}

export default App;
