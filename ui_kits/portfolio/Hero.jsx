/* global React */
function Hero({ onNav }) {
  return (
    <section className="hero">
      <img
        className="hero-bg"
        src="/assets/ai/hero_bg.png"
        alt="Aakash Sethi — Founder of Tnufa AI. AI Engineer, Consultant, Mentor based in New Jersey, USA."
        width="1392"
        height="688"
        loading="eager"
        fetchPriority="high"
      />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-img-overlay" aria-hidden="true" />
      <div className="hero-inner">
        <div className="eyebrow hero-eyebrow">
          <span className="live-dot" /> Booking Q3 · Intro consult $299
        </div>
        <h1 className="hero-title">
          Aakash Sethi<span className="accent-dot">.</span><br />
          <span style={{fontSize:'0.62em', display:'block', marginTop:'0.4em', fontWeight:500, letterSpacing:'-0.01em'}}>
            Founder of Tnufa AI · AI Engineer, New&nbsp;Jersey
          </span>
        </h1>
        <p className="hero-lede">
          <b>Build AI Products. Land Better Jobs.</b><br />
          I help engineers ship real AI systems — LLM apps, RAG pipelines,
          agentic architectures — and help teams hire, retain, and grow the
          people who build them. AWS Certified Solutions Architect Professional.
          NJDOE-licensed CS educator. Five years across
          Vanguard · Mercedes-Benz Financial Services · Burpez.
          Founder of <a href="https://tnufa.ai" style={{color:'var(--signal-300)'}}>Tnufa AI →</a>
          <br /><br />
          <span style={{fontSize:'0.9em', opacity:0.75}}>
            (Not <a href="https://in.linkedin.com/in/aakashsethi" style={{color:'inherit'}} target="_blank" rel="noopener">the education-sector Aakash Sethi in India</a> — different person, different field, different country.)
          </span>
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="/consulting/">See advisory tiers →</a>
          <a className="btn btn-ghost-dark" href="#" onClick={(e)=>{e.preventDefault(); onNav('work');}}>See the work</a>
          <a className="btn btn-ghost-dark" href="#" onClick={(e)=>{e.preventDefault(); onNav('contact');}}>Get in touch</a>
        </div>
      </div>
    </section>
  );
}

function StatStrip() {
  return (
    <section className="stat-strip">
      <div className="stat">
        <span className="eyebrow">Currently</span>
        <span className="stat-val">Building Tnufa · L7 PM @ Amazon</span>
      </div>
      <div className="stat">
        <span className="eyebrow">Certifications</span>
        <span className="stat-val">AWS SAP-C02 · NJDOE CS</span>
      </div>
      <div className="stat">
        <span className="eyebrow">Stack</span>
        <span className="stat-val">java · ts · python · aws</span>
      </div>
      <div className="stat">
        <span className="eyebrow">Based in</span>
        <span className="stat-val">New Jersey, USA</span>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.StatStrip = StatStrip;
