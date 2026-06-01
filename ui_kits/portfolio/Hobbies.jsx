/* global React */
const { useState } = React;

const RECIPES = [
  { name: 'Croissants — laminated, golden',
    meta: 'Apr 2024 · Babson Acquisition Partners',
    detail: 'Three-day process. Cold butter, slow folds, deep ovens. The class of pastry where patience is the recipe.',
    img: 'assets/culinary/croissants.jpg' },
  { name: 'Cardamom-saffron rolls',
    meta: 'Custom flavor offering · 2024',
    detail: 'A custom flavor I developed — South Asian aromatics in a Northern European form factor.',
    img: 'assets/culinary/saffron_rolls.jpg' },
  { name: 'Espresso, dialed-in',
    meta: 'Daily · Apr 2024 – Mar 2025',
    detail: '18g in, 36g out, 28s. A year of mornings calibrating an EK43 for the line.',
    img: 'assets/culinary/espresso.jpg' },
  { name: 'Kheer, modernized',
    meta: 'Side project · 2024',
    detail: "My grandmother's rice pudding, plated for plate-up. Saffron bloom, cardamom oil, pistachio crumble.",
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

const PHOTOS = [
  { id:1, src:'assets/photos/branches_ai.jpg',  label:'Bare branches · winter sky',    loc:'NJ · 2020', pos:'center 40%' },
  { id:2, src:'assets/photos/pond_ai.jpg',       label:'Autumn pond · sun flare',       loc:'NJ · 2024', pos:'center center' },
  { id:3, src:'assets/photos/liberty_ai.jpg',    label:'Statue of Liberty · harbor',    loc:'NY Harbor · 2020', pos:'center 30%' },
  { id:4, src:'assets/photos/beach_ai.jpg',      label:'Beach at dawn · haze',          loc:'NJ Shore · 2020', pos:'center 60%' },
  { id:5, src:'assets/photos/campus_ai.jpg',     label:'Campus winter · B&W',           loc:'Newark · 2020', pos:'center center' },
  { id:6, src:'assets/photos/forest_ai.jpg',     label:'Ridge line · winter',           loc:'NJ Highlands · 2024', pos:'center 60%' },
  { id:7, src:'assets/photos/park_ai.jpg',       label:'Autumn pond · reflections',     loc:'NJ · 2024', pos:'center center' },
  { id:8, src:'assets/photos/nightsky_ai.jpg',   label:'Long exposure · night',         loc:'NJ · 2018', pos:'center center' },
];

function Hobbies() {
  const [tab, setTab]     = useState('culinary');
  const [active, setActive] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  return (
    <section id="hobbies">
      <header className="section-head">
        <span className="eyebrow">BEYOND THE CODE · EXTRACURRICULARS</span>
        <h2 className="section-title">Outside the terminal.</h2>
        <p className="section-lede">
          Engineering isn't the only place I practice precision. A year on the pastry line
          and an ongoing archive of streets, coastlines, and quiet hours.
        </p>
      </header>

      {/* Tab switcher */}
      <div className="hobbies-tabs">
        <button
          className={`hobbies-tab ${tab === 'culinary' ? 'active' : ''}`}
          onClick={() => setTab('culinary')}>
          🥐 Culinary
        </button>
        <button
          className={`hobbies-tab ${tab === 'photography' ? 'active' : ''}`}
          onClick={() => setTab('photography')}>
          📷 Photography
        </button>
      </div>

      {/* ── Culinary ── */}
      {tab === 'culinary' && (
        <>
          <div className="culinary-hero">
            <div className="culinary-card">
              <div className="eyebrow" style={{color:'rgba(246,246,244,0.6)'}}>APR 2024 – MAR 2025</div>
              <h2 style={{marginTop:14}}>A year on<br />the pastry line.</h2>
              <p className="lede">
                Croissants at 4am. Custom flavors developed for regulars. Espresso calibrated
                and recalibrated. The same disciplines I bring to a production system —
                measure, iterate, ship — applied to dough.
              </p>
            </div>
            <div className="culinary-card" style={{background:'linear-gradient(135deg,#1a2418 0%,#14161A 100%)'}}>
              <div className="eyebrow" style={{color:'rgba(246,246,244,0.6)'}}>WHAT I LEARNED</div>
              <h2 style={{marginTop:14, fontSize:36}}>Systems thinking, with butter.</h2>
              <ul style={{paddingLeft:'1.2em', color:'rgba(246,246,244,0.78)', lineHeight:1.7, fontSize:15}}>
                <li>Repeatability beats virtuosity.</li>
                <li>The slowest step sets the cadence.</li>
                <li>Recipes are documentation; respect them.</li>
                <li>Customer feedback is a real-time signal.</li>
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
        </>
      )}

      {/* ── Photography ── */}
      {tab === 'photography' && (
        <>
          <p className="section-lede" style={{marginBottom:'var(--sp-8)'}}>
            A small ongoing archive — coastlines, cities at slow shutter, and the in-between hours.
            Click any image to expand.
          </p>
          <div className="photo-mason">
            {PHOTOS.map(p => (
              <div key={p.id} className={`photo ${
                p.id === 1 ? 's12-r3' :
                p.id === 2 ? 's8-r4'  :
                p.id === 3 ? 's4-r4'  :
                p.id === 8 ? 's8-r3'  : 's4-r3'
              }`} onClick={() => setLightbox(p)} style={{cursor:'pointer'}}>
                <img src={p.src} alt={p.label}
                     style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:p.pos,display:'block'}} />
                <div className="caption">
                  <span>{p.label}</span>
                  <span>{p.loc}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="muted small mono" style={{marginTop:'var(--sp-8)'}}>
            Shot on iPhone and Samsung Galaxy. Edited warm, slightly desaturated, faint grain.
          </p>

          {lightbox && (
            <div className="recipe-modal-overlay" onClick={() => setLightbox(null)}>
              <div className="photo-lightbox" onClick={e => e.stopPropagation()}>
                <button className="recipe-modal-close" onClick={() => setLightbox(null)}>✕</button>
                <img src={lightbox.src} alt={lightbox.label} className="photo-lightbox-img" />
                <div style={{padding:'var(--sp-4) var(--sp-5)'}}>
                  <span className="eyebrow">{lightbox.loc}</span>
                  <p style={{margin:'4px 0 0', fontWeight:600}}>{lightbox.label}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

window.Hobbies = Hobbies;
