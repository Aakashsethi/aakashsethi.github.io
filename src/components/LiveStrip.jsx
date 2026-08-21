import React from 'react';
import { useEffect, useState } from 'react';

function LiveStrip() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/data/linkedin_posts.json')
      .then(r => r.json())
      .then(d => setPosts((d || []).filter(p => p.topic && p.post_url)))
      .catch(() => {});
  }, []);

  if (!posts.length) return null;

  const items = [...posts, ...posts];

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">MyLogs</div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {items.map((p, i) => (
            <a key={i} href={p.post_url} target="_blank" rel="noopener" className="ticker-item">
              <span className="ticker-sep">·</span>
              {p.topic}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export { LiveStrip };
