/* global React */
const { useState } = React;

function Header({ active, onNav }) {
  const tabs = [
    { id: 'home',        label: 'Home' },
    { id: 'work',        label: 'Work' },
    { id: 'youtube',     label: '▶ YouTube' },
    { id: 'linkedin',    label: 'in LinkedIn' },
    { id: 'education',   label: 'Education' },
    { id: 'hobbies',     label: 'Curriculars' },
    { id: 'about',       label: 'About' },
  ];
  return (
    <header className="site-header">
      <a className="wordmark" href="#" onClick={(e)=>{e.preventDefault(); onNav('home');}}>
        aakash<span className="wm-dot" />sethi
      </a>
      <nav className="site-nav">
        {tabs.map(t => (
          <a key={t.id}
             href="#"
             onClick={(e)=>{e.preventDefault(); onNav(t.id);}}
             style={active===t.id ? {color:'var(--signal-700)'} : {}}>
            {t.label}
          </a>
        ))}
        <a href="#" onClick={(e)=>{e.preventDefault(); onNav('contact');}} className="nav-cta">
          Collaborate <span className="arr">→</span>
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="ft-left">
        <span className="mono small muted">© 2026 · aakash sethi · made with care in new jersey</span>
      </div>
      <div className="ft-right">
        <a href="https://github.com/aakashsethi" className="ft-link"><i data-lucide="github"></i> github</a>
        <a href="mailto:aakash.sethi7@gmail.com" className="ft-link"><i data-lucide="mail"></i> aakash.sethi7@gmail.com</a>
        <a href="https://linkedin.com/in/aakash-sethi-007" className="ft-link"><i data-lucide="linkedin"></i> linkedin</a>
        <a href="https://tnufa.ai" className="ft-link"><i data-lucide="external-link"></i> tnufa.ai</a>
      </div>
    </footer>
  );
}

window.Header = Header;
window.Footer = Footer;
