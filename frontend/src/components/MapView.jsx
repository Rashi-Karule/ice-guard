import React, { useEffect, useRef } from 'react';
import { useGoogleMap } from '../hooks/useGoogleMap';
import { NauticalChart } from './NauticalChart';
import {
  drawSceneOverlays,
  drawWaypointMarkers,
  drawRouteLines,
  applyRouteSelection,
} from '../utils/mapOverlays';

export function MapView({
  scene,
  startPoint,
  endPoint,
  routes,
  selectedRoute,
  onMapClick,
}) {
  const containerRef = useRef(null);
  const { map, isLoaded, loadError } = useGoogleMap(containerRef);

  const overlaysRef = useRef({
    ice: [],
    bergs: [],
    markers: {},
    hint: null,
    routes: {},
  });
  const infoWindowRef = useRef(null);

  // Map click listener (Google Maps)
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e) => {
      if (onMapClick) {
        onMapClick([+e.latLng.lat().toFixed(4), +e.latLng.lng().toFixed(4)]);
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, onMapClick]);

  // Ice cells & icebergs (Google Maps)
  useEffect(() => {
    if (!map) return;
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        content: 'Iceberg: forecast risk zone',
        disableAutoPan: true,
      });
    }
    drawSceneOverlays(map, scene, infoWindowRef.current, overlaysRef.current);
  }, [map, scene]);

  // Waypoint markers & hint line (Google Maps)
  useEffect(() => {
    if (!map) return;
    drawWaypointMarkers(map, startPoint, endPoint, overlaysRef.current);
  }, [map, startPoint, endPoint]);

  // Route lines (Google Maps)
  useEffect(() => {
    if (!map) return;
    drawRouteLines(map, routes, overlaysRef.current);
  }, [map, routes]);

  // Selection highlight (Google Maps)
  useEffect(() => {
    if (!map) return;
    applyRouteSelection(overlaysRef.current.routes, selectedRoute);
  }, [map, selectedRoute]);

  return (
    <div className="map-column" aria-label="Antarctic Navigation Map">
      {/* If Google Maps is ready, render the Maps DOM container */}
      {isLoaded && !loadError ? (
        <div ref={containerRef} className="map-viewport" />
      ) : (
        /* Seamless interactive Antarctic Nautical Chart fallback */
        <NauticalChart
          scene={scene}
          startPoint={startPoint}
          endPoint={endPoint}
          routes={routes}
          selectedRoute={selectedRoute}
          onMapClick={onMapClick}
        />
      )}

      {/* Mode status badge */}
      {loadError && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            background: 'rgba(16, 24, 32, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            fontSize: '0.68rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>ECDIS Vector Chart</span>
          <span style={{ marginLeft: '6px' }}>• Set VITE_GOOGLE_MAPS_API_KEY in .env for Google Maps</span>
        </div>
      )}

      {/* Legend */}
      <div className="map-legend">
        <div className="map-legend-title">Legend</div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: '#2a7ab5', opacity: 0.55 }} />
          <span>Ice concentration</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: '#e05252', opacity: 0.3, border: '1px dashed #e05252' }} />
          <span>Iceberg risk zone</span>
        </div>
        <div className="legend-item">
          <span className="legend-line baseline" />
          <span>Baseline</span>
        </div>
        <div className="legend-item">
          <span className="legend-line balanced" />
          <span>Balanced</span>
        </div>
        <div className="legend-item">
          <span className="legend-line safest" />
          <span>Safest</span>
        </div>
      </div>
    </div>
  );
}
