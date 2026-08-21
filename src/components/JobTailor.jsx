import React from 'react';
import { useEffect, useState } from 'react';
import { SignInModal, apiFetch, useSession } from './api.jsx';

function JobTailor() {
  const session = useSession();
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [quota, setQuota] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | running | done | error | signin_required | paused
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [backendDown, setBackendDown] = useState(false);
  const loadQuota = async () => {
    try {
      const r = await apiFetch('/tailor/quota.json');
      if (r.ok) { setQuota(await r.json()); setBackendDown(false); }
      else if (r.status >= 500) { setBackendDown(true); }
    } catch (_) { setBackendDown(true); }
  };
  useEffect(() => { if (!session.loading) loadQuota(); }, [session.loading, session.authenticated]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('signed_in') === '1') {
      url.searchParams.delete('signed_in');
      window.history.replaceState(null, '', url.pathname + url.hash);
      setSignInOpen(false);
      session.refresh();
    }
  }, []);

  const canRun = jd.trim().length > 20 && resume.trim().length > 20 && status !== 'running';

  const submit = async () => {
    setStatus('running'); setError(null); setResult(null); setCopied(false);
    try {
      const r = await apiFetch('/tailor', { method: 'POST', body: JSON.stringify({ jd, resume }) });
      const j = await r.json();
      if (r.status === 402) { setStatus('signin_required'); setError(j.error); setSignInOpen(true); return; }
      if (r.status === 429) { setStatus('error'); setError(j.error || 'Daily limit reached.'); return; }
      if (r.status === 503 && j.paused) { setStatus('paused'); setError(j.error); return; }
      if (!r.ok) { setStatus('error'); setError(j.error || `HTTP ${r.status}`); return; }
      setResult({ tailored: j.tailored, rationale: j.rationale });
      setStatus('done');
      setQuota(q => q ? { ...q, remaining: j.remaining } : q);
    } catch (e) {
      setStatus('error'); setError(String(e));
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.tailored);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="tailor">
      <header className="section-head">
        <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>live demo · job tailor</p>
        <h1>Tailor a resume to a job description</h1>
        <p className="lead">Paste both. Groq (llama-3.3-70b) rewrites your resume to emphasize what matches — never inventing new claims.</p>
      </header>

      {backendDown && (
        <div className="empty-state">
          <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>backend unreachable</p>
          <p>The tailor backend isn't responding. If you're running locally, make sure Sinatra is up on port 4001 with <code>DATABASE_URL</code> set. In production this typically means the free-tier dyno is warming up — try again in ~30s.</p>
        </div>
      )}
      {!backendDown && <QuotaBar quota={quota} session={session} onSignIn={() => setSignInOpen(true)} />}

      <div className="tailor-inputs">
        <div className="tailor-pane">
          <label className="mono small muted" htmlFor="jd" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>job description</label>
          <textarea id="jd" className="tailor-textarea" placeholder="Paste the full JD here…" value={jd} onChange={(e) => setJd(e.target.value)} />
          <span className="mono small muted char-count">{jd.length.toLocaleString()} chars</span>
        </div>
        <div className="tailor-pane">
          <label className="mono small muted" htmlFor="resume" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>your resume (plain text)</label>
          <textarea id="resume" className="tailor-textarea" placeholder="Paste your resume as plain text…" value={resume} onChange={(e) => setResume(e.target.value)} />
          <span className="mono small muted char-count">{resume.length.toLocaleString()} chars</span>
        </div>
      </div>

      <div className="tailor-actions">
        <button className="btn btn-primary" disabled={!canRun} onClick={submit}>
          {status === 'running' ? 'Tailoring…' : 'Tailor my resume →'}
        </button>
        {status === 'running' && <span className="mono small muted">Talking to Groq… usually ~5s</span>}
      </div>

      {status === 'error' && <p className="muted mono" style={{color:'var(--signal-700)'}}>Error: {error}</p>}
      {status === 'signin_required' && (
        <div className="empty-state">
          <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>free tier used up</p>
          <p>{error || 'One free tailor per day for anonymous users. Sign in with a magic link to run more (10/day).'}</p>
          <button className="btn-inline" onClick={() => setSignInOpen(true)}>Sign in <span className="arr">→</span></button>
        </div>
      )}
      {status === 'paused' && (
        <div className="empty-state">
          <p className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>feature paused</p>
          <p>{error}</p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="tailor-result">
          <div className="tailor-result-head">
            <h2>Tailored resume</h2>
            <button className="btn btn-secondary" onClick={copyResult}>{copied ? 'Copied ✓' : 'Copy'}</button>
          </div>
          <pre className="tailor-output">{result.tailored}</pre>

          {result.rationale && (
            <>
              <h3>Why these changes</h3>
              <div className="tailor-rationale">{result.rationale}</div>
            </>
          )}
        </div>
      )}

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSuccess={() => { setSignInOpen(false); session.refresh(); }} />
    </section>
  );
}

function QuotaBar({ quota, session, onSignIn }) {
  if (!quota) return null;
  const pct = quota.limit > 0 ? Math.max(0, Math.min(100, (quota.remaining / quota.limit) * 100)) : 0;
  return (
    <div className="quota-bar" aria-label="Daily usage remaining">
      <div className="quota-meta">
        <span className="mono small muted" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>
          {quota.authenticated ? `signed in · ${session.email || ''}` : 'anonymous'}
        </span>
        <span className="mono small muted">{quota.remaining} of {quota.limit} left today</span>
      </div>
      <div className="quota-track"><div className="quota-fill" style={{width: `${pct}%`}} /></div>
      {!quota.authenticated && (
        <button className="btn-inline" onClick={onSignIn} style={{marginTop:'0.5rem'}}>
          Sign in to unlock {10 - quota.limit > 0 ? `${10 - quota.limit}× more` : 'more'} runs & history <span className="arr">→</span>
        </button>
      )}
    </div>
  );
}

export { JobTailor };
