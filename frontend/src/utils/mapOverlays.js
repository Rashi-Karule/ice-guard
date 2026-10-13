import { ROUTE_CONFIG, ROUTE_ORDER, getRouteKey } from '../config';

/**
 * Draw ice grid cells and iceberg hazard circles.
 */
export function drawSceneOverlays(map, scene, infoWindow, refs) {
  refs.ice.forEach((r) => r.setMap(null));
  refs.ice = [];
  refs.bergs.forEach((b) => b.setMap(null));
  refs.bergs = [];

  if (!map || !scene) return;
  const { ice = [], bergs = [], dlat = -0.17, dlon = 0.34 } = scene;

  ice.forEach(([lat, lon, val]) => {
    const rect = new google.maps.Rectangle({
      bounds: { north: lat, south: lat + dlat, west: lon, east: lon + dlon },
      fillColor: '#2a7ab5',
      fillOpacity: Math.min(0.55, val * 0.55),
      strokeWeight: 0,
      clickable: false,
      map,
    });
    refs.ice.push(rect);
  });

  bergs.forEach((b) => {
    const circle = new google.maps.Circle({
      center: { lat: b.lat, lng: b.lon },
      radius: 60000,
      fillColor: '#e05252',
      fillOpacity: 0.18,
      strokeColor: '#e05252',
      strokeWeight: 1.5,
      map,
    });

    circle.addListener('mouseover', () => {
      infoWindow.setPosition({ lat: b.lat, lng: b.lon });
      infoWindow.open(map);
    });
    circle.addListener('mouseout', () => { infoWindow.close(); });
    refs.bergs.push(circle);
  });
}

/**
 * Draw or update start/end waypoint markers and dashed hint line.
 */
export function drawWaypointMarkers(map, start, end, refs) {
  if (!map) return;

  const update = (key, pos, label) => {
    if (!pos) {
      if (refs.markers[key]) {
        refs.markers[key].setMap(null);
        delete refs.markers[key];
      }
      return;
    }
    if (refs.markers[key]) {
      refs.markers[key].setPosition({ lat: pos[0], lng: pos[1] });
    } else {
      refs.markers[key] = new google.maps.Marker({
        position: { lat: pos[0], lng: pos[1] },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4db8ff',
          fillOpacity: 1,
          strokeColor: '#101820',
          strokeWeight: 2,
        },
        label: { text: label, color: '#4db8ff', fontSize: '10px', fontWeight: '700' },
      });
    }
  };

  update('start', start, 'START');
  update('end', end, 'END');

  if (refs.hint) {
    refs.hint.setMap(null);
    refs.hint = null;
  }
  if (start && end) {
    refs.hint = new google.maps.Polyline({
      path: [{ lat: start[0], lng: start[1] }, { lat: end[0], lng: end[1] }],
      strokeColor: '#2a7ab5',
      strokeOpacity: 0.6,
      strokeWeight: 1,
      map,
    });
  }
}

/**
 * Draw candidate route polylines.
 */
export function drawRouteLines(map, routes, refs) {
  Object.values(refs.routes).forEach((l) => l.setMap(null));
  refs.routes = {};
  if (!map || !routes || routes.length === 0) return;

  const bounds = new google.maps.LatLngBounds();

  ROUTE_ORDER.forEach((key) => {
    const r = routes.find((item) => getRouteKey(item) === key);
    if (!r || !r.path) return;
    const cfg = ROUTE_CONFIG[key];
    const path = r.path.map(([lat, lon]) => {
      const pt = new google.maps.LatLng(lat, lon);
      bounds.extend(pt);
      return pt;
    });

    const poly = new google.maps.Polyline({
      path,
      strokeColor: cfg.color,
      strokeWeight: cfg.weight,
      strokeOpacity: cfg.dashed ? 0 : 1,
      icons: cfg.dashed
        ? [{
            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2, strokeColor: cfg.color, strokeWeight: 2 },
            offset: '0',
            repeat: '10px',
          }]
        : undefined,
      map,
    });
    refs.routes[key] = poly;
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds, 40);
}

/**
 * Update opacity of route polylines based on user selection.
 */
export function applyRouteSelection(routesRef, selectedRoute) {
  const activeKey = selectedRoute ? getRouteKey({ id: selectedRoute, name: selectedRoute }) : null;
  Object.entries(routesRef).forEach(([key, line]) => {
    const cfg = ROUTE_CONFIG[key];
    const isSelected = activeKey === key;
    line.setOptions({
      strokeOpacity: cfg.dashed ? 0 : (!activeKey || isSelected ? 1 : 0.25),
      strokeWeight: isSelected ? cfg.weight + 1.5 : cfg.weight,
    });
  });
}
