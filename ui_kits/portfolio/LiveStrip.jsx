/* global React */
/* Live activity strip — shows real-time-ish status from static data */
const { useState, useEffect } = React;

function LiveStrip() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/data/linkedin_posts.json')
      .then(r => r.json())
      .then(posts => {
        const published = (posts || []).filter(p => p.status === 'published');
        const last = published[0];
        setStats({
          lastPost:     last?.date || null,
          totalPosts:   published.length,
          theme:        last?.theme?.replace('_', ' ') || '',
        });
      })
      .catch(() => {});
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'today';
  };

  return (
    <div className="live-strip">
      <div className="live-strip-item">
        <span className="live-dot" />
        <span className="eyebrow">Status</span>
        <span className="live-val">Open to senior eng roles</span>
      </div>
      <div className="live-strip-divider" />
      <div className="live-strip-item">
        <span className="eyebrow">Last LinkedIn post</span>
        <span className="live-val">{stats ? timeAgo(stats.lastPost) : '—'}</span>
      </div>
      <div className="live-strip-divider" />
      <div className="live-strip-item">
        <span className="eyebrow">Posts published</span>
        <span className="live-val">{stats ? stats.totalPosts : '—'}</span>
      </div>
      <div className="live-strip-divider" />
      <div className="live-strip-item">
        <span className="eyebrow">YouTube</span>
        <span className="live-val">AI News · daily shorts</span>
      </div>
      <div className="live-strip-divider" />
      <div className="live-strip-item">
        <span className="eyebrow">Building</span>
        <span className="live-val">Tnufa.ai · AI News Channel</span>
      </div>
    </div>
  );
}

window.LiveStrip = LiveStrip;
