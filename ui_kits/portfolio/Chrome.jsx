/* global React */
const { useState } = React;

function Header({ active, onNav }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'home',        label: 'Home' },
    { id: 'work',        label: 'Work' },
    { id: 'consulting',  label: 'Consulting', href: '/consulting/' },
    { id: 'blog',        label: 'Writing',    href: '/blog/' },
    { id: 'about',       label: 'About' },
  ];

  const handleNav = (id) => { setMenuOpen(false); onNav(id); };

  const renderTab = (t, className) => t.href
    ? <a key={t.id} href={t.href} className={className}>{t.label}</a>
    : <a key={t.id} href="#" className={className}
         onClick={(e)=>{e.preventDefault(); handleNav(t.id);}}
         style={active===t.id ? {color:'var(--signal-700)'} : {}}>{t.label}</a>;

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#" onClick={(e)=>{e.preventDefault(); handleNav('home');}}>
          aakash<span className="wm-dot" />sethi
        </a>
        <nav className="site-nav">
          {tabs.map(t => renderTab(t))}
          <a href="#" onClick={(e)=>{e.preventDefault(); handleNav('contact');}} className="nav-cta">
            Collaborate <span className="arr">→</span>
          </a>
        </nav>
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-nav" onClick={e => e.stopPropagation()}>
            <button className="mobile-nav-close" onClick={() => setMenuOpen(false)}>✕</button>
            <div className="mobile-nav-wordmark">aakash<span className="wm-dot" />sethi</div>
            {tabs.map(t => renderTab(t, active === t.id ? 'mobile-nav-active' : ''))}
            <a href="#" className="nav-cta" onClick={(e)=>{e.preventDefault(); handleNav('contact');}}>
              Collaborate →
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="ft-left">
        <span className="mono small muted">© 2026 · aakash sethi · made with care in new jersey</span>
      </div>
      <div className="ft-right">
        <a href="#newsletter" className="ft-link"><i data-lucide="mail-plus"></i> newsletter</a>
        <a href="https://github.com/aakashsethi" className="ft-link"><i data-lucide="github"></i> github</a>
        <a href="mailto:aakash.sethi7@gmail.com" className="ft-link"><i data-lucide="mail"></i> aakash.sethi7@gmail.com</a>
        <a href="https://linkedin.com/in/aakash-sethi-007" className="ft-link"><i data-lucide="linkedin"></i> linkedin</a>
        <a href="https://tnufa.ai" className="ft-link"><i data-lucide="external-link"></i> tnufa.ai</a>
        <a href="/privacy/" className="ft-link"><i data-lucide="shield"></i> privacy</a>
      </div>
    </footer>
  );
}

window.Header = Header;
window.Footer = Footer;
