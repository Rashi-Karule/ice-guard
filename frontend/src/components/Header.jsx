import React from 'react';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <h1 className="header-title">IceGuard</h1>
        <span className="header-subtitle">Antarctic route advisor</span>
      </div>
      <div className="team-badge">Team Paradox</div>
    </header>
  );
}
