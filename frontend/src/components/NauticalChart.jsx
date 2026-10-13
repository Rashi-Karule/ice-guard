import React, { useRef, useState } from 'react';
import { ROUTE_CONFIG, ROUTE_ORDER, getRouteKey } from '../config';

const MIN_LAT = -70;
const MAX_LAT = -60;
const MIN_LON = 0;
const MAX_LON = 20;

const WIDTH = 1000;
const HEIGHT = 600;

function project(lat, lon) {
  const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * WIDTH;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * HEIGHT;
  return [x, y];
}

function unproject(x, y) {
  const lon = MIN_LON + (x / WIDTH) * (MAX_LON - MIN_LON);
  const lat = MAX_LAT - (y / HEIGHT) * (MAX_LAT - MIN_LAT);
  return [+lat.toFixed(4), +lon.toFixed(4)];
}

// Satellite tiles for zoom level 5 covering Antarctica (60°S-70°S, 0°E-20°E)
const SATELLITE_TILES = [
  { x: 16, y: 21 }, { x: 17, y: 21 },
  { x: 16, y: 22 }, { x: 17, y: 22 },
  { x: 16, y: 23 }, { x: 17, y: 23 },
];

export function NauticalChart({
  scene,
  startPoint,
  endPoint,
  routes,
  selectedRoute,
  onMapClick,
}) {
  const svgRef = useRef(null);
  const [hoveredBerg, setHoveredBerg] = useState(null);

  const handleClick = (e) => {
    if (!svgRef.current || !onMapClick) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * HEIGHT;
    onMapClick(unproject(clickX, clickY));
  };

  const { ice = [], bergs = [], dlat = -0.17, dlon = 0.34 } = scene || {};
  const startPos = startPoint ? project(startPoint[0], startPoint[1]) : null;
  const endPos = endPoint ? project(endPoint[0], endPoint[1]) : null;
  const activeRouteKey = selectedRoute ? getRouteKey({ id: selectedRoute, name: selectedRoute }) : null;

  const parallels = [-60, -62, -64, -66, -68, -70];
  const meridians = [0, 5, 10, 15, 20];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a131c' }}>
      {/* Real Satellite Imagery Basemap Tiles (like Google Maps Satellite) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          opacity: 0.88,
          pointerEvents: 'none',
        }}
      >
        {SATELLITE_TILES.map((t, idx) => (
          <img
            key={idx}
            src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/${t.y}/${t.x}`}
            alt="Satellite tile"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.9) contrast(1.1)' }}
            loading="lazy"
          />
        ))}
      </div>

      {/* Interactive Tactical SVG Layer */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        onClick={handleClick}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
      >
        {/* Subtle graticule lines */}
        {parallels.map((lat) => {
          const [, y] = project(lat, 0);
          return (
            <g key={`lat-${lat}`}>
              <line x1="0" y1={y} x2={WIDTH} y2={y} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
              <text x="8" y={Math.max(16, y - 4)} fill="#e8ecf1" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">
                {Math.abs(lat)}°S
              </text>
            </g>
          );
        })}

        {meridians.map((lon) => {
          const [x] = project(-60, lon);
          return (
            <g key={`lon-${lon}`}>
              <line x1={x} y1="0" x2={x} y2={HEIGHT} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={Math.min(WIDTH - 35, x + 4)} y={HEIGHT - 8} fill="#e8ecf1" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">
                {lon}°E
              </text>
            </g>
          );
        })}

        {/* Sea ice grid cells */}
        {ice.map(([lat, lon, val], idx) => {
          const [x, y] = project(lat, lon);
          const [x2, y2] = project(lat + dlat, lon + dlon);
          return (
            <rect
              key={`ice-${idx}`}
              x={x}
              y={y}
              width={Math.abs(x2 - x)}
              height={Math.abs(y2 - y)}
              fill="#2a7ab5"
              fillOpacity={Math.min(0.6, val * 0.65)}
              pointerEvents="none"
            />
          );
        })}

        {/* Iceberg risk zones */}
        {bergs.map((b, idx) => {
          const [cx, cy] = project(b.lat, b.lon);
          return (
            <g
              key={`berg-${idx}`}
              onMouseEnter={() => setHoveredBerg({ ...b, cx, cy })}
              onMouseLeave={() => setHoveredBerg(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={cx} cy={cy} r={32} fill="#e05252" fillOpacity="0.25" stroke="#e05252" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={cx} cy={cy} r="3" fill="#e05252" />
            </g>
          );
        })}

        {/* Dashed Hint Line */}
        {startPos && endPos && (
          <line x1={startPos[0]} y1={startPos[1]} x2={endPos[0]} y2={endPos[1]} stroke="#4db8ff" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.7" />
        )}

        {/* Candidate Route Polylines */}
        {routes &&
          ROUTE_ORDER.map((key) => {
            const r = routes.find((item) => getRouteKey(item) === key);
            if (!r || !r.path) return null;
            const cfg = ROUTE_CONFIG[key];
            const isSelected = activeRouteKey === key;
            const pointsStr = r.path.map(([lat, lon]) => project(lat, lon).map((n) => n.toFixed(1)).join(',')).join(' ');

            return (
              <polyline
                key={`route-${key}`}
                points={pointsStr}
                fill="none"
                stroke={cfg.color}
                strokeWidth={isSelected ? cfg.weight * 1.6 : cfg.weight}
                strokeDasharray={cfg.dashed ? '6 4' : 'none'}
                strokeOpacity={!activeRouteKey || isSelected ? 1 : 0.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

        {/* Start / End Markers */}
        {startPos && (
          <g transform={`translate(${startPos[0]}, ${startPos[1]})`}>
            <circle r="7" fill="#4db8ff" stroke="#101820" strokeWidth="2" />
            <text x="12" y="4" fill="#4db8ff" fontSize="11" fontWeight="700" fontFamily="var(--font)">START</text>
          </g>
        )}
        {endPos && (
          <g transform={`translate(${endPos[0]}, ${endPos[1]})`}>
            <circle r="7" fill="#4db8ff" stroke="#101820" strokeWidth="2" />
            <text x="12" y="4" fill="#4db8ff" fontSize="11" fontWeight="700" fontFamily="var(--font)">END</text>
          </g>
        )}
      </svg>

      {hoveredBerg && (
        <div style={{ position: 'absolute', left: `${(hoveredBerg.cx / WIDTH) * 100}%`, top: `${(hoveredBerg.cy / HEIGHT) * 100}%`, transform: 'translate(-50%, -130%)', background: 'var(--bg-panel)', border: '1px solid var(--danger)', color: 'var(--text-primary)', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10 }}>
          Iceberg risk zone ({Math.abs(hoveredBerg.lat).toFixed(1)}°S, {hoveredBerg.lon.toFixed(1)}°E)
        </div>
      )}
    </div>
  );
}
