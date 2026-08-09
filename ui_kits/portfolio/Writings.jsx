/* global React */
const { useState, useEffect, useMemo, useRef } = React;

const WRITINGS_API = 'https://portfolio-contact-j70g.onrender.com';

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function useReadingProgress(active) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (!active) { setPct(0); return; }
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      const height = doc.scrollHeight - doc.clientHeight;
      setPct(height > 0 ? Math.min(100, Math.max(0, (scrolled / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);
  return pct;
}

function Writings() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [body, setBody] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const searchRef = useRef(null);
  const progress = useReadingProgress(!!selected);

  useEffect(() => {
    fetch(`${WRITINGS_API}/writings.json`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setPosts)
      .catch(e => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!selected) { setBody(null); return; }
    setBody({ loading: true });
    fetch(`${WRITINGS_API}/writings/${selected}.json`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(p => setBody({ ...p, html: window.marked ? window.marked.parse(p.body_md || '') : p.body_md }))
      .catch(e => setBody({ error: String(e) }));
  }, [selected]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selected) { setSelected(null); return; }
      if (e.key === '/' && !selected && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const categories = useMemo(() => {
    if (!posts) return [];
    const set = new Set(posts.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    const q = query.trim().toLowerCase();
    return posts.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const hay = [p.title, p.summary, p.category, ...(p.tags || [])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [posts, query, category]);

  if (selected) {
    return (
      <section className="mylogs-detail">
        <div className="reading-progress" style={{width: `${progress}%`}} aria-hidden="true" />
        <button className="ghost" onClick={() => setSelected(null)}>← Back to writings <span className="kbd">Esc</span></button>
        {!body && <p className="muted mono">loading…</p>}
        {body && body.loading && <div className="skeleton-article" aria-busy="true"><div className="sk-line w-40" /><div className="sk-line w-90" /><div className="sk-line w-80" /><div className="sk-line w-95" /><div className="sk-line w-70" /></div>}
        {body && body.error && <p className="muted mono">error: {body.error}</p>}
        {body && body.html && (
          <article className="prose">
            <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
              {body.category ? `${body.category} · ` : ''}{fmtDate(body.date)}
            </p>
            <h1>{body.title}</h1>
            {body.summary && <p className="lead">{body.summary}</p>}
            <div dangerouslySetInnerHTML={{ __html: body.html }} />
          </article>
        )}
      </section>
    );
  }

  return (
    <section className="mylogs-list">
      <header className="section-head">
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>writing</p>
        <h1>Archive</h1>
        <p className="lead">Hand-written notes on engineering, AI systems, and the shape of the industry — 2018 to today.</p>
      </header>

      {error && <p className="muted mono">Couldn't load writings: {error}</p>}
      {!posts && !error && <div className="skeleton-list" aria-busy="true">{[0,1,2].map(i => <div key={i} className="sk-card"><div className="sk-line w-30" /><div className="sk-line w-80" /><div className="sk-line w-60" /></div>)}</div>}

      {posts && (
        <>
          <div className="filter-bar">
            <div className="search-wrap">
              <input
                ref={searchRef}
                type="search"
                className="search-input"
                placeholder="Search writings…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search writings"
              />
              <span className="kbd search-kbd">/</span>
            </div>
            {categories.length > 1 && (
              <div className="chip-row" role="tablist" aria-label="Filter by category">
                {categories.map(c => (
                  <button key={c}
                          className={`chip${category === c ? ' is-active' : ''}`}
                          onClick={() => setCategory(c)}
                          role="tab"
                          aria-selected={category === c}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <span className="mono small muted result-count">{filtered.length} of {posts.length}</span>
          </div>

          {filtered.length === 0 && <p className="muted mono empty-state">No writings match those filters.</p>}

          <ul className="log-list">
            {filtered.map(p => (
              <li key={p.slug} className="log-card" onClick={() => setSelected(p.slug)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelected(p.slug); }}
                  tabIndex={0} role="button" aria-label={`Read: ${p.title}`}>
                <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
                  {p.category ? `${p.category} · ` : ''}{fmtDate(p.date)}
                </p>
                <h2>{p.title}</h2>
                {p.summary && <p className="muted">{p.summary}</p>}
                <span className="read-more">Read entry <span className="arr">→</span></span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

window.Writings = Writings;
