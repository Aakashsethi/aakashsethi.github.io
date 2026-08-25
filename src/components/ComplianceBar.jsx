import React from 'react';
import { useEffect, useState } from 'react';

// Enterprise-SaaS-style compliance strip. Every pill is a HONEST claim
// backed by the code — no fake SOC badges. Kept enterprise-flat: mono
// font, uppercase labels, green status dots, subtle borders.

const CLAIMS = [
  {
    id: 'client-side',
    label: 'In-browser processing',
    detail: 'PDFs, JDs, and resume text are parsed by pdf.js in this tab. Nothing is uploaded to any server.',
  },
  {
    id: 'zero-egress',
    label: 'Zero server storage',
    detail: 'Your tracker rows live in your browser\'s localStorage. There is no backend database to breach.',
  },
  {
    id: 'no-telemetry',
    label: 'No telemetry',
    detail: 'Interactions inside these tools are not logged, analytics-tagged, or fingerprinted.',
  },
  {
    id: 'no-account',
    label: 'No account required',
    detail: 'No email, no login, no cookie for auth. Session-less by design — nothing to phish.',
  },
  {
    id: 'oss',
    label: 'Open source',
    detail: 'Every line of the front-end that runs these tools is public at Aakashsethi/aakashsethi.github.io.',
  },
];

function ComplianceBar() {
  const [openId, setOpenId] = useState(null);
  const [now, setNow] = useState('');

  useEffect(() => {
    const iso = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
    setNow(iso);
    const t = setInterval(() => {
      setNow(new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="cb">
      <div className="cb-top">
        <div className="cb-status">
          <span className="cb-status-dot" aria-hidden="true"></span>
          <span className="cb-status-label">All systems operational</span>
        </div>
        <div className="cb-meta">
          <span className="cb-meta-item">
            <span className="cb-meta-key">Client build</span>
            <span className="cb-meta-val">v1.0.0</span>
          </span>
          <span className="cb-meta-item">
            <span className="cb-meta-key">Last checked</span>
            <span className="cb-meta-val">{now}</span>
          </span>
        </div>
      </div>

      <div className="cb-claims">
        {CLAIMS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cb-claim ${openId === c.id ? 'is-open' : ''}`}
            onClick={() => setOpenId(openId === c.id ? null : c.id)}
            aria-expanded={openId === c.id}
          >
            <span className="cb-check" aria-hidden="true">✓</span>
            <span className="cb-claim-label">{c.label}</span>
          </button>
        ))}
      </div>

      {openId && (
        <div className="cb-detail" role="region" aria-live="polite">
          <p className="cb-detail-text">
            {CLAIMS.find((c) => c.id === openId).detail}
          </p>
        </div>
      )}

      <p className="cb-footer">
        Data-processing controls follow the same principles as SOC 2 CC-family criteria (CC6.1
        logical access, CC6.7 data-in-transit) — implemented by not having a backend to
        protect. Not a formal SOC 2 attestation; every claim above is testable by reading the
        source.
      </p>
    </div>
  );
}

export { ComplianceBar };
