import React from 'react';

// Shared shell for "work in progress" explainer pages (Scheduler,
// JobTailor, Journey). Owns the eyebrow / title / lede header and
// the "back to home" footer so the three components only carry
// their own body copy.
function WipPage({ eyebrow, title, lede, children }) {
  return (
    <section className="wip-shell">
      <p className="wip-eyebrow">{eyebrow}</p>
      <h1 className="wip-title">{title}</h1>
      {lede && <p className="wip-lede">{lede}</p>}
      {children}
      <p className="wip-back">
        <a href="/">← Back to home</a>
      </p>
    </section>
  );
}

export { WipPage };
