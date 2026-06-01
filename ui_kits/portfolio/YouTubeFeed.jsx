/* global React */
/* YouTube latest videos — fetched from public RSS feed, no API key required */
const { useState, useEffect } = React;

const CHANNEL_ID = window.SITE_CONFIG?.youtubeChannelId || '';
const RSS_API    = 'https://api.rss2json.com/v1/api.json?rss_url=';
const YT_RSS     = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function YouTubeFeed() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [active, setActive]   = useState(null);

  useEffect(() => {
    if (!CHANNEL_ID) { setLoading(false); return; }
    fetch(RSS_API + encodeURIComponent(YT_RSS))
      .then(r => r.json())
      .then(d => {
        const items = (d.items || []).slice(0, 6).map(v => ({
          id:        v.link.split('v=')[1] || '',
          title:     v.title,
          thumb:     v.thumbnail || `https://img.youtube.com/vi/${v.link.split('v=')[1]}/hqdefault.jpg`,
          published: v.pubDate,
          link:      v.link,
        }));
        setVideos(items);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'just now';
  };

  if (!CHANNEL_ID) return (
    <section className="yt-feed">
      <div className="section-header">
        <div>
          <div className="eyebrow"><span className="live-dot" /> YouTube</div>
          <h2 className="section-title">Latest Videos</h2>
        </div>
      </div>
      <div className="feed-placeholder">
        <p className="muted small">Channel ID not configured. Set <code>youtubeChannelId</code> in <code>data/site_config.json</code>.</p>
      </div>
    </section>
  );

  return (
    <section className="yt-feed">
      <div className="section-header">
        <div>
          <div className="eyebrow"><span className="live-dot" /> YouTube · updates daily</div>
          <h2 className="section-title">Latest Videos</h2>
        </div>
        <a href={`https://www.youtube.com/channel/${CHANNEL_ID}`} target="_blank" rel="noopener" className="btn btn-ghost-dark btn-sm">
          All videos →
        </a>
      </div>

      {loading && <div className="feed-loading"><div className="spinner" /><span className="muted small">Loading feed…</span></div>}
      {error   && <p className="muted small">Could not load feed.</p>}

      {!loading && !error && (
        <div className="yt-grid">
          {videos.map(v => (
            <div key={v.id} className="yt-card" onClick={() => setActive(v)}>
              <div className="yt-thumb-wrap">
                <img src={v.thumb} alt={v.title} className="yt-thumb" loading="lazy" />
                <div className="yt-play"><i data-lucide="play-circle" /></div>
              </div>
              <div className="yt-info">
                <p className="yt-title">{v.title}</p>
                <span className="eyebrow">{timeAgo(v.published)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="yt-modal-overlay" onClick={() => setActive(null)}>
          <div className="yt-modal" onClick={e => e.stopPropagation()}>
            <button className="yt-modal-close" onClick={() => setActive(null)}>✕</button>
            <div className="yt-embed-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                frameBorder="0"
                title={active.title}
              />
            </div>
            <p className="yt-modal-title">{active.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}

window.YouTubeFeed = YouTubeFeed;
