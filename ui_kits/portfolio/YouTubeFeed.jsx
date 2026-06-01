/* global React */
/* YouTube latest videos — fetched from public RSS feed, no API key required */
const { useState, useEffect } = React;

const CHANNEL_ID = window.SITE_CONFIG?.youtubeChannelId || '';
const RSS_API    = 'https://api.rss2json.com/v1/api.json?rss_url=';
const YT_RSS     = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function extractVideoId(link) {
  // Handles: /watch?v=ID, /shorts/ID, /embed/ID
  const shorts = link.match(/\/shorts\/([^?&]+)/);
  if (shorts) return shorts[1];
  const watch = link.match(/[?&]v=([^?&]+)/);
  if (watch) return watch[1];
  const embed = link.match(/\/embed\/([^?&]+)/);
  if (embed) return embed[1];
  return '';
}

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
        const items = (d.items || []).slice(0, 6).map(v => {
          const id = extractVideoId(v.link);
          return {
            id,
            title:     v.title,
            thumb:     v.thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
            published: v.pubDate,
            link:      v.link,
          };
        });
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
            <div key={v.id} className="yt-card" onClick={() => v.id && setActive(v)}>
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
                src={`https://www.youtube-nocookie.com/embed/${active.id}?rel=0&modestbranding=1`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
                title={active.title}
              />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'var(--sp-4) var(--sp-5)'}}>
              <p className="yt-modal-title" style={{margin:0}}>{active.title}</p>
              <a href={active.link} target="_blank" rel="noopener" className="li-link" style={{flexShrink:0, marginLeft:'var(--sp-4)'}}>
                Open on YouTube →
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

window.YouTubeFeed = YouTubeFeed;
