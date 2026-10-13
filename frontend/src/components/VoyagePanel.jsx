import React from 'react';

export function VoyagePanel({
  startPoint,
  endPoint,
  mission,
  startName,
  destinationName,
  isLoading,
  hintText,
  onPlanRoute,
  onReset,
}) {
  const formatCoord = (pt) => {
    if (!pt) return 'Not set';
    const latVal = Array.isArray(pt) ? pt[0] : pt.lat;
    const lonVal = Array.isArray(pt) ? pt[1] : pt.lon;
    if (latVal === undefined || lonVal === undefined) return 'Not set';
    const lat = latVal < 0 ? `${Math.abs(latVal).toFixed(2)}°S` : `${latVal.toFixed(2)}°N`;
    const lon = lonVal < 0 ? `${Math.abs(lonVal).toFixed(2)}°W` : `${lonVal.toFixed(2)}°E`;
    return `${lat}, ${lon}`;
  };

  return (
    <div className="card">
      {mission && (
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 'var(--space-sm)',
          }}
        >
          {mission}
        </div>
      )}

      <div className="voyage-coords">
        <div>
          <div className="coord-label">{startName ? `Departure: ${startName}` : 'Departure (Start)'}</div>
          <div className="coord-val mono">{formatCoord(startPoint)}</div>
        </div>
        <div>
          <div className="coord-label">{destinationName ? `Destination: ${destinationName}` : 'Destination (End)'}</div>
          <div className="coord-val mono">{formatCoord(endPoint)}</div>
        </div>
      </div>

      <div className="voyage-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={isLoading || !startPoint || !endPoint}
          onClick={onPlanRoute}
        >
          {isLoading ? 'Analysing…' : 'Plan route'}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={isLoading}
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      <p className="voyage-hint">{hintText}</p>
    </div>
  );
}
