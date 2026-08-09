/* global React */
const { useState, useEffect, useCallback } = React;

const API_BASE =
  (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    ? 'http://localhost:4001'
    : 'https://portfolio-contact-j70g.onrender.com';

function apiFetch(path, opts = {}) {
  return fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
}

function useSession() {
  const [state, setState] = useState({ loading: true, authenticated: false, email: null });

  const refresh = useCallback(async () => {
    try {
      const r = await apiFetch('/auth/me');
      const j = await r.json();
      setState({ loading: false, authenticated: !!j.authenticated, email: j.email || null });
    } catch (e) {
      setState({ loading: false, authenticated: false, email: null, error: String(e) });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signOut = useCallback(async () => {
    await apiFetch('/auth/signout', { method: 'POST' });
    setState({ loading: false, authenticated: false, email: null });
  }, []);

  return { ...state, refresh, signOut };
}

function SignInModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending'); setError(null);
    try {
      const r = await apiFetch('/auth/request', { method: 'POST', body: JSON.stringify({ email }) });
      const j = await r.json();
      if (!r.ok) { setStatus('error'); setError(j.error || 'Request failed.'); return; }
      setStatus('sent');
    } catch (err) {
      setStatus('error'); setError(String(err));
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal signin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="signin-title">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-head">
          <span className="eyebrow">SIGN IN</span>
          <h2 className="modal-title" id="signin-title">Sign in with a magic link</h2>
          <p className="muted">No passwords. We email you a link that signs you in for 30 days.</p>
        </div>
        <div className="modal-body">
          {status !== 'sent' && (
            <form onSubmit={submit} className="signin-form">
              <label className="mono small muted" htmlFor="signin-email" style={{textTransform:'uppercase', letterSpacing:'0.12em'}}>email</label>
              <input
                id="signin-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                className="search-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="muted mono" style={{color:'var(--signal-700)'}}>Error: {error}</p>}
              <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Email me a link →'}
              </button>
              <p className="mono small muted" style={{marginTop:'1rem'}}>
                By signing in you agree to fair-use of the demos. Your email is used only for this sign-in flow. No newsletter, no sharing.
              </p>
            </form>
          )}
          {status === 'sent' && (
            <div className="signin-sent">
              <p className="lead">Check your inbox.</p>
              <p className="muted">A sign-in link is on its way to <strong>{email}</strong>. It expires in 15 minutes.</p>
              <p className="mono small muted">You can close this window — the link will sign you in when clicked.</p>
              <button className="btn btn-secondary" onClick={() => { setStatus('idle'); setEmail(''); }}>Try a different email</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.apiFetch = apiFetch;
window.API_BASE = API_BASE;
window.useSession = useSession;
window.SignInModal = SignInModal;
