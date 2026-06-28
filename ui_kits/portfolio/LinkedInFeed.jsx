/* global React */
/* MyLogs / Writing feed — merges /data/linkedin_posts.json (LinkedIn metadata + content)
   with /posts_data.json (Jekyll excerpts/tags) and renders a magazine-style index. */
const { useState, useEffect, useMemo } = React;

const THEME_LABELS = {
  ai_engineering: 'AI Engineering',
  soc2_ai:        'AI & Compliance',
  career:         'Career',
  cloud_aws:      'AWS & Cloud',
  fintech:        'Fintech',
  product:        'Product',
  personal_story: 'Story',
  engagement:     'Notes',
  free_media:     'Media & Society',
};

function LinkedInFeed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/data/linkedin_posts.json').then(r => r.json()).catch(() => []),
      fetch('/posts_data.json').then(r => r.json()).catch(() => []),
    ])
      .then(([liPosts, postsData]) => {
        const byUrl = {};
        (postsData || []).forEach(p => {
          byUrl[p.url] = p;
          try { byUrl[decodeURIComponent(p.url)] = p; } catch (e) {}
        });

        const merged = (liPosts || []).map(li => {
          const key = li.blog_url || '';
          const match = byUrl[key] || byUrl[decodeURIComponent(key)] || null;
          return {
            ...li,
            title:   match ? match.title   : li.topic,
            excerpt: match ? match.excerpt : '',
            preview: match ? match.preview : '',
            tags:    match ? match.tags    : [],
          };
        });

        // Newest first
        merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        setPosts(merged);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const themeColor = (theme) => {
    const map = {
      ai_engineering: 'var(--signal-500)',
      career:         'var(--ink-400)',
      cloud_aws:      '#f90',
      fintech:        '#26c281',
      product:        '#a78bfa',
      personal_story: 'var(--signal-300)',
      engagement:     '#60a5fa',
      free_media:     '#60a5fa',
      soc2_ai:        '#26c281',
    };
    return map[theme] || 'var(--signal-500)';
  };

  const themeLabel = (t) => THEME_LABELS[t] || (t || 'post').replace(/_/g, ' ');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isLinkedInUrl = (url) => url && url.includes('linkedin.com');

  const themesPresent = useMemo(() => {
    const set = new Set(posts.map(p => p.theme).filter(Boolean));
    return Array.from(set);
  }, [posts]);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.theme === filter);

  const featured  = filtered[0];
  const remaining = filtered.slice(1);

  return (
    <section className="mylogs">
      {/* ── Magazine header ──────────────────────────────── */}
      <header className="mylogs-head">
        <div className="mylogs-eyebrow">
          <span className="live-dot" />
          <span>The Field Log</span>
          <span className="mylogs-sep">·</span>
          <span>Aakash Sethi</span>
        </div>
        <h2 className="mylogs-title">Writing</h2>
        <p className="mylogs-lede">
          Long-form notes on AI engineering, agentic systems, RAG architecture, AWS,
          and the rest of the stack that ships production AI. Every post originates
          from a real engagement, incident, or design decision.
        </p>
        <div className="mylogs-meta">
          <span className="mylogs-meta-item"><b>{posts.length}</b> posts</span>
          <span className="mylogs-meta-dot" />
          <span className="mylogs-meta-item">Updated weekly</span>
          <span className="mylogs-meta-dot" />
          <a href="https://linkedin.com/in/aakash-sethi-007" target="_blank" rel="noopener" className="mylogs-meta-link">
            Follow on LinkedIn ↗
          </a>
          <span className="mylogs-meta-dot" />
          <a href="#newsletter" className="mylogs-meta-link">Subscribe to newsletter →</a>
        </div>
      </header>

      {/* ── Filters ──────────────────────────────────────── */}
      {!loading && themesPresent.length > 1 && (
        <div className="mylogs-filters">
          <button className={`mylogs-chip${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="mylogs-chip-count">{posts.length}</span>
          </button>
          {themesPresent.map(t => {
            const count = posts.filter(p => p.theme === t).length;
            return (
              <button key={t} className={`mylogs-chip${filter === t ? ' active' : ''}`}
                      onClick={() => setFilter(t)} style={{borderColor: filter === t ? themeColor(t) : undefined}}>
                {themeLabel(t)} <span className="mylogs-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && <div className="feed-loading"><div className="spinner" /><span className="muted small">Loading posts…</span></div>}

      {!loading && filtered.length === 0 && (
        <div className="feed-placeholder">
          <p className="muted small">No posts in this category yet.</p>
        </div>
      )}

      {/* ── Featured (most recent) ───────────────────────── */}
      {!loading && featured && (
        <a className="mylogs-featured" href={featured.blog_url || '#'}>
          <div className="mylogs-featured-meta">
            <span className="mylogs-theme-pill" style={{background: themeColor(featured.theme), color: '#000'}}>
              {themeLabel(featured.theme)}
            </span>
            <span className="mylogs-date">{formatDate(featured.date)}</span>
            <span className="mylogs-badge">Latest</span>
          </div>
          <h3 className="mylogs-featured-title">{featured.title || featured.topic}</h3>
          {featured.excerpt && <p className="mylogs-featured-excerpt">{featured.excerpt}</p>}
          {featured.tags && featured.tags.length > 0 && (
            <div className="mylogs-card-tags">
              {featured.tags.slice(0, 5).map((t, i) => <span key={i} className="mylogs-tag">#{t}</span>)}
            </div>
          )}
          <span className="mylogs-read">Read full article →</span>
        </a>
      )}

      {/* ── Rest of the grid ─────────────────────────────── */}
      {!loading && remaining.length > 0 && (
        <div className="mylogs-grid">
          {remaining.map((p, i) => (
            <a key={i} className="mylogs-card" href={p.blog_url || '#'}>
              <div className="mylogs-card-meta">
                <span className="mylogs-theme-pill" style={{background: themeColor(p.theme), color: '#000'}}>
                  {themeLabel(p.theme)}
                </span>
                <span className="mylogs-date">{formatDate(p.date)}</span>
              </div>
              <h3 className="mylogs-card-title">{p.title || p.topic}</h3>
              {p.excerpt && <p className="mylogs-card-excerpt">{p.excerpt}</p>}
              {p.tags && p.tags.length > 0 && (
                <div className="mylogs-card-tags">
                  {p.tags.slice(0, 4).map((t, idx) => <span key={idx} className="mylogs-tag">#{t}</span>)}
                </div>
              )}
              <div className="mylogs-card-footer">
                <span className="mylogs-read-sm">Read →</span>
                {p.post_url && isLinkedInUrl(p.post_url) && (
                  <span className="mylogs-li-badge" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(p.post_url, '_blank'); }}>
                    in
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

window.LinkedInFeed = LinkedInFeed;
