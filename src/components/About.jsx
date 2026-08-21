import React from 'react';

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
        </div>

      </div>
    </section>
  );
}

export { About };
