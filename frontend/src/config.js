// API base URL — empty string for relative URLs
export const API = '';

// Check for mock parameter in URL: ?mock=1
export const FORCE_MOCK =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).get('mock') === '1' ||
   new URLSearchParams(window.location.search).has('mock'));

// Default Antarctic voyage endpoints [lat, lon]
export const DEFAULT_START = [-61, 2];
export const DEFAULT_END   = [-69, 18];

// Initial map view: center {lat:-65, lng:10}, zoom 5
export const MAP_CENTER = { lat: -65, lng: 10 };
export const MAP_ZOOM = 5;

// Route styling & labels
export const ROUTE_CONFIG = {
  baseline: {
    name: 'baseline',
    label: 'Baseline Direct',
    color: '#6b7280',
    weight: 2,
    dashed: true,
  },
  balanced: {
    name: 'balanced',
    label: 'Balanced Divergence',
    color: '#e5a318',
    weight: 2.5,
    dashed: false,
  },
  safest: {
    name: 'safest',
    label: 'Safest Perimeter',
    color: '#22c55e',
    weight: 3.5,
    dashed: false,
  },
};

// Aliases for route_ IDs from types/navigation.ts
ROUTE_CONFIG.route_baseline = ROUTE_CONFIG.baseline;
ROUTE_CONFIG.route_balanced = ROUTE_CONFIG.balanced;
ROUTE_CONFIG.route_safest   = ROUTE_CONFIG.safest;

export const ROUTE_ORDER = ['baseline', 'balanced', 'safest'];

export function getRouteKey(route) {
  if (!route) return 'baseline';
  const str = String(route.id || route.name || '').toLowerCase();
  if (str.includes('safest')) return 'safest';
  if (str.includes('balanced')) return 'balanced';
  return 'baseline';
}
