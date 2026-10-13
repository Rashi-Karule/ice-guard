import React, { useState } from 'react';

export function AdvisorCard({
  advice,
  confidence,
  evaluation,
  recommendedRoute = 'safest',
  selectedRoute,
  startPoint,
  endPoint,
  onLogDecision,
}) {
  const [decisionState, setDecisionState] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayText = evaluation?.officer_briefing || evaluation?.reasoning_summary || advice;
  if (!displayText) return null;

  const activeRoute = selectedRoute || evaluation?.recommended_route_id || recommendedRoute;

  const handleDecision = async (decisionType) => {
    if (isSubmitting || decisionState) return;
    setIsSubmitting(true);

    const payload = {
      decision: decisionType,
      route: activeRoute,
      start: startPoint,
      end: endPoint,
      advice_excerpt: displayText.substring(0, 140),
      timestamp: new Date().toISOString(),
    };

    const result = await onLogDecision(payload);

    setDecisionState({
      type: decisionType,
      localOnly: result?.localOnly ?? false,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="card">
      <div className="card-header-row">
        <h2 className="card-heading">Advisor Recommendation</h2>
      </div>

      <div className="advisor-text">{displayText}</div>

      {evaluation?.critical_hazards?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Critical Hazards Identified:
          </div>
          <ul style={{ paddingLeft: '16px', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {evaluation.critical_hazards.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation?.voyage_tradeoffs && (
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)', fontSize: '0.7rem', background: 'rgba(11,20,29,0.5)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Fuel Impact: </span>
            <span className="mono" style={{ color: 'var(--positive)' }}>
              {evaluation.voyage_tradeoffs.fuel_saved_tons > 0 ? `+${evaluation.voyage_tradeoffs.fuel_saved_tons} T saved` : `${evaluation.voyage_tradeoffs.fuel_saved_tons} T`}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Time: </span>
            <span className="mono">+{evaluation.voyage_tradeoffs.time_penalty_hours} h</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Ice Risk: </span>
            <span style={{ color: 'var(--positive)' }}>{evaluation.voyage_tradeoffs.ice_risk}</span>
          </div>
        </div>
      )}

      {typeof confidence === 'number' && (
        <div className="confidence-row">
          <span>Model confidence:</span>
          <div className="confidence-bar-bg" aria-hidden="true">
            <div
              className="confidence-bar-fill"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="mono">{Math.round(confidence * 100)}%</span>
        </div>
      )}

      <p className="advisor-caption">
        Generated from route metrics. The navigator retains final decision.
      </p>

      <div className="advisor-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={isSubmitting || Boolean(decisionState)}
          onClick={() => handleDecision('accepted')}
        >
          Accept recommendation
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={isSubmitting || Boolean(decisionState)}
          onClick={() => handleDecision('override')}
        >
          Manual override
        </button>
      </div>

      {decisionState && (
        <div className={`decision-callout ${decisionState.type}`}>
          {decisionState.type === 'accepted'
            ? 'Decision logged: accepted. Bridge team notified.'
            : 'Decision logged: manual override by navigator.'}
          {decisionState.localOnly && (
            <div className="decision-callout-warning">
              Saved locally only (log service unreachable)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
