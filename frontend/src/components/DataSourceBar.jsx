import React from 'react';

function formatRelativeTime(isoString) {
  if (!isoString) return 'recent';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours <= 0) return 'just now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  } catch {
    return 'recent';
  }
}

export function DataSourceBar({ meta, isMock }) {
  const isSynthetic = isMock || !meta || meta.synthetic === true;
  const sourceName = meta?.source || 'Sentinel-1 SAR (Earth Engine)';
  const updatedText = meta?.updated ? formatRelativeTime(meta.updated) : '2h ago';

  return (
    <div className="data-source-bar">
      <div className="chip">
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Ice data:</span>
        <span>{sourceName}</span>
      </div>

      <div className="chip">
        <span style={{ color: 'var(--text-secondary)' }}>Updated:</span>
        <span className="mono">{updatedText}</span>
      </div>

      <div className="chip">
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Advisor:</span>
        <span>Gemini on Vertex AI</span>
      </div>

      {isSynthetic && <span className="badge-mock">Sample data</span>}
    </div>
  );
}
