/* global React */
const { useState, useEffect } = React;

const WRITINGS_API = 'https://portfolio-contact-j70g.onrender.com';

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function Writings() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [body, setBody] = useState(null);

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

  if (selected) {
    return (
      <section className="mylogs-detail">
        <button className="ghost" onClick={() => setSelected(null)}>← Back to writings</button>
        {!body && <p className="muted mono">loading…</p>}
        {body && body.loading && <p className="muted mono">loading…</p>}
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
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>writings</p>
        <h1>Archive</h1>
        <p className="lead">Hand-written notes on engineering, AI systems, and the shape of the industry — 2018 to today.</p>
      </header>

      {error && <p className="muted mono">Couldn't load writings: {error}</p>}
      {!posts && !error && <p className="muted mono">loading…</p>}
      {posts && posts.length === 0 && <p className="muted mono">No entries yet.</p>}

      <ul className="log-list">
        {posts && posts.map(p => (
          <li key={p.slug} className="log-card" onClick={() => setSelected(p.slug)}>
            <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
              {p.category ? `${p.category} · ` : ''}{fmtDate(p.date)}
            </p>
            <h2>{p.title}</h2>
            {p.summary && <p className="muted">{p.summary}</p>}
            <span className="read-more">Read entry <span className="arr">→</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

window.Writings = Writings;
