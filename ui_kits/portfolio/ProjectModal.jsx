/* global React */
function ProjectModal({ p, onClose }) {
  React.useEffect(() => {
    if (p && window.lucide) window.lucide.createIcons();
  }, [p]);
  if (!p) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <i data-lucide="x"></i>
        </button>
        <div className="modal-head">
          <span className="eyebrow">{p.eyebrow}</span>
          <h2 className="modal-title">{p.title}</h2>
          <div className="proj-tags">
            {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div className="modal-body">
          <p className="body-lg" style={{fontFamily:'var(--font-reading)',fontSize:18,lineHeight:1.6}}>{p.desc}</p>
          {p.repo && (
            <div className="modal-actions">
              <a href={`https://github.com/Aakashsethi/${p.repo}`} className="btn btn-primary">View on GitHub ↗</a>
              <a href="#" className="btn btn-secondary">Read the writeup →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.ProjectModal = ProjectModal;
