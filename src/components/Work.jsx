import React from 'react';
import { useState, useEffect } from 'react';

function PhantomProjects() {
  const [projects, setProjects] = useState(null);
  useEffect(() => {
    fetch('/data/phantom_projects.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setProjects(d.projects || []))
      .catch(() => setProjects([]));
  }, []);

  if (projects === null) return null;
  if (projects.length === 0) return null;

  return (
    <div className="phantom-projects">
      <header className="section-head">
        <span className="eyebrow">SIDE PROJECTS · {projects.length}</span>
        <h2 className="section-title">Things I'm building on the side.</h2>
        <p className="section-lede">
          Not on the resume. Own GitHub repos. Real code, real users where applicable.
        </p>
      </header>
      <div className="phantom-grid">
        {projects.map(p => (
          <article key={p.slug} className="phantom-card">
            <div className="phantom-card-head">
              <h3 className="phantom-name">{p.name}</h3>
              {p.status && <span className={`phantom-badge status-${p.status}`}>{p.status}</span>}
            </div>
            <p className="phantom-tagline">{p.tagline}</p>
            {p.highlight && <p className="phantom-highlight">{p.highlight}</p>}
            <div className="phantom-stack">
              {(p.tech || []).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="phantom-links">
              <a className="phantom-link" href={p.github_url} target="_blank" rel="noreferrer">
                <i data-lucide="github"></i> repo
              </a>
              {p.demo_url && (
                <a
                  className="phantom-link"
                  href={p.demo_url}
                  target={p.demo_url.startsWith('/') ? '_self' : '_blank'}
                  rel={p.demo_url.startsWith('/') ? undefined : 'noreferrer'}
                >
                  <i data-lucide={p.demo_url.startsWith('/') ? 'arrow-right' : 'external-link'}></i> {p.demo_label || 'demo'}
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function LiveDemos() {
  const demos = [
    {
      slug: 'jobboating',
      name: 'JobBoating',
      tagline: 'Public funnel + PDF→LaTeX tailor + application tracker. All in-browser.',
      tech: ['React', 'pdf.js', 'localStorage'],
      href: '#journey',
    },
    {
      slug: 'scheduler',
      name: 'Deep-work Scheduler',
      tagline: 'Weekly grid to plan deep-work vs meetings. Enforces core hours + per-day minimums.',
      tech: ['React'],
      href: '#scheduler',
    },
  ];
  return (
    <div className="phantom-projects">
      <header className="section-head">
        <span className="eyebrow">LIVE DEMOS · {demos.length}</span>
        <h2 className="section-title">Things you can actually try.</h2>
        <p className="section-lede">Interactive tools running on this site. Free tier for anonymous users, more with a magic-link sign-in.</p>
      </header>
      <div className="phantom-grid">
        {demos.map(d => (
          <article key={d.slug} className="phantom-card">
            <div className="phantom-card-head">
              <h3 className="phantom-name">{d.name}</h3>
              <span className="phantom-badge status-active">live</span>
            </div>
            <p className="phantom-tagline">{d.tagline}</p>
            <div className="phantom-stack">
              {d.tech.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <div className="phantom-links">
              <a className="phantom-link" href={d.href}>
                <i data-lucide="arrow-right"></i> open demo
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Work() {
  return (
    <section className="work" id="work">
      <div className="section-dots-accent top-right" aria-hidden="true">
        <img src="/assets/hero/purple-dots-accent.png" alt="" />
      </div>
      <LiveDemos />
      <PhantomProjects />
      <div className="section-dots-accent bottom-left" aria-hidden="true">
        <img src="/assets/hero/purple-dots-accent.png" alt="" />
      </div>
    </section>
  );
}

export { Work };
