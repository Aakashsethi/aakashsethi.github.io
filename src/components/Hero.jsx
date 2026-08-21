import React from 'react';
import KineticTitle from './KineticTitle.jsx';
import MagneticLink from './MagneticLink.jsx';

function Hero({ onNav }) {
  return (
    <section className="hero hero-light hero-hexgrid">
      <img
        className="hero-artwork"
        src="/assets/hero/purple-dots.png"
        alt=""
        aria-hidden="true"
      />
      <div className="hero-inner">
        <KineticTitle
          text="Aakash Sethi builds AI systems that ship"
          className="hero-title"
          accentDot
        />
        <p className="hero-lede">
          Amazon L7 PM. AWS Certified Solutions Architect Professional. Five years shipping at Vanguard, Mercedes-Benz Financial Services, and Burpez. I advise engineering teams on LLM apps, RAG pipelines, and agentic architectures — and coach engineers into senior roles.
        </p>
        <div className="hero-ctas">
          <MagneticLink
            href="#"
            className="btn btn-primary"
            onClick={(e)=>{e.preventDefault(); onNav('work');}}
          >
            See the work <span className="arr">→</span>
          </MagneticLink>
          <MagneticLink href="/blog/" className="btn btn-ghost">
            Read writing <span className="arr">→</span>
          </MagneticLink>
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

export { Hero, StatStrip };
