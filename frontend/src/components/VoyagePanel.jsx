import React from 'react';

const PRESETS = [
  {
    name: 'Neumayer III Resupply (Default)',
    mission: 'Antarctic Resupply Voyage — Neumayer III Station',
    start: [-61.0, 2.0],
    startName: 'Bouvet Island Staging',
    dest: [-69.0, 18.0],
    destName: 'Atka Bay (Neumayer III)',
  },
  {
    name: 'Maitri Station Resupply (Indian Antarctic)',
    mission: 'Maitri Station Resupply Voyage',
    start: [-54.0, 3.0],
    startName: 'Cape Town Approach',
    dest: [-70.76, 11.73],
    destName: 'Maitri Station Shelf',
  },
  {
    name: 'Weddell Sea Inbound Transit',
    mission: 'Halley VI Scientific Relief',
    start: [-60.5, 4.0],
    startName: 'South Atlantic Entry',
    dest: [-68.5, 15.0],
    destName: 'Riiser-Larsen Barrier',
  },
];

export function VoyagePanel({
  startPoint,
  endPoint,
  mission,
  startName,
  destinationName,
  onUpdateStart,
  onUpdateEnd,
  onUpdateStartName,
  onUpdateDestName,
  onApplyPreset,
  isLoading,
  hintText,
  onPlanRoute,
  onReset,
}) {
  const startLat = startPoint ? startPoint[0] : '';
  const startLon = startPoint ? startPoint[1] : '';
  const endLat = endPoint ? endPoint[0] : '';
  const endLon = endPoint ? endPoint[1] : '';

  const handleStartCoordChange = (lat, lon) => {
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (!isNaN(nLat) && !isNaN(nLon)) {
      onUpdateStart([nLat, nLon]);
    }
  };

  const handleEndCoordChange = (lat, lon) => {
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (!isNaN(nLat) && !isNaN(nLon)) {
      onUpdateEnd([nLat, nLon]);
    }
  };

  return (
    <div className="card">
      {/* Preset selector */}
      <div className="preset-selector">
        <select
          className="select-input"
          defaultValue=""
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            if (!isNaN(idx) && PRESETS[idx]) {
              onApplyPreset(PRESETS[idx]);
            }
          }}
        >
          <option value="" disabled>Select Voyage Preset…</option>
          {PRESETS.map((p, idx) => (
            <option key={idx} value={idx}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="voyage-inputs">
        {/* Departure Box */}
        <div className="waypoint-box">
          <div className="waypoint-box-header">
            <span className="waypoint-tag">Departure (Start)</span>
          </div>
          <div className="input-row">
            <input
              type="text"
              className="input-field"
              placeholder="Departure location name"
              value={startName || ''}
              onChange={(e) => onUpdateStartName(e.target.value)}
            />
          </div>
          <div className="input-row">
            <span className="input-label-small">Lat:</span>
            <input
              type="number"
              step="0.01"
              className="input-field mono"
              value={startLat}
              onChange={(e) => handleStartCoordChange(e.target.value, startLon)}
            />
            <span className="input-label-small">Lon:</span>
            <input
              type="number"
              step="0.01"
              className="input-field mono"
              value={startLon}
              onChange={(e) => handleStartCoordChange(startLat, e.target.value)}
            />
          </div>
        </div>

        {/* Destination Box */}
        <div className="waypoint-box">
          <div className="waypoint-box-header">
            <span className="waypoint-tag">Destination (End)</span>
          </div>
          <div className="input-row">
            <input
              type="text"
              className="input-field"
              placeholder="Destination location name"
              value={destinationName || ''}
              onChange={(e) => onUpdateDestName(e.target.value)}
            />
          </div>
          <div className="input-row">
            <span className="input-label-small">Lat:</span>
            <input
              type="number"
              step="0.01"
              className="input-field mono"
              value={endLat}
              onChange={(e) => handleEndCoordChange(e.target.value, endLon)}
            />
            <span className="input-label-small">Lon:</span>
            <input
              type="number"
              step="0.01"
              className="input-field mono"
              value={endLon}
              onChange={(e) => handleEndCoordChange(endLat, e.target.value)}
            />
          </div>
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
