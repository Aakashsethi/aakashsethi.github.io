/* global React */
const { useState } = React;

const TRUST_ITEMS = [
  { label: 'SOC 2 Type II', status: 'In progress', detail: 'Type I self-assessment complete · Type II observation window opens Q4' },
  { label: 'Data handling', status: 'Least-privilege', detail: 'No PII stored in this site · third-party integrations audited quarterly' },
  { label: 'Encryption', status: 'TLS 1.3 · AES-256', detail: 'HTTPS enforced · secrets in Render/GitHub Secrets · rotated 90d' },
  { label: 'Access controls', status: 'MFA + audit log', detail: 'Hardware key required for admin · every prod change logged' },
  { label: 'Response SLA', status: '< 24h business days', detail: 'Security disclosures routed to a monitored inbox' },
  { label: 'Vendor posture', status: 'Reviewed', detail: 'Render, Neon, Groq, Buttondown reviewed for GDPR + SOC 2 posture' },
];

const SERVICES = [
  // { title: 'Service name', blurb: 'One-line description', bullets: ['what you deliver', 'what they get'] },
];

const PROJECTS = [
  // { title: 'Project name', client: 'Vanguard / MBFS / ...', summary: 'One paragraph.', tags: ['AWS', 'LLM'], link: null },
];

function TrustStrip() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="trust-strip" role="region" aria-label="Security and compliance posture">
      <div className="trust-header">
        <span className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
          security &amp; compliance
        </span>
        <span className="trust-live" title="Live posture — last reviewed weekly">
          <span className="trust-dot" /> live posture
        </span>
      </div>
      <ul className="trust-grid">
        {TRUST_ITEMS.map((t, i) => {
          const open = openIdx === i;
          return (
            <li key={i}
                className={`trust-item${open ? ' is-open' : ''}`}
                onClick={() => setOpenIdx(open ? null : i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenIdx(open ? null : i); } }}
                tabIndex={0}
                role="button"
                aria-expanded={open}>
              <div className="trust-label">{t.label}</div>
              <div className="trust-status">{t.status}</div>
              {open && <div className="trust-detail">{t.detail}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Consulting() {
  const hasContent = SERVICES.length > 0 || PROJECTS.length > 0;

  return (
    <section className="mylogs-list">
      <header className="section-head">
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>consulting</p>
        <h1>Services &amp; enterprise engagements</h1>
        <p className="lead">Advisory and hands-on build work for teams shipping AI systems into regulated environments. Every engagement runs on documented controls — not vibes.</p>
      </header>

      <TrustStrip />

      {!hasContent && (
        <div className="empty-state">
          <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>catalog in progress</p>
          <p>Service catalog and case studies land next. In the meantime, the security posture above is authoritative — reach out below.</p>
          <a href="#contact" className="btn-inline" onClick={(e)=>{e.preventDefault(); window.location.hash='contact';}}>Start a conversation <span className="arr">→</span></a>
        </div>
      )}

      {SERVICES.length > 0 && (
        <>
          <h2 style={{marginTop:'3rem'}}>What I do</h2>
          <ul className="log-list">
            {SERVICES.map((s, i) => (
              <li key={i} className="log-card" style={{cursor:'default'}}>
                <h2>{s.title}</h2>
                {s.blurb && <p className="muted">{s.blurb}</p>}
                {s.bullets && (
                  <ul style={{marginTop:'0.75rem'}}>
                    {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {PROJECTS.length > 0 && (
        <>
          <h2 style={{marginTop:'3rem'}}>Enterprise projects</h2>
          <ul className="log-list">
            {PROJECTS.map((p, i) => (
              <li key={i} className="log-card" style={{cursor: p.link ? 'pointer' : 'default'}} onClick={p.link ? () => window.location.hash = p.link : undefined}>
                <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
                  {p.client}{p.tags && p.tags.length > 0 ? ` · ${p.tags.join(' · ')}` : ''}
                </p>
                <h2>{p.title}</h2>
                {p.summary && <p className="muted">{p.summary}</p>}
                {p.link && <span className="read-more">Read case study <span className="arr">→</span></span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

window.Consulting = Consulting;
