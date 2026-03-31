import { useEffect, useRef } from 'react';

export default function CombatLog({ log }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  return (
    <div className="combat-log">
      <h3>Combat Log</h3>
      <div className="log-entries">
        {log.map((entry, i) => (
          <div key={i} className={`log-entry log-${entry.type}`}>
            {entry.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
