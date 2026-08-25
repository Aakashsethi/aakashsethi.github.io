import React from 'react';
import { useEffect, useMemo, useState } from 'react';

// Reads /data/journey.json (updated manually today, later wired to
// the JobBoating pipeline). Renders the same public funnel the
// portfolio has always advertised — big numbers, per-company table,
// daily activity bars.

function JourneyFunnel() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch('/data/journey.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setData)
      .catch(e => setErr(String(e)));
  }, []);

  const sorted = useMemo(() => {
    if (!data) return [];
    return data.workflows.slice().sort((a, b) => b.applied - a.applied);
  }, [data]);

  const maxDaily = useMemo(() => {
    if (!data?.daily_activity) return 0;
    return Math.max(...data.daily_activity.map(d => d.applied));
  }, [data]);

  const daysSince = useMemo(() => {
    if (!data) return 0;
    return Math.floor((new Date(data.last_updated) - new Date(data.hunt_started)) / 86_400_000);
  }, [data]);

  if (err) {
    return <p className="jb-empty">Could not load funnel: <code>{err}</code></p>;
  }
  if (!data) {
    return <p className="jb-empty">Loading funnel…</p>;
  }

  return (
    <div className="jb-funnel">
      <header className="jb-funnel-head">
        <p className="jb-eyebrow">Live · updated {data.last_updated}</p>
        <h2 className="jb-h2">{data.headline}</h2>
        <p className="jb-lede">{data.lede}</p>
        <p className="jb-meta">
          Day {daysSince} of the hunt · started {data.hunt_started}
        </p>
      </header>

      <div className="jb-bignums">
        <BigNum label="Applied"    value={data.summary.applications_submitted} accent />
        <BigNum label="Failed"     value={data.summary.applications_failed} />
        <BigNum label="Companies"  value={data.summary.companies_targeted} />
        <BigNum label="Interviews" value={data.summary.active_interview_loops} />
        <BigNum label="Offers"     value={data.summary.offers} />
      </div>

      <h3 className="jb-h3">Per company</h3>
      <div className="jb-table">
        <div className="jb-tr jb-tr-head">
          <span>Company</span>
          <span className="jb-num">Applied</span>
          <span className="jb-num">Failed</span>
          <span>Channel</span>
          <span>Status</span>
        </div>
        {sorted.map(row => (
          <div key={row.name} className="jb-tr">
            <span className="jb-td-name">{row.name}</span>
            <span className="jb-num">{row.applied}</span>
            <span className="jb-num jb-num-muted">{row.failed}</span>
            <span className="jb-td-channel">{row.channel}</span>
            <span className={`jb-status jb-status-${row.status.replace('_', '-')}`}>
              {row.status.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      {data.daily_activity?.length > 0 && (
        <>
          <h3 className="jb-h3">Daily activity</h3>
          <div className="jb-chart">
            {data.daily_activity.map(d => {
              const pct = maxDaily > 0 ? (d.applied / maxDaily) * 100 : 0;
              return (
                <div key={d.date} className="jb-bar-wrap" title={`${d.date}: ${d.applied}`}>
                  <div className="jb-bar" style={{ height: `${pct}%` }}>
                    <span className="jb-bar-val">{d.applied}</span>
                  </div>
                  <span className="jb-bar-lbl">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function BigNum({ label, value, accent }) {
  return (
    <div className={`jb-bignum ${accent ? 'jb-bignum-accent' : ''}`}>
      <p className="jb-bignum-val">{value.toLocaleString()}</p>
      <p className="jb-bignum-lbl">{label}</p>
    </div>
  );
}

export { JourneyFunnel };
