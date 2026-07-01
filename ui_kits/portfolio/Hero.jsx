/* global React */
function Hero({ onNav }) {
  return (
    <section className="hero" style={{backgroundImage:'url(/assets/ai/hero_bg.png)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-img-overlay" aria-hidden="true" />
      <div className="hero-inner">
        <div className="eyebrow hero-eyebrow">
          <span className="live-dot" /> Available · open to collab
        </div>
        <h1 className="hero-title">
          Aakash Sethi<span className="accent-dot">.</span><br />
          <span style={{fontSize:'0.62em', display:'block', marginTop:'0.4em', fontWeight:500, letterSpacing:'-0.01em'}}>
            AI Software Engineer / New Jersey, USA
          </span>
        </h1>
        <p className="hero-lede">
          I build AI systems that ship — LLM apps, RAG pipelines, agentic architectures.
          <b> AWS Certified Solutions Architect — Professional.</b> Five years across
          Vanguard · Mercedes-Benz Financial Services · Burpez. NJDOE-licensed CS educator.
          Founder of <a href="https://tnufa.ai" style={{color:'var(--signal-300)'}}>Tnufa.ai →</a>
          <br /><br />
          <span style={{fontSize:'0.9em', opacity:0.75}}>
            (Not <a href="https://in.linkedin.com/in/aakashsethi" style={{color:'inherit'}} target="_blank" rel="noopener">the education-sector Aakash Sethi in India</a> — different person.)
          </span>
        </p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href="#" onClick={(e)=>{e.preventDefault(); onNav('work');}}>See the work →</a>
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
        <span className="stat-val">Building Tnufa · L1 @ Amazon</span>
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
