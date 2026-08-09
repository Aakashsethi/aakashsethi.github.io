/* global React, PROJECTS */

function StatusPill({ status }) {
  const map = {
    shipping: { cls: 'pill pill-accent', label: 'In progress' },
    shipped:  { cls: 'pill pill-live',   label: '● Shipped' },
    archived: { cls: 'pill pill-neutral',label: 'Archived' },
  };
  const m = map[status] || map.shipped;
  return <span className={m.cls}>{m.label}</span>;
}

function ProjectCard({ p, onOpen }) {
  const handleClick = (e) => {
    e.preventDefault();
    if (p.href) { window.location.hash = p.href.replace(/^#/, ''); }
    else { onOpen(p); }
  };
  return (
    <a className={`proj${p.href ? ' proj-live' : ''}`} href={p.href || '#'} onClick={handleClick}>
      <div className="proj-meta">
        <span className="eyebrow">{p.eyebrow}</span>
        {p.href ? <span className="pill pill-live">● Live</span> : <StatusPill status={p.status} />}
      </div>
      <h3 className="proj-title">
        {p.title}
        <span className="proj-arrow">→</span>
      </h3>
      <p className="proj-desc">{p.desc}</p>
      <div className="proj-tags">
        {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
    </a>
  );
}

function Work({ onOpen }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'All', count: PROJECTS.length },
    { id: 'shipping', label: 'In progress', count: PROJECTS.filter(p=>p.status==='shipping').length },
    { id: 'shipped', label: 'Shipped', count: PROJECTS.filter(p=>p.status==='shipped').length },
    { id: 'archived', label: 'Archived', count: PROJECTS.filter(p=>p.status==='archived').length },
  ];
  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.status === filter);

  return (
    <section className="work" id="work">
      <header className="section-head">
        <span className="eyebrow">SELECTED WORK · {PROJECTS.length} REPOS</span>
        <h2 className="section-title">Real projects, shipped to real users.</h2>
        <p className="section-lede">
          Production systems at Vanguard, Mercedes-Benz Financial Services, and Burpez —
          plus open-source contributions, study repos, and the occasional weekend experiment.
        </p>
      </header>

      <div className="page-tabs">
        {filters.map(f => (
          <button key={f.id}
                  className={`page-tab ${filter===f.id ? 'active' : ''}`}
                  onClick={()=>setFilter(f.id)}>
            {f.label} <span className="count">· {f.count}</span>
          </button>
        ))}
      </div>

      <div className="proj-list">
        {visible.map(p => <ProjectCard key={p.id} p={p} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

window.Work = Work;
window.StatusPill = StatusPill;
