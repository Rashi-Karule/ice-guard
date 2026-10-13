import React from 'react';
import { ROUTE_CONFIG, ROUTE_ORDER, getRouteKey } from '../config';

export function RouteTable({ routes, selectedRoute, onSelectRoute }) {
  if (!routes || routes.length === 0) return null;

  const baseline = routes.find((r) => getRouteKey(r) === 'baseline');
  const hasNm = routes.some((r) => typeof r.distance_nm === 'number');
  const hasRiskLevel = routes.some((r) => Boolean(r.risk_level));
  const hasFuel = routes.some((r) => typeof r.fuel_tons === 'number');

  return (
    <div className="card" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
      <div className="table-wrapper">
        <table className="route-table">
          <thead>
            <tr>
              <th scope="col">Route</th>
              {hasRiskLevel && <th scope="col">Risk Level</th>}
              <th scope="col">{hasNm ? 'Distance NM' : 'Distance km'}</th>
              <th scope="col">Ice Hazard</th>
              {hasFuel && <th scope="col">Fuel (T)</th>}
              <th scope="col">ETA h</th>
              <th scope="col">Berg Clusters</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_ORDER.map((key) => {
              const r = routes.find((item) => getRouteKey(item) === key);
              if (!r) return null;

              const cfg = ROUTE_CONFIG[key];
              const isSelected = selectedRoute === key || selectedRoute === r.id;
              const isDimmed = selectedRoute && !isSelected;

              // Distance diff % vs baseline
              const baseDist = hasNm ? baseline?.distance_nm : baseline?.distance_km;
              const curDist = hasNm ? r.distance_nm : r.distance_km;
              const distDiff = baseDist ? Math.round(((curDist - baseDist) / baseDist) * 100) : 0;

              // Ice diff % vs baseline
              const baseIce = baseline?.ice_hazard_score ?? baseline?.ice_exposure_km;
              const curIce = r.ice_hazard_score ?? r.ice_exposure_km;
              const iceDiff = baseIce ? Math.round(((curIce - baseIce) / baseIce) * 100) : 0;

              return (
                <tr
                  key={r.id || key}
                  className={`clickable ${isSelected ? 'selected' : ''} ${isDimmed ? 'dimmed' : ''}`}
                  style={{ borderLeftColor: isSelected ? cfg.color : 'transparent' }}
                  onClick={() => onSelectRoute(isSelected ? null : (r.id || key))}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRoute(isSelected ? null : (r.id || key));
                    }
                  }}
                >
                  <td>
                    <div className="route-cell-name">
                      <span className="route-dot" style={{ backgroundColor: cfg.color }} />
                      <span>{r.name || cfg.label}</span>
                    </div>
                  </td>

                  {hasRiskLevel && (
                    <td>
                      <span
                        className="badge-mock"
                        style={{
                          background:
                            r.risk_level === 'Very Low'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : r.risk_level === 'High'
                              ? 'rgba(224, 82, 82, 0.15)'
                              : 'rgba(229, 163, 24, 0.15)',
                          color:
                            r.risk_level === 'Very Low'
                              ? 'var(--positive)'
                              : r.risk_level === 'High'
                              ? 'var(--danger)'
                              : 'var(--warning)',
                        }}
                      >
                        {r.risk_level}
                      </span>
                    </td>
                  )}

                  <td className="mono">
                    {curDist ? curDist.toFixed(0) : '--'}
                    {distDiff !== 0 && (
                      <span className={`diff-tag ${distDiff > 0 ? 'neutral' : 'positive'}`}>
                        {distDiff > 0 ? `+${distDiff}%` : `${distDiff}%`}
                      </span>
                    )}
                  </td>

                  <td className="mono">
                    {r.ice_hazard_score !== undefined
                      ? `Score ${r.ice_hazard_score}`
                      : `${(r.ice_exposure_km || 0).toFixed(0)} km`}
                    {iceDiff !== 0 && (
                      <span className={`diff-tag ${iceDiff < 0 ? 'positive' : 'negative'}`}>
                        {iceDiff > 0 ? `+${iceDiff}%` : `${iceDiff}%`}
                      </span>
                    )}
                  </td>

                  {hasFuel && <td className="mono">{r.fuel_tons ? `${r.fuel_tons} t` : '--'}</td>}

                  <td className="mono">{(r.eta_hours || 0).toFixed(1)}</td>

                  <td className="mono">
                    {r.iceberg_clusters_in_path ?? r.iceberg_risk_cells ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
