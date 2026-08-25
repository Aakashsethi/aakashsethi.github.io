import React from 'react';
import { useEffect, useMemo, useState } from 'react';

// A localStorage-backed application tracker. The reader owns the
// data — nothing goes to a server, nothing needs an account. Add a
// row per application, cycle stages, see a live funnel.

const STORAGE_KEY = 'jb-tracker-v1';

const STAGES = ['applied', 'screen', 'onsite', 'offer', 'rejected'];
const STAGE_LABEL = {
  applied: 'Applied',
  screen: 'Recruiter screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected',
};

function AppTracker() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ company: '', role: '', stage: 'applied' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRows(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); } catch {}
  }, [rows, loaded]);

  const nowIso = () => new Date().toISOString();
  const nowShort = () => nowIso().slice(0, 10);

  const add = (e) => {
    e.preventDefault();
    const company = form.company.trim();
    const role = form.role.trim();
    if (!company) return;
    const now = nowIso();
    setRows((r) => [
      {
        id: crypto.randomUUID(),
        company,
        role,
        stage: form.stage,
        added: nowShort(),
        log: [{ ts: now, event: `Added — stage: ${form.stage}` }],
      },
      ...r,
    ]);
    setForm({ company: '', role: '', stage: 'applied' });
  };

  const cycleStage = (id) => {
    const now = nowIso();
    setRows((r) =>
      r.map((row) => {
        if (row.id !== id) return row;
        const idx = STAGES.indexOf(row.stage);
        const next = STAGES[(idx + 1) % STAGES.length];
        const log = [{ ts: now, event: `Stage: ${row.stage} → ${next}` }, ...(row.log || [])];
        return { ...row, stage: next, log };
      })
    );
  };

  const remove = (id) => setRows((r) => r.filter((row) => row.id !== id));

  const clearAll = () => {
    if (!window.confirm('Clear every tracked application? This can\'t be undone.')) return;
    setRows([]);
  };

  const exportCsv = () => {
    const header = 'company,role,stage,added';
    const body = rows.map((r) =>
      [r.company, r.role, r.stage, r.added]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobboating-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const funnel = useMemo(() => {
    const counts = STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    rows.forEach((r) => { counts[r.stage] = (counts[r.stage] || 0) + 1; });
    return counts;
  }, [rows]);

  const total = rows.length;
  const conversion = (from, to) => {
    if (!funnel[from]) return null;
    return Math.round((funnel[to] / funnel[from]) * 100);
  };

  return (
    <div className="jb-tracker">
      <header className="jb-panel-head">
        <h2 className="jb-h2">Your application tracker</h2>
        <p className="jb-copy">
          Add a row per application. Cycle its stage as things move. Everything lives in your
          browser's localStorage — no account, no server. Every stage change is timestamped for
          your own audit trail. Export to CSV whenever you want.
        </p>
        <div className="jb-storage-bar">
          <span className="jb-storage-icon" aria-hidden="true">◉</span>
          <span className="jb-storage-key">Data at rest</span>
          <span className="jb-storage-val">localStorage · your device</span>
          <span className="jb-storage-sep">·</span>
          <span className="jb-storage-key">Rows</span>
          <span className="jb-storage-val">{rows.length}</span>
          <span className="jb-storage-sep">·</span>
          <span className="jb-storage-key">Egress</span>
          <span className="jb-storage-val">0 bytes</span>
        </div>
      </header>

      <form className="jb-tracker-form" onSubmit={add}>
        <input
          type="text"
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
          required
          className="jb-input"
        />
        <input
          type="text"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          className="jb-input"
        />
        <select
          value={form.stage}
          onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
          className="jb-input"
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>{STAGE_LABEL[s]}</option>
          ))}
        </select>
        <button type="submit" className="jb-btn primary">Add</button>
      </form>

      {total > 0 && (
        <div className="jb-funnel-mini">
          {STAGES.map((s, i) => (
            <div key={s} className={`jb-funnel-cell jb-funnel-${s}`}>
              <p className="jb-funnel-val">{funnel[s]}</p>
              <p className="jb-funnel-lbl">{STAGE_LABEL[s]}</p>
              {i > 0 && conversion(STAGES[i - 1], s) !== null && (
                <p className="jb-funnel-conv">
                  {conversion(STAGES[i - 1], s)}% from prev
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="jb-empty">No applications tracked yet. Add one above.</p>
      ) : (
        <div className="jb-tracker-table">
          {rows.map((row) => (
            <div key={row.id} className="jb-tracker-row">
              <div className="jb-tracker-body">
                <p className="jb-tracker-company">{row.company}</p>
                {row.role && <p className="jb-tracker-role">{row.role}</p>}
                <p className="jb-tracker-added jb-mono jb-muted">
                  Added {row.added} · id {row.id.slice(0, 8)}
                </p>
                {row.log && row.log.length > 1 && (
                  <details className="jb-audit">
                    <summary>Audit log · {row.log.length} events</summary>
                    <ol className="jb-audit-list">
                      {row.log.map((entry, i) => (
                        <li key={i}>
                          <span className="jb-mono jb-muted">{entry.ts.slice(0, 19).replace('T', ' ')}Z</span>
                          <span>{entry.event}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
              <div className="jb-tracker-actions">
                <button
                  type="button"
                  className={`jb-stage-pill jb-stage-${row.stage}`}
                  onClick={() => cycleStage(row.id)}
                  title="Click to advance stage"
                >
                  {STAGE_LABEL[row.stage]}
                </button>
                <button
                  type="button"
                  className="jb-icon-btn"
                  onClick={() => remove(row.id)}
                  aria-label="Remove"
                  title="Remove"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="jb-tracker-footer">
          <button type="button" className="jb-btn ghost" onClick={exportCsv}>Export CSV</button>
          <button type="button" className="jb-link-btn" onClick={clearAll}>Clear all</button>
        </div>
      )}
    </div>
  );
}

export { AppTracker };
