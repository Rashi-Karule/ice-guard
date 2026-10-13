import React, { useState } from 'react';

export function Header({ hasApiKey, onSaveApiKey }) {
  const [showModal, setShowModal] = useState(false);
  const [keyValue, setKeyValue] = useState(
    () => (typeof localStorage !== 'undefined' ? localStorage.getItem('GOOGLE_MAPS_API_KEY') || '' : '')
  );

  const handleSave = () => {
    if (onSaveApiKey) {
      onSaveApiKey(keyValue.trim());
    }
    setShowModal(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <h1 className="header-title">IceGuard</h1>
          <span className="header-subtitle">Antarctic route advisor</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              background: hasApiKey ? 'rgba(34, 197, 94, 0.15)' : 'rgba(77, 184, 255, 0.15)',
              border: `1px solid ${hasApiKey ? 'var(--positive)' : 'var(--accent)'}`,
              color: hasApiKey ? 'var(--positive)' : 'var(--accent)',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{hasApiKey ? '● Google Maps Active' : '🔑 Set Google Maps Key'}</span>
          </button>

          <div className="team-badge">Team Paradox</div>
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Google Maps Platform API Key</h2>
            <p className="modal-desc">
              Paste your Google Maps JavaScript API key here. It will be saved securely in your browser session to immediately load real Google Maps satellite/chart tiles.
            </p>

            <input
              type="text"
              className="input-field mono"
              placeholder="AIzaSy..."
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
                style={{ minHeight: '36px', padding: '0 14px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                style={{ minHeight: '36px', padding: '0 14px' }}
              >
                Save & Load Maps
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
