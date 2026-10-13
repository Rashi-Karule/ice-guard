import React from 'react';

export function DecisionLog({ decisions = [] }) {
  if (!decisions || decisions.length === 0) return null;

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-heading">Session Decision Log</h2>
      </div>

      <ul className="decision-log-list">
        {decisions.map((item, idx) => {
          const timeStr = item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '--:--:--';

          return (
            <li key={item.id || idx} className="decision-log-item">
              <div>
                <span className={`decision-log-badge ${item.decision}`}>
                  {item.decision}
                </span>{' '}
                <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {item.route} route
                </span>
              </div>
              <span className="decision-log-time mono">{timeStr}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
