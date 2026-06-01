/* global React */
const { useState } = React;

const RECIPES = [
  { name: 'Croissants — laminated, golden',
    meta: 'Apr 2024 · Babson Acquisition Partners',
    detail: 'Three-day process. Cold butter, slow folds, deep ovens. The class of pastry where patience is the recipe.',
    img: 'assets/culinary/croissants.jpg' },
  { name: 'Cardamom-saffron rolls',
    meta: 'Custom flavor offering · 2024',
    detail: 'A custom flavor I developed for the bakery — South Asian aromatics in a Northern European form factor.',
    img: 'assets/culinary/saffron_rolls.jpg' },
  { name: 'Espresso, dialed-in',
    meta: 'Daily · Apr 2024 – Mar 2025',
    detail: '18g in, 36g out, 28s. A year of mornings calibrating an EK43 for the line.',
    img: 'assets/culinary/espresso.jpg' },
  { name: 'Kheer, modernized',
    meta: 'Side project · 2024',
    detail: 'My grandmother\'s rice pudding, plated for plate-up. Saffron bloom, cardamom oil, pistachio crumble.',
    img: 'assets/culinary/kheer.jpg' },
  { name: 'Sourdough — country loaf',
    meta: 'Weekly · 2025',
    detail: 'A 75% hydration country loaf. The loaf that taught me to trust the dough.',
    img: 'assets/culinary/sourdough.jpg' },
  { name: 'Mango lassi reduction',
    meta: 'Experiment · 2024',
    detail: 'A reduction of the diaspora drink, plated as a dessert sauce. Acid, sugar, fat — the three-legged stool.',
    img: 'assets/culinary/mango_lassi.jpg' },
];

function Culinary() {
  const [active, setActive] = useState(null);

  return (
    <section id="culinary">
      <header className="section-head">
        <span className="eyebrow">SIDE OF THE WORK · CULINARY ARTS</span>
        <h2 className="section-title">I bake things, too.</h2>
        <p className="section-lede">
          For a year between engineering gigs I worked as a barista and baker at
          Babson Acquisition Partners. It changed how I think about systems —
          mise en place, repeatability, the cost of a single bad batch.
        </p>
      </header>

      <div className="culinary-hero">
        <div className="culinary-card">
          <div className="eyebrow" style={{color:'rgba(246,246,244,0.6)'}}>APR 2024 – MAR 2025</div>
          <h2 style={{marginTop:14}}>A year on<br />the pastry line.</h2>
          <p className="lede">
            Croissants at 4am. Custom flavors developed for regulars. Espresso
            calibrated and recalibrated. The same disciplines I bring to a
            production system — measure, iterate, ship — applied to dough.
          </p>
        </div>
        <div className="culinary-card" style={{background:'linear-gradient(135deg,#1a2418 0%,#14161A 100%)'}}>
          <div className="eyebrow" style={{color:'rgba(246,246,244,0.6)'}}>WHAT I LEARNED</div>
          <h2 style={{marginTop:14, fontSize: 36}}>Systems thinking, with butter.</h2>
          <ul style={{paddingLeft:'1.2em', color:'rgba(246,246,244,0.78)', lineHeight:1.7, fontSize:15}}>
            <li>Repeatability beats virtuosity.</li>
            <li>The slowest step sets the cadence.</li>
            <li>Recipes are documentation; respect them.</li>
            <li>Customer feedback is a real-time service.</li>
          </ul>
        </div>
      </div>

      <h3 style={{margin:'var(--sp-12) 0 var(--sp-5)', letterSpacing:'-0.02em'}}>A short menu</h3>
      <div className="recipe-grid">
        {RECIPES.map(r => (
          <div key={r.name} className="recipe-card recipe-card--img" onClick={() => setActive(r)}>
            <div className="recipe-img-wrap">
              <img src={r.img} alt={r.name} className="recipe-img" />
            </div>
            <div className="recipe-body">
              <div className="name">{r.name}</div>
              <div className="meta"><span>{r.meta}</span></div>
              <div className="muted small" style={{marginTop:6, lineHeight:1.5}}>{r.detail}</div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="recipe-modal-overlay" onClick={() => setActive(null)}>
          <div className="recipe-modal" onClick={e => e.stopPropagation()}>
            <button className="recipe-modal-close" onClick={() => setActive(null)}>✕</button>
            <img src={active.img} alt={active.name} className="recipe-modal-img" />
            <div className="recipe-modal-body">
              <div className="eyebrow">{active.meta}</div>
              <h3 style={{margin:'var(--sp-2) 0 var(--sp-3)'}}>{active.name}</h3>
              <p className="muted">{active.detail}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

window.Culinary = Culinary;
