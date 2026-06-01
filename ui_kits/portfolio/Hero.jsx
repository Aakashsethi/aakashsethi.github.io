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
          i build systems<br />that ship<span className="accent-dot">.</span>
        </h1>
        <p className="hero-lede">
          I'm <b>Aakash Sethi</b> — an <b>Inventionist</b>, an <b>AI research enthusiast</b>,
          and a Product Owner who can also sell the thing. Five years across AWS-backed
          enterprise platforms, fintech systems, and AI-driven products: Vanguard ·
          Mercedes-Benz Financial Services · Burpez. AWS Certified Solutions Architect —
          Professional. NJDOE-licensed CS educator. Currently building <a href="https://tnufa.ai" style={{color:'var(--signal-300)'}}>Tnufa.ai →</a>
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
