/* global React */
const { useState } = React;

// Drop official SVG files at /assets/logos/{key}.svg from each company's
// press / brand-assets page. If a file is missing, the item falls back to
// its plain-text name so the strip stays intact.
//
// Where to source each:
//   amazon   → https://amazon.com/press
//   vanguard → https://about.vanguard.com/who-we-are/newsroom/
//   mbfs     → https://group-media.mercedes-benz.com/
//   daimler  → https://media.daimlertruck.com/
//   gaig     → https://www.greatamericaninsurancegroup.com/about-us/newsroom
//   burpez   → (private / your own asset)
//   tnufa    → /assets/wordmark.svg or your own asset
const COMPANIES = [
  { key: 'amazon',   name: 'Amazon',                                   context: 'L1 Associate · 2025–' },
  { key: 'vanguard', name: 'Vanguard',                                 context: 'Software Engineer · 2023' },
  { key: 'mbfs',     name: 'Mercedes-Benz Financial Services',         context: 'Technology Analyst · 2021–22' },
  { key: 'daimler',  name: 'Daimler Truck Financial Services',         context: 'via MBFS · SOAP → REST migration' },
  { key: 'gaig',     name: 'Great American Insurance Group',           context: 'Enterprise engagement' },
  { key: 'burpez',   name: 'Burpez',                                   context: 'Software Engineer · 2024–25' },
  { key: 'tnufa',    name: 'Tnufa AI',                                 context: 'Founder · Building now' },
];

function LogoItem({ c }) {
  const [failed, setFailed] = useState(false);
  return (
    <li className="logo-strip-item" title={`${c.name} — ${c.context}`}>
      {!failed ? (
        <img
          src={`/assets/logos/${c.key}.svg`}
          alt={c.name}
          className="logo-strip-img"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <span className="logo-strip-fallback" aria-label={c.name}>{c.name}</span>
      )}
      <span className="logo-strip-tip mono small">{c.context}</span>
    </li>
  );
}

function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Companies where I have shipped production code">
      <p className="mono small muted logo-strip-heading" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
        Shipped production code at
      </p>
      <ul className="logo-strip-list">
        {COMPANIES.map(c => <LogoItem key={c.key} c={c} />)}
      </ul>
    </section>
  );
}

window.LogoStrip = LogoStrip;
