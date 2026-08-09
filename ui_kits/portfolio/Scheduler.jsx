/* global React, apiFetch, useSession, SignInModal */
const { useState, useEffect, useMemo } = React;

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16]; // 9a–5p (16 = 4-5pm block)
const KIND_ORDER = ['empty', 'deep', 'meetings', 'admin', 'focus'];
const KIND_META = {
  empty:    { label: 'Empty',    color: 'transparent',        countable: false },
  deep:     { label: 'Deep',     color: 'var(--signal-700)',  countable: true },
  meetings: { label: 'Meetings', color: '#c9500a',            countable: true },
  admin:    { label: 'Admin',    color: '#7a6a1f',            countable: true },
  focus:    { label: 'Focus',    color: '#3d8556',            countable: true },
};
const DEFAULT_RULES = {
  core_start: 10, core_end: 15,          // 10a–3p core
  min_hours_per_day: 6,
  target_total: 40
};

function mondayOfThisWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d.toISOString().slice(0, 10);
}

function cellKey(day, hour) { return `${day}-${hour}`; }

function Scheduler() {
  const session = useSession();
  const [cellMap, setCellMap] = useState({});   // { 'mon-9': 'deep', ... }
  const [rules] = useState(DEFAULT_RULES);
  const [signInOpen, setSignInOpen] = useState(false);
  const [saveState, setSaveState] = useState({ status: 'idle', publicId: null, error: null });
  const [weekOf] = useState(mondayOfThisWeek());

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('signed_in') === '1') {
      url.searchParams.delete('signed_in');
      window.history.replaceState(null, '', url.pathname + url.hash);
      session.refresh();
    }
  }, []);

  const cycleCell = (day, hour) => {
    setCellMap(prev => {
      const key = cellKey(day, hour);
      const cur = prev[key] || 'empty';
      const nextIdx = (KIND_ORDER.indexOf(cur) + 1) % KIND_ORDER.length;
      const next = KIND_ORDER[nextIdx];
      const copy = { ...prev };
      if (next === 'empty') delete copy[key]; else copy[key] = next;
      return copy;
    });
    setSaveState(s => s.status === 'saved' ? { ...s, status: 'dirty' } : s);
  };

  const totals = useMemo(() => {
    const counts = { deep: 0, meetings: 0, admin: 0, focus: 0 };
    Object.values(cellMap).forEach(k => { if (counts[k] !== undefined) counts[k]++; });
    const total = counts.deep + counts.meetings + counts.admin + counts.focus;
    const deepPct = total > 0 ? Math.round((counts.deep / total) * 100) : 0;
    const meetingsPct = total > 0 ? Math.round((counts.meetings / total) * 100) : 0;
    return { ...counts, total, deepPct, meetingsPct, remaining: rules.target_total - total };
  }, [cellMap, rules]);

  const violations = useMemo(() => {
    const out = [];
    DAYS.forEach(({ id: day, label }) => {
      const dayHours = HOURS.filter(h => cellMap[cellKey(day, h)] && KIND_META[cellMap[cellKey(day, h)]]?.countable);
      if (dayHours.length < rules.min_hours_per_day && dayHours.length > 0) {
        out.push(`${label}: only ${dayHours.length} hrs (min ${rules.min_hours_per_day})`);
      }
      for (let h = rules.core_start; h < rules.core_end; h++) {
        const kind = cellMap[cellKey(day, h)];
        if (!kind || !KIND_META[kind]?.countable) {
          out.push(`${label} ${h}:00 — core hours must be filled`);
          break;
        }
      }
    });
    return out;
  }, [cellMap, rules]);

  const publish = async () => {
    if (!session.authenticated) { setSignInOpen(true); return; }
    setSaveState({ status: 'saving', publicId: null, error: null });
    const cells = Object.entries(cellMap).map(([k, kind]) => {
      const [day, hour] = k.split('-');
      return { day, hour: parseInt(hour, 10), kind };
    });
    try {
      const r = await apiFetch('/schedules', { method: 'POST', body: JSON.stringify({ week_of: weekOf, cells, rules }) });
      const j = await r.json();
      if (!r.ok) { setSaveState({ status: 'error', publicId: null, error: j.error || `HTTP ${r.status}` }); return; }
      setSaveState({ status: 'saved', publicId: j.public_id, error: null });
    } catch (e) {
      setSaveState({ status: 'error', publicId: null, error: String(e) });
    }
  };

  return (
    <section className="scheduler">
      <header className="section-head">
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>live demo · weekly scheduler</p>
        <h1>Schedule 40 hrs against company flexibility rules</h1>
        <p className="lead">Click a slot to cycle through work kinds. Core hours ({rules.core_start}:00–{rules.core_end}:00) must be filled; the rest is yours.</p>
      </header>

      <div className="scheduler-shell">
        <div className="scheduler-grid" role="grid" aria-label={`Week of ${weekOf}`}>
          <div className="sch-corner mono small muted">{weekOf}</div>
          {DAYS.map(d => <div key={d.id} className="sch-head mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>{d.label}</div>)}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div className={`sch-hour mono small${hour >= rules.core_start && hour < rules.core_end ? ' is-core' : ''}`}>
                {hour}:00
              </div>
              {DAYS.map(({ id: day }) => {
                const kind = cellMap[cellKey(day, hour)] || 'empty';
                const inCore = hour >= rules.core_start && hour < rules.core_end;
                return (
                  <button key={`${day}-${hour}`}
                          className={`sch-cell kind-${kind}${inCore ? ' is-core' : ''}`}
                          onClick={() => cycleCell(day, hour)}
                          aria-label={`${day} ${hour}:00 — ${KIND_META[kind].label}`}>
                    {kind !== 'empty' && <span className="sch-cell-label">{KIND_META[kind].label[0]}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <aside className="scheduler-side">
          <div className="side-block">
            <h3>Totals</h3>
            <ul className="totals-list">
              <li><span className="dot" style={{background: KIND_META.deep.color}} /> Deep <strong>{totals.deep}h</strong></li>
              <li><span className="dot" style={{background: KIND_META.meetings.color}} /> Meetings <strong>{totals.meetings}h</strong></li>
              <li><span className="dot" style={{background: KIND_META.admin.color}} /> Admin <strong>{totals.admin}h</strong></li>
              <li><span className="dot" style={{background: KIND_META.focus.color}} /> Focus <strong>{totals.focus}h</strong></li>
            </ul>
            <div className="totals-total">
              <span className="mono small muted">TOTAL</span>
              <strong className={totals.total === rules.target_total ? 'ok' : ''}>
                {totals.total} / {rules.target_total}h
              </strong>
            </div>
            {totals.total > 0 && (
              <div className="totals-mix">
                <div className="mix-bar">
                  <div style={{width: `${totals.deepPct}%`, background: KIND_META.deep.color}} />
                  <div style={{width: `${totals.meetingsPct}%`, background: KIND_META.meetings.color}} />
                </div>
                <span className="mono small muted">{totals.deepPct}% deep · {totals.meetingsPct}% meetings</span>
              </div>
            )}
          </div>

          <div className="side-block">
            <h3>Company rules</h3>
            <ul className="rules-list mono small">
              <li>Core hours <strong>{rules.core_start}:00–{rules.core_end}:00</strong></li>
              <li>Min <strong>{rules.min_hours_per_day} hrs</strong> / day</li>
              <li>Target <strong>{rules.target_total} hrs</strong> / week</li>
            </ul>
            {!session.authenticated && <p className="mono small muted">Sign in to customize rules.</p>}
          </div>

          <div className="side-block">
            <h3>Compliance</h3>
            {violations.length === 0 && totals.total > 0 && <p className="ok mono small">✓ All rules satisfied</p>}
            {violations.length === 0 && totals.total === 0 && <p className="muted mono small">Start clicking to build a schedule.</p>}
            {violations.length > 0 && (
              <ul className="violations">
                {violations.slice(0, 6).map((v, i) => <li key={i} className="mono small">⚠ {v}</li>)}
              </ul>
            )}
          </div>

          <div className="side-block">
            <button className="btn btn-primary" disabled={saveState.status === 'saving' || totals.total === 0} onClick={publish}>
              {saveState.status === 'saving' ? 'Saving…' : session.authenticated ? 'Publish schedule' : 'Sign in to publish'}
            </button>
            {saveState.status === 'saved' && (
              <p className="mono small" style={{marginTop:'0.5rem'}}>
                Saved. <a href={`#/schedules/${saveState.publicId}`} onClick={(e) => e.preventDefault()}>Share link ready</a>
              </p>
            )}
            {saveState.status === 'error' && <p className="mono small" style={{color:'var(--signal-700)'}}>Error: {saveState.error}</p>}
          </div>
        </aside>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSuccess={() => { setSignInOpen(false); session.refresh(); }} />
    </section>
  );
}

window.Scheduler = Scheduler;
