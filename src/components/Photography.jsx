import React from 'react';

const PHOTOS = [
  { id:1, cls:'s12-r3', src:'assets/photos/branches_ai.jpg',
    label:'Bare branches · winter sky', loc:'NJ · 2020', pos:'center 40%' },
  { id:2, cls:'s8-r4',  src:'assets/photos/pond_ai.jpg',
    label:'Autumn pond · sun flare', loc:'NJ · 2024', pos:'center center' },
  { id:3, cls:'s4-r4',  src:'assets/photos/liberty_ai.jpg',
    label:'Statue of Liberty · harbor', loc:'NY Harbor · 2020', pos:'center 30%' },
  { id:4, cls:'s4-r3',  src:'assets/photos/beach_ai.jpg',
    label:'Beach at dawn · haze', loc:'NJ Shore · 2020', pos:'center 60%' },
  { id:5, cls:'s4-r3',  src:'assets/photos/campus_ai.jpg',
    label:'Campus winter · B&W', loc:'Newark · 2020', pos:'center center' },
  { id:6, cls:'s4-r3',  src:'assets/photos/forest_ai.jpg',
    label:'Ridge line · winter', loc:'NJ Highlands · 2024', pos:'center 60%' },
  { id:7, cls:'s4-r4',  src:'assets/photos/park_ai.jpg',
    label:'Autumn pond · reflections', loc:'NJ · 2024', pos:'center center' },
  { id:8, cls:'s8-r3',  src:'assets/photos/nightsky_ai.jpg',
    label:'Long exposure · night', loc:'NJ · 2018', pos:'center center' },
];

function Photo({ p }) {
  return (
    <div className={`photo ${p.cls}`}>
      <img src={p.src} alt={p.label}
           style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:p.pos,display:'block'}} />
      <div className="caption">
        <span>{p.label}</span>
        <span>{p.loc}</span>
      </div>
    </div>
  );
}

function Photography() {
  return (
    <section id="photography">
      <header className="section-head">
        <span className="eyebrow">SIDE OF THE WORK · PHOTOGRAPHY</span>
        <h2 className="section-title">I take pictures, too.</h2>
        <p className="section-lede">
          A small ongoing archive — coastlines, cities at slow shutter,
          and the in-between hours. Hover any image for context.
        </p>
      </header>

      <div className="photo-mason">
        {PHOTOS.map(p => <Photo key={p.id} p={p} />)}
      </div>

      <p className="muted small mono" style={{marginTop:'var(--sp-8)'}}>
        Shot on iPhone and Samsung Galaxy. Edited warm, slightly desaturated, faint grain.
      </p>
    </section>
  );
}

export { Photography };
