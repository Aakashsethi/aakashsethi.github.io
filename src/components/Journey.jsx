import React from 'react';
import { useEffect, useState } from 'react';
import { JourneyFunnel } from './JourneyFunnel.jsx';
import { PdfToLatex } from './PdfToLatex.jsx';
import { AppTracker } from './AppTracker.jsx';

// JobBoating hub — three tabs, all client-side. Route lives at /#journey
// via the existing hash router.
const TABS = [
  { id: 'funnel',  label: 'Live funnel',  hint: 'Public log of the automation' },
  { id: 'pdf',     label: 'PDF → LaTeX',  hint: 'Convert a resume, in-browser' },
  { id: 'tracker', label: 'Tracker',      hint: 'Your own applications, local' },
];

function Journey() {
  const [tab, setTab] = useState(() => {
    if (typeof window === 'undefined') return 'funnel';
    const sub = window.location.hash.split('/')[1];
    return TABS.some(t => t.id === sub) ? sub : 'funnel';
  });

  useEffect(() => {
    const onHash = () => {
      const sub = window.location.hash.split('/')[1];
      if (TABS.some(t => t.id === sub)) setTab(sub);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const switchTab = (id) => {
    setTab(id);
    if (typeof window !== 'undefined') {
      const base = window.location.hash.split('/')[0] || '#journey';
      history.replaceState(null, '', `${base}/${id}`);
    }
  };

  return (
    <section className="jb-shell">
      <header className="jb-hero">
        <p className="jb-eyebrow">JobBoating · live tools</p>
        <h1 className="jb-title">Automate the boring half of the job hunt.</h1>
        <p className="jb-hero-lede">
          A running log of my public search, a browser-only PDF→LaTeX converter that feeds the
          tailoring pipeline, and a lightweight tracker for yours.
        </p>
      </header>

      <nav className="jb-tabs" role="tablist" aria-label="JobBoating tools">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`jb-tab ${tab === t.id ? 'is-active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <span className="jb-tab-label">{t.label}</span>
            <span className="jb-tab-hint">{t.hint}</span>
          </button>
        ))}
      </nav>

      <div className="jb-panel">
        {tab === 'funnel'  && <JourneyFunnel />}
        {tab === 'pdf'     && <PdfToLatex />}
        {tab === 'tracker' && <AppTracker />}
      </div>

      <p className="jb-back">
        <a href="/">← Back to home</a>
      </p>
    </section>
  );
}

export { Journey };
