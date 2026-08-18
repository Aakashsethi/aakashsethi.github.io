/* global React */

const ROLES = [
  { co: 'Amazon', loc: 'Hicksville, NY', role: 'L1 Associate', period: 'Jun 2025 – Present',
    bullets: [
      'Operate WMS and automation tools for high-volume order fulfillment.',
      'Sustained productivity across 10–12 hour shifts; safety + quality compliance.',
    ] },
  { co: 'Burpez', loc: 'Newark, NJ', role: 'Software Engineer', period: 'Apr 2024 – Apr 2025',
    bullets: [
      'Built a cloud-kitchen ops platform on the MERN stack.',
      'React + Redux frontend; Node/Express + MongoDB; AWS Kinesis for realtime order/inventory streaming.',
      'Scaled REST services to 5,000+ daily users.',
    ] },
  { co: 'Babson Acquisition Partners', loc: 'New Jersey', role: 'Barista & Baker', period: 'Apr 2024 – Mar 2025',
    bullets: [
      'Baked croissants daily; developed custom flavor offerings.',
      'A year of customer-service and operations craft — feeds the systems work above.',
    ] },
  { co: 'Vanguard', loc: 'Malvern, PA', role: 'Software Engineer', period: 'Mar 2023 – Nov 2023',
    bullets: [
      'Automated ETF primary-market trading systems on AWS ECS, Lambda, CodeDeploy with blue/green.',
      'Containerized microservices via Docker; integrated CloudWatch + API Gateway.',
      'Lifted test coverage from 45% → 85% in two quarters with Mocha + Postman.',
    ] },
  { co: 'Mercedes-Benz Financial Services · Daimler Truck Financial Services', loc: 'Farmington Hills, MI', role: 'Technology Analyst', period: 'May 2021 – Mar 2022',
    bullets: [
      'Migrated SOAP APIs to RESTful microservices for Daimler Truck Financial Services on Java/Spring Boot — 30% latency reduction.',
      'Automated CI/CD with JUnit; supported ServiceNow setup and migration.',
      'Partnered with finance and account teams on customer-lifecycle ops.',
    ] },
  { co: 'Great American Insurance Group', loc: 'Cincinnati, OH', role: 'Enterprise engagement', period: 'Add dates',
    bullets: [
      'Enterprise engagement — please replace this stub with the actual role, scope, and outcomes.',
    ] },
  { co: 'Industry Mojo', loc: 'Short Hills, NJ', role: 'CRM & Data Operations Intern', period: 'Jan 2020 – Jan 2021',
    bullets: [
      'Built and tested a client-facing web portal (HTML/CSS/JS).',
      'Automated price-list entries in Microsoft Dynamics 365.',
      'Scrum partner on customizations to Dynamics workflows.',
    ] },
];

function About() {
  return (
    <section id="about">
      <header className="section-head">
        <span className="eyebrow">ABOUT</span>
        <h2 className="section-title">A senior engineer who likes the unglamorous half of the work.</h2>
      </header>
      <div className="about-grid">
        <div className="about-body reading">
          <p className="body-lg">
            I've spent the last five years shipping enterprise systems on the MERN stack,
            AWS, and the JVM — at Vanguard, Mercedes-Benz Financial Services, and a cloud-kitchen
            startup. I'm <b>AWS Certified Solutions Architect — Professional</b> (SAP-C02), and
            I'm an <b>NJDOE-licensed Computer Science teacher</b> in New Jersey.
          </p>
          <p>
            I work mostly on the boring half of AI products — retrieval, evals, infra, and the
            part where the agent has to actually do something correct in the real world.
            Right now I'm building <a href="https://tnufa.ai">Tnufa</a>, a platform for
            skill-based career mobility, while keeping a steady habit of open-source
            contributions and teaching.
          </p>
          <blockquote>
            "To my future employer: I hope you are visionary enough to see not just what I build
            today, but the future we can create together."
          </blockquote>
          <p>
            On the side I bake (croissants, mostly), I take pictures of cities at slow
            shutter, and I write small things to teach. If you're working on agents,
            evals, infra, fintech, or a research demo that needs a hand — let's talk.
          </p>

          <h3 style={{marginTop:'var(--sp-12)',letterSpacing:'-0.02em'}}>Experience</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'var(--sp-8)',marginTop:'var(--sp-6)'}}>
            {ROLES.map(r => (
              <div key={r.co + r.period} style={{borderTop:'1px solid var(--hairline)',paddingTop:'var(--sp-5)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'var(--sp-4)',flexWrap:'wrap'}}>
                  <div>
                    <span style={{fontFamily:'var(--font-sans)',fontSize:18,fontWeight:600,letterSpacing:'-0.01em'}}>{r.role}</span>
                    <span className="muted"> · {r.co}</span>
                  </div>
                  <span className="mono small muted">{r.period} · {r.loc}</span>
                </div>
                <ul style={{margin:'var(--sp-3) 0 0',paddingLeft:'1.2em',fontFamily:'var(--font-sans)',fontSize:14,color:'var(--fg)',lineHeight:1.6}}>
                  {r.bullets.map((b,i) => <li key={i} style={{marginBottom:4}}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="about-side">
          <h4>Currently</h4>
          <ul className="dot-list">
            <li><span className="li-dot live" />Building Tnufa (tnufa.ai)</li>
            <li><span className="li-dot" />L1 Associate · Amazon</li>
            <li><span className="li-dot" />Open to senior eng roles</li>
          </ul>
          <h4 style={{marginTop:'var(--sp-8)'}}>Certifications</h4>
          <ul className="dot-list">
            <li><span className="li-dot" />AWS SAP-C02 (SA Pro)</li>
            <li><span className="li-dot" />NJDOE Licensed CS Teacher (#5652)</li>
            <li><span className="li-dot" />Praxis Computer Science</li>
          </ul>
          <h4 style={{marginTop:'var(--sp-8)'}}>Toolbelt</h4>
          <div className="kit-tags">
            {['java','python','typescript','react','spring-boot','aws','docker','k8s','postgres','mongodb','dynamodb','terraform','llm-evals'].map(t => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
          <h4 style={{marginTop:'var(--sp-8)'}}>Reach me</h4>
          <ul className="dot-list">
            <li><span className="li-dot" /><a href="mailto:aakash.sethi7@gmail.com">aakash.sethi7@gmail.com</a></li>
            <li><span className="li-dot" />+1 561-644-7279</li>
            <li><span className="li-dot" /><a href="https://linkedin.com/in/aakash-sethi-007">linkedin/aakash-sethi-007</a></li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

window.About = About;
