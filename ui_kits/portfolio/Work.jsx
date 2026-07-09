/* global React */

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

function Work() {
  return (
    <section className="work" id="work">
      <header className="section-head">
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
