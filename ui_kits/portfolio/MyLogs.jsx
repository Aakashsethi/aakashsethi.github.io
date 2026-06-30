/* global React */
const { useState, useEffect } = React;

const BLOG_API = 'https://portfolio-contact-j70g.onrender.com';

function MyLogs() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [body, setBody] = useState(null);

  useEffect(() => {
    fetch(`${BLOG_API}/blog.json`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setPosts)
      .catch(e => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!selected) { setBody(null); return; }
    setBody({ loading: true });
    fetch(`${BLOG_API}/blog/${selected}.json`)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(p => setBody({ ...p, html: window.marked ? window.marked.parse(p.body_md || '') : p.body_md }))
      .catch(e => setBody({ error: String(e) }));
  }, [selected]);

  if (selected) {
    return (
      <section className="mylogs-detail">
        <button className="ghost" onClick={() => setSelected(null)}>← Back to logs</button>
        {!body && <p className="muted mono">loading…</p>}
        {body && body.loading && <p className="muted mono">loading…</p>}
        {body && body.error && <p className="muted mono">error: {body.error}</p>}
        {body && body.html && (
          <article className="prose">
            <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
              {body.category} · {new Date(body.created_at * 1000).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
            </p>
            <h1>{body.title}</h1>
            {body.summary && <p className="lead">{body.summary}</p>}
            <div dangerouslySetInnerHTML={{ __html: body.html }} />
            {body.sources && body.sources.length > 0 && (
              <>
                <h3>Sources</h3>
                <ul className="src-list">
                  {body.sources.map((s, i) => (
                    <li key={i}><a href={s.url} target="_blank" rel="noopener">{s.title || s.url}</a></li>
                  ))}
                </ul>
              </>
            )}
          </article>
        )}
      </section>
    );
  }

  return (
    <section className="mylogs-list">
      <header className="section-head">
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>my logs</p>
        <h1>Working notebook</h1>
        <p className="lead">Long-form drafts I'm thinking through — research, builds, sometimes wrong. Updates weekly.</p>
      </header>

      {error && <p className="muted mono">Couldn't load logs: {error}</p>}
      {!posts && !error && <p className="muted mono">loading…</p>}
      {posts && posts.length === 0 && <p className="muted mono">No entries yet — the first one ships Sunday.</p>}

      <ul className="log-list">
        {posts && posts.map(p => (
          <li key={p.slug} className="log-card" onClick={() => setSelected(p.slug)}>
            <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
              {p.category} · {new Date(p.created_at * 1000).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
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

window.MyLogs = MyLogs;
