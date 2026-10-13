import React from 'react';
import { getRouteKey } from '../config';

export function Headline({ routes, isMock }) {
  if (!routes || routes.length === 0) return null;

  const baseline = routes.find((r) => getRouteKey(r) === 'baseline');
  const safest   = routes.find((r) => getRouteKey(r) === 'safest');

  if (!baseline || !safest) return null;

  const baseIce = baseline.ice_hazard_score ?? baseline.ice_exposure_km ?? 1;
  const safeIce = safest.ice_hazard_score ?? safest.ice_exposure_km ?? 0;
  const iceReductionPct = Math.round(((baseIce - safeIce) / (baseIce || 1)) * 100);

  const baseDist = baseline.distance_nm ?? baseline.distance_km ?? 1;
  const safeDist = safest.distance_nm ?? safest.distance_km ?? 1;
  const extraDistPct = Math.round(((safeDist - baseDist) / (baseDist || 1)) * 100);

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-heading">Route Comparison</h2>
        {isMock && <span className="badge-mock">Sample data</span>}
      </div>

      <p className="headline-text">
        Safest route:{' '}
        <span className="mono headline-val positive">{iceReductionPct}%</span> less ice
        exposure for <span className="mono headline-val">{extraDistPct}%</span> extra
        distance.
      </p>
    </div>
  );
}
