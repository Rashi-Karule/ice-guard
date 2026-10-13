import React, { useRef, useState } from 'react';
import { ROUTE_CONFIG, ROUTE_ORDER, getRouteKey } from '../config';

// Map area bounds: Lat -60 to -70, Lon 0 to 20
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
    const coords = unproject(clickX, clickY);
    onMapClick(coords);
  };

  const { ice = [], bergs = [], dlat = -0.17, dlon = 0.34 } = scene || {};
  const startPos = startPoint ? project(startPoint[0], startPoint[1]) : null;
  const endPos = endPoint ? project(endPoint[0], endPoint[1]) : null;
  const activeRouteKey = selectedRoute
    ? getRouteKey({ id: selectedRoute, name: selectedRoute })
    : null;

  // Graticule grid lines
  const parallels = [-60, -62, -64, -66, -68, -70];
  const meridians = [0, 5, 10, 15, 20];

  return (
    <div className="nautical-chart-container" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block', background: '#0b141e' }}
      >
        <defs>
          {/* Subtle ice texture pattern */}
          <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(42, 58, 78, 0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Ocean Background */}
        <rect width={WIDTH} height={HEIGHT} fill="#0c1520" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#gridPattern)" />

        {/* Antarctic Coastline / Ice Shelf representation (Queen Maud Land, ~69-70°S) */}
        <path
          d={`M 0 ${HEIGHT} L 0 ${HEIGHT * 0.88} Q 150 ${HEIGHT * 0.82}, 320 ${HEIGHT * 0.86} T 650 ${HEIGHT * 0.81} T ${WIDTH} ${HEIGHT * 0.85} L ${WIDTH} ${HEIGHT} Z`}
          fill="#172432"
          stroke="#2a3a4e"
          strokeWidth="1.5"
        />
        <text x="30" y={HEIGHT - 20} fill="#4a6078" fontSize="13" fontFamily="var(--font)" fontWeight="700" letterSpacing="0.1em">
          ANTARCTIC CONTINENTAL ICE SHELF (DRONNING MAUD LAND)
        </text>

        {/* Graticule lines */}
        {parallels.map((lat) => {
          const [, y] = project(lat, 0);
          return (
            <g key={`lat-${lat}`}>
              <line x1="0" y1={y} x2={WIDTH} y2={y} stroke="rgba(42, 58, 78, 0.5)" strokeWidth="1" strokeDasharray="3 3" />
              <text x="8" y={Math.max(16, y - 4)} fill="#5a6f84" fontSize="11" fontFamily="var(--font-mono)">
                {Math.abs(lat)}°S
              </text>
            </g>
          );
        })}

        {meridians.map((lon) => {
          const [x] = project(-60, lon);
          return (
            <g key={`lon-${lon}`}>
              <line x1={x} y1="0" x2={x} y2={HEIGHT} stroke="rgba(42, 58, 78, 0.5)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={Math.min(WIDTH - 35, x + 4)} y={HEIGHT - 8} fill="#5a6f84" fontSize="11" fontFamily="var(--font-mono)">
                {lon}°E
              </text>
            </g>
          );
        })}

        {/* Ice grid cells */}
        {ice.map(([lat, lon, val], idx) => {
          const [x, y] = project(lat, lon);
          const [x2, y2] = project(lat + dlat, lon + dlon);
          const w = Math.abs(x2 - x);
          const h = Math.abs(y2 - y);
          return (
            <rect
              key={`ice-${idx}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill="#2a7ab5"
              fillOpacity={Math.min(0.55, val * 0.55)}
              pointerEvents="none"
            />
          );
        })}

        {/* Iceberg risk zones */}
        {bergs.map((b, idx) => {
          const [cx, cy] = project(b.lat, b.lon);
          // 60,000m approx radius in projection (~32px)
          const radius = 32;
          return (
            <g
              key={`berg-${idx}`}
              onMouseEnter={() => setHoveredBerg({ ...b, cx, cy })}
              onMouseLeave={() => setHoveredBerg(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="#e05252"
                fillOpacity="0.2"
                stroke="#e05252"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle cx={cx} cy={cy} r="3" fill="#e05252" />
            </g>
          );
        })}

        {/* Dashed Hint Line */}
        {startPos && endPos && (
          <line
            x1={startPos[0]}
            y1={startPos[1]}
            x2={endPos[0]}
            y2={endPos[1]}
            stroke="#2a7ab5"
            strokeWidth="1.5"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
          />
        )}

        {/* Candidate Route Polylines */}
        {routes &&
          ROUTE_ORDER.map((key) => {
            const r = routes.find((item) => getRouteKey(item) === key);
            if (!r || !r.path) return null;
            const cfg = ROUTE_CONFIG[key];
            const isSelected = activeRouteKey === key;
            const pointsStr = r.path
              .map(([lat, lon]) => {
                const [px, py] = project(lat, lon);
                return `${px.toFixed(1)},${py.toFixed(1)}`;
              })
              .join(' ');

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

        {/* Start Marker */}
        {startPos && (
          <g transform={`translate(${startPos[0]}, ${startPos[1]})`}>
            <circle r="7" fill="#4db8ff" stroke="#101820" strokeWidth="2" />
            <text x="12" y="4" fill="#4db8ff" fontSize="11" fontWeight="700" fontFamily="var(--font)">
              START
            </text>
          </g>
        )}

        {/* End Marker */}
        {endPos && (
          <g transform={`translate(${endPos[0]}, ${endPos[1]})`}>
            <circle r="7" fill="#4db8ff" stroke="#101820" strokeWidth="2" />
            <text x="12" y="4" fill="#4db8ff" fontSize="11" fontWeight="700" fontFamily="var(--font)">
              END
            </text>
          </g>
        )}
      </svg>

      {/* Hover tooltip for iceberg */}
      {hoveredBerg && (
        <div
          style={{
            position: 'absolute',
            left: `${(hoveredBerg.cx / WIDTH) * 100}%`,
            top: `${(hoveredBerg.cy / HEIGHT) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: 'var(--bg-panel)',
            border: '1px solid var(--danger)',
            color: 'var(--text-primary)',
            fontSize: '0.7rem',
            padding: '3px 8px',
            borderRadius: '4px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          Iceberg: forecast risk zone ({Math.abs(hoveredBerg.lat).toFixed(1)}°S, {hoveredBerg.lon.toFixed(1)}°E)
        </div>
      )}
    </div>
  );
}
