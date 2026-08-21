import React from 'react';

/* ── Trust bar: companies where the work has actually shipped ─────────── */
function TrustBar() {
  const cos = ['Amazon', 'Vanguard', 'Mercedes-Benz Financial Services', 'Burpez', 'Tnufa AI'];
  return (
    <section className="trust-bar" aria-labelledby="trust-bar-label">
      <div className="trust-bar-inner">
        <span id="trust-bar-label" className="trust-bar-label">Shipped production code at</span>
        <div className="trust-bar-cos">
          {cos.map((c, i) => (
            <React.Fragment key={c}>
              <span className="trust-bar-co">{c}</span>
              {i < cos.length - 1 && <span className="trust-bar-sep">·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Problems I write about: concrete pain points, subscribe CTA ────────── */
function Problems() {
  const items = [
    {
      eyebrow: 'Building',
      title: 'Your LLM app is a demo, not a product.',
      body: 'Prompts pass unit tests but hallucinate in production. No evaluation harness. No cost visibility. I write about what actually holds up once real users get involved — RAG, agentic systems, and eval harnesses.',
      cta: 'Subscribe for field notes →',
      href: '#newsletter',
    },
    {
      eyebrow: 'Scaling',
      title: 'AWS spend is quietly eating your runway.',
      body: 'ECS, Lambda, Kinesis, DynamoDB — most bills are 30-60% higher than they need to be. I share teardowns of the architectures I audit at Vanguard-scale so you can spot the same patterns in yours.',
      cta: 'Subscribe for teardowns →',
      href: '#newsletter',
    },
    {
      eyebrow: 'Growing',
      title: "You're stuck at mid-level and don't know why.",
      body: 'Junior engineers plateau because nobody teaches them how to think in systems. I publish two free self-serve courses covering the exact frameworks I use to break out of the plateau.',
      cta: 'See free courses →',
      href: '/consulting/#courses',
    },
  ];

  return (
    <section className="problems">
      <header className="section-head">
        <span className="eyebrow">WHAT I WRITE ABOUT</span>
        <h2 className="section-title">Three problems I keep coming back to.</h2>
        <p className="section-lede">If any of these sound like your quarter, subscribe below — I write about them.</p>
      </header>
      <div className="problems-grid">
        {items.map(it => (
          <article className="problem-card" key={it.title}>
            <div className="problem-eyebrow">{it.eyebrow}</div>
            <h3 className="problem-title">{it.title}</h3>
            <p className="problem-body">{it.body}</p>
            <a className="problem-cta" href={it.href}>{it.cta}</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export { TrustBar, Problems };
