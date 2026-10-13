// Mock data generators aligned with types/navigation.ts

export function getMockIceGrid() {
  const ice = [];
  const dlat = -0.1667;
  const dlon = 0.3333;
  for (let lat = -60; lat > -70; lat += dlat) {
    for (let lon = 0; lon < 20; lon += dlon) {
      const latFactor = (Math.abs(lat) - 60) / 10;
      const lonFactor = 1 - Math.abs(lon - 10) / 10;
      const base = latFactor * 0.65 * Math.max(0, lonFactor);
      const noise = (Math.sin(lat * 3) + Math.cos(lon * 2)) * 0.08;
      const value = Math.max(0, Math.min(1, base + noise));
      if (value > 0.03) {
        ice.push([+lat.toFixed(4), +lon.toFixed(4), +value.toFixed(3)]);
      }
    }
  }
  return { ice, dlat, dlon };
}

export function getMockBergs() {
  return [
    { lat: -64.6, lon: 7.8 },
    { lat: -67.2, lon: 13.5 },
  ];
}

function generateCurvedPath(start, end, latOffset, lonOffset, steps = 30) {
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ct = 1 - t;
    const midLat = (start[0] + end[0]) / 2 + latOffset;
    const midLon = (start[1] + end[1]) / 2 + lonOffset;
    const lat = ct * ct * start[0] + 2 * ct * t * midLat + t * t * end[0];
    const lon = ct * ct * start[1] + 2 * ct * t * midLon + t * t * end[1];
    path.push([+lat.toFixed(4), +lon.toFixed(4)]);
  }
  return path;
}

export function getMockScene() {
  const { ice, dlat, dlon } = getMockIceGrid();
  return {
    ice,
    bergs: getMockBergs(),
    dlat,
    dlon,
    meta: {
      source: 'Sentinel-1 SAR (Earth Engine)',
      updated: new Date(Date.now() - 3600000 * 2).toISOString(),
      synthetic: true,
    },
  };
}

export function getMockAdvice(start, end) {
  const baselinePath = generateCurvedPath(start, end, 0, 0, 30);
  const balancedPath = generateCurvedPath(start, end, 1.4, -2.2, 30);
  const safestPath   = generateCurvedPath(start, end, 2.9, -4.5, 30);

  const routes = [
    {
      id: 'route_baseline',
      name: 'Baseline Direct',
      distance_nm: 767,
      distance_km: 1420,
      eta_hours: 58.0,
      fuel_tons: 148,
      ice_hazard_score: 86,
      iceberg_clusters_in_path: 12,
      pack_ice_thickness_m: 2.4,
      risk_level: 'High',
      ice_exposure_km: 385,
      iceberg_risk_cells: 12,
      path: baselinePath,
    },
    {
      id: 'route_balanced',
      name: 'Balanced Divergence',
      distance_nm: 842,
      distance_km: 1560,
      eta_hours: 64.0,
      fuel_tons: 132,
      ice_hazard_score: 42,
      iceberg_clusters_in_path: 5,
      pack_ice_thickness_m: 1.2,
      risk_level: 'Low-Moderate',
      ice_exposure_km: 210,
      iceberg_risk_cells: 5,
      path: balancedPath,
    },
    {
      id: 'route_safest',
      name: 'Safest Perimeter',
      distance_nm: 923,
      distance_km: 1710,
      eta_hours: 71.0,
      fuel_tons: 119,
      ice_hazard_score: 11,
      iceberg_clusters_in_path: 1,
      pack_ice_thickness_m: 0.3,
      risk_level: 'Very Low',
      ice_exposure_km: 65,
      iceberg_risk_cells: 1,
      path: safestPath,
    },
  ];

  const briefing =
    'Bridge Team Advisory: Proceeding via route_safest.\n\n' +
    'The Safest route adds 156 NM (+20% distance) but mitigates severe ice compression zones. ' +
    'Fuel consumption is reduced by 29 tons due to minimal icebreaking resistance.\n\n' +
    'Primary hazards avoided: multi-year pack ice floes (>2.4m thickness) between 65°S–68°S ' +
    'and two iceberg clusters at 64.6°S, 7.8°E.\n\n' +
    'Satellite synthetic aperture radar (Sentinel-1) confirms open leads along the western perimeter.';

  return {
    mission: 'Antarctic Resupply Voyage — Neumayer III Station',
    start: { lat: start[0], lon: start[1], name: 'Bouvet Island Staging' },
    destination: { lat: end[0], lon: end[1], name: 'Atka Bay (Neumayer III)' },
    routes,
    recommended_route_id: 'route_safest',
    reasoning_summary: 'Diverts around high-strain convergence zone, trading 13h transit time for 86% ice hazard reduction.',
    critical_hazards: [
      'Multi-year pack ice floes (>2.4m) along baseline corridor',
      'Iceberg clusters concentrated between 64°S–68°S and 8°E–14°E',
      'Pressure ridge formation along eastern approach'
    ],
    voyage_tradeoffs: {
      fuel_saved_tons: 29,
      time_penalty_hours: 13.0,
      ice_risk: '86% lower structural risk (score 11 vs 86)'
    },
    officer_briefing: briefing,
    advice: briefing,
    confidence: 0.94,
  };
}

export function getMockDecisionResponse() {
  return {
    ok: true,
    id: `dec_${Math.random().toString(36).substring(2, 9)}`,
  };
}
