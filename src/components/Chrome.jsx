import React from 'react';
import { useState } from 'react';

function Header({ active, onNav }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'work',        label: 'Work' },
    { id: 'blog',        label: 'Writing',    href: '/blog/' },
    { id: 'about',       label: 'About' },
  ];

  const handleNav = (id) => { setMenuOpen(false); onNav(id); };

  const renderTab = (t, extraClass) => {
    const isActive =
      (t.id === active) ||
      (t.href && typeof window !== 'undefined' && window.location.pathname.startsWith(t.href));
    const cls = [extraClass, isActive ? 'is-active' : ''].filter(Boolean).join(' ');
    return t.href
      ? <a key={t.id} href={t.href} className={cls}>{t.label}</a>
      : <a key={t.id} href="#" className={cls}
           onClick={(e)=>{e.preventDefault(); handleNav(t.id);}}>{t.label}</a>;
  };

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#" onClick={(e)=>{e.preventDefault(); handleNav('home');}}>
          AAKASH SETHI
        </a>
        <nav className="site-nav">
          {tabs.map(t => renderTab(t))}
        </nav>
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-nav" onClick={e => e.stopPropagation()}>
            <button className="mobile-nav-close" onClick={() => setMenuOpen(false)}>✕</button>
            <div className="mobile-nav-wordmark">AAKASH SETHI</div>
            {tabs.map(t => renderTab(t, active === t.id ? 'mobile-nav-active' : ''))}
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  const start = new Date('2019-01-01T00:00:00Z').getTime();
  const years = ((Date.now() - start) / (365.25 * 24 * 3600 * 1000)).toFixed(2);
  return (
    <footer className="site-footer">
      <div className="ft-left">
        <span className="mono small muted">Handcrafted by Aakash in New Jersey · since 2019 · {years} years and counting</span>
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

export { Header, Footer };
