/* global React */
const { useState: _useWState, useEffect: _useWEffect } = React;

const WORK_ROLES = [
  {
    co: 'Amazon', loc: 'Hicksville, NY', period: '2025 – Present',
    role: 'L7 Product Manager',
    stack: ['Product Strategy', 'AI/ML', 'Roadmap'],
    bullets: [
      'Own product strategy and roadmap for AI/ML initiatives; partner cross-functionally with engineering, science, design, and business teams.',
      'Drive prioritization and execution across multi-team scope; align stakeholders on outcomes, metrics, and go-to-market.',
    ],
  },
  {
    co: 'Burpez', loc: 'Newark, NJ', period: '2024 – 2025',
    role: 'Software Engineer',
    stack: ['React', 'Redux', 'Node.js', 'MongoDB', 'AWS Kinesis'],
    bullets: [
      'Built a cloud-kitchen ops platform on the MERN stack serving 5,000+ daily users.',
      'React + Redux frontend; Node/Express + MongoDB; AWS Kinesis for realtime order and inventory streaming.',
    ],
  },
  {
    co: 'Babson Acquisition Partners', loc: 'New Jersey', period: '2024 – 2025',
    role: 'Barista & Baker',
    stack: ['Operations', 'Customer Experience'],
    bullets: [
      'Baked croissants daily; developed custom flavor offerings.',
      'A year of precision, repeatability, and customer craft — the same disciplines I bring to engineering.',
    ],
  },
  {
    co: 'Vanguard', loc: 'Malvern, PA', period: '2023',
    role: 'Software Engineer',
    stack: ['AWS ECS', 'Lambda', 'CodeDeploy', 'Docker', 'CloudWatch', 'Mocha'],
    bullets: [
      'Automated ETF primary-market trading systems on AWS ECS, Lambda, CodeDeploy with blue/green deployments.',
      'Containerized microservices via Docker; integrated CloudWatch + API Gateway.',
      'Lifted test coverage from 45% → 85% in two quarters.',
    ],
  },
  {
    co: 'Mercedes-Benz Financial Services', loc: 'Farmington Hills, MI', period: '2021 – 2022',
    role: 'Technology Analyst',
    stack: ['Java', 'Spring Boot', 'REST', 'JUnit', 'ServiceNow'],
    bullets: [
      'Migrated SOAP APIs to RESTful microservices for Daimler Truck Financial Services — 30% latency reduction.',
      'Automated CI/CD with JUnit; led ServiceNow setup and migration.',
    ],
  },
  {
    co: 'Industry Mojo', loc: 'Short Hills, NJ', period: '2020 – 2021',
    role: 'CRM & Data Operations Intern',
    stack: ['HTML', 'CSS', 'JavaScript', 'Dynamics 365'],
    bullets: [
      'Built and tested a client-facing web portal.',
      'Automated price-list entries in Microsoft Dynamics 365; Scrum support on workflow customizations.',
    ],
  },
];

function PhantomProjects() {
  const [projects, setProjects] = _useWState(null);
  _useWEffect(() => {
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
                <a className="phantom-link" href={p.demo_url} target="_blank" rel="noreferrer">
                  <i data-lucide="external-link"></i> demo
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
      slug: 'tailor',
      name: 'JobTailor',
      tagline: 'Paste a JD + your resume. Get a tailored resume in ~5s (Groq).',
      tech: ['React', 'Sinatra', 'Groq', 'Postgres'],
      href: '#tailor',
    },
    {
      slug: 'scheduler',
      name: 'Deep-work Scheduler',
      tagline: 'Weekly grid to plan deep-work vs meetings. Enforces core hours + per-day minimums.',
      tech: ['React', 'Sinatra', 'Postgres'],
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
      <LiveDemos />

      <PhantomProjects />

      <header className="section-head" style={{marginTop:'var(--sp-16, 4rem)'}}>
        <span className="eyebrow">EXPERIENCE · {WORK_ROLES.length} COMPANIES</span>
        <h2 className="section-title">Where I've shipped real work.</h2>
        <p className="section-lede">
          Five years across fintech, cloud kitchens, enterprise software, and e-commerce —
          from AWS-backed trading systems at Vanguard to MERN-stack ops at Burpez.
        </p>
      </header>

      <div className="work-timeline">
        {WORK_ROLES.map((r, i) => (
          <div key={i} className="work-card">
            <div className="work-card-left">
              <div className="work-period">{r.period}</div>
              <div className="work-loc">{r.loc}</div>
            </div>
            <div className="work-card-body">
              <div className="work-card-header">
                <div>
                  <h3 className="work-co">{r.co}</h3>
                  <div className="work-role">{r.role}</div>
                </div>
              </div>
              <ul className="work-bullets">
                {r.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
              <div className="work-stack">
                {r.stack.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

window.Work = Work;
