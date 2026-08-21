import React from 'react';
import { useState, useEffect, useMemo } from 'react';

function Journey() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [sortKey, setSortKey] = useState('applied');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetch('/data/journey.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setData)
      .catch(e => setErr(String(e)));
  }, []);

  const sortedRows = useMemo(() => {
    if (!data) return [];
    let rows = data.workflows.slice();
    if (statusFilter !== 'all') rows = rows.filter(r => r.status === statusFilter);
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number') return sortDir === 'desc' ? bv - av : av - bv;
      return sortDir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
    });
    return rows;
  }, [data, sortKey, sortDir, statusFilter]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };
  const sortArrow = (key) => sortKey === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  if (err) return <section className="journey"><p className="muted mono">Could not load: {err}</p></section>;
  if (!data) return <section className="journey"><p className="mono small muted">Loading…</p></section>;

  const daysSince = Math.floor((new Date(data.last_updated) - new Date(data.hunt_started)) / 86400000);

  return (
    <section className="journey">
      <div className="section-dots-accent mid-right" aria-hidden="true">
        <img src="/assets/hero/purple-dots-accent.png" alt="" />
      </div>
      <div className="journey-hero">
        <div className="journey-live-badge">
          <span className="live-dot"></span> LIVE · UPDATED {data.last_updated}
        </div>
        <h1 className="journey-headline">{data.headline}</h1>
        <p className="journey-lede">{data.lede}</p>
        <div className="journey-meta mono small muted">
          Day {daysSince} of the hunt · started {data.hunt_started}
        </div>
      </div>

      <div className="journey-bignum-row">
        <BigNum label="Applied"      value={data.summary.applications_submitted} accent />
        <BigNum label="Failed"       value={data.summary.applications_failed} />
        <BigNum label="Companies"    value={data.summary.companies_targeted} />
        <BigNum label="Interviews"   value={data.summary.active_interview_loops} />
        <BigNum label="Offers"       value={data.summary.offers} />
        <BigNum label="Rejections"   value={data.summary.rejections} />
      </div>

      <div className="journey-panel">
        <div className="journey-panel-head">
          <h2>Daily submissions</h2>
          <span className="mono small muted">{data.daily_activity.length} active days · peak {Math.max(...data.daily_activity.map(d => d.applied))}</span>
        </div>
        <ActivityChart daily={data.daily_activity} />
      </div>

      <div className="journey-panel">
        <div className="journey-panel-head">
          <h2>By company</h2>
          <div className="journey-filters">
            <label className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>Status:</label>
            {['all','active','already_applied'].map(s => (
              <button key={s}
                className={`journey-chip ${statusFilter === s ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="journey-table-wrap">
          <table className="journey-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('name')}    className="sortable">Company{sortArrow('name')}</th>
                <th onClick={() => toggleSort('applied')} className="sortable num">Applied{sortArrow('applied')}</th>
                <th onClick={() => toggleSort('failed')}  className="sortable num">Failed{sortArrow('failed')}</th>
                <th className="num">Success %</th>
                <th>Channel</th>
                <th onClick={() => toggleSort('status')}  className="sortable">Status{sortArrow('status')}</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(w => {
                const total = w.applied + w.failed;
                const succ = total > 0 ? Math.round(100 * w.applied / total) : 0;
                return (
                  <tr key={w.name}>
                    <td><strong>{w.name}</strong></td>
                    <td className="num mono">{w.applied}</td>
                    <td className="num mono">{w.failed}</td>
                    <td className="num mono">{succ}%</td>
                    <td className="mono small muted">{w.channel}</td>
                    <td><span className={`journey-badge status-${w.status}`}>{w.status.replace('_',' ')}</span></td>
                    <td className="small">{w.notes}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td className="num mono"><strong>{sortedRows.reduce((s, r) => s + r.applied, 0)}</strong></td>
                <td className="num mono"><strong>{sortedRows.reduce((s, r) => s + r.failed, 0)}</strong></td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="journey-panel">
        <div className="journey-panel-head">
          <h2>Live interviews</h2>
          <span className="mono small muted">{data.interviews.length} active</span>
        </div>
        {data.interviews.length === 0
          ? <p className="muted" style={{padding:'var(--sp-6)'}}>None scheduled right now. This is where the funnel is failing — happy to talk about it.</p>
          : (
            <div className="journey-table-wrap">
              <table className="journey-table">
                <thead><tr><th>Company</th><th>Role</th><th>Stage</th><th>Scheduled</th><th>Notes</th></tr></thead>
                <tbody>
                  {data.interviews.map((iv, i) => (
                    <tr key={i}>
                      <td><strong>{iv.company}</strong></td>
                      <td>{iv.role}</td>
                      <td>{iv.stage}</td>
                      <td className="mono">{iv.scheduled}</td>
                      <td className="small">{iv.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <p className="mono small muted" style={{marginTop:'var(--sp-8)', textAlign:'center'}}>
        Data source: <a href="https://github.com/Aakashsethi/JobBoating">JobBoating</a> · Inspired by <a href="https://layoffs.fyi" target="_blank" rel="noreferrer">layoffs.fyi</a>
      </p>
    </section>
  );
}

function BigNum({ label, value, accent }) {
  return (
    <div className={`journey-bignum ${accent ? 'is-accent' : ''}`}>
      <span className="journey-bignum-val">{value.toLocaleString()}</span>
      <span className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>{label}</span>
    </div>
  );
}

function ActivityChart({ daily }) {
  if (!daily || daily.length === 0) return null;
  const max = Math.max(...daily.map(d => d.applied), 1);
  return (
    <div className="chart">
      <div className="chart-bars">
        {daily.map(d => {
          const pct = (d.applied / max) * 100;
          return (
            <div key={d.date} className="chart-bar-wrap" title={`${d.date}: ${d.applied} applications`}>
              <div className="chart-bar" style={{height: `${pct}%`}}>
                <span className="chart-bar-val mono">{d.applied}</span>
              </div>
              <span className="chart-bar-label mono">{d.date.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Journey };
