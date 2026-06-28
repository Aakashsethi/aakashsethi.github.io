/* global React */
const { useState } = React;

function Newsletter() {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('idle'); // idle | sending | done | error
  const [msg, setMsg]         = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed) return;
    setStatus('sending');
    setMsg('');

    const body = new URLSearchParams();
    body.append('email', trimmed);
    body.append('embed', '1');
    body.append('tag', 'site');

    try {
      await fetch('https://buttondown.com/api/emails/embed-subscribe/sethi', {
        method: 'POST',
        body,
        mode: 'no-cors',
      });
      setStatus('done');
      setMsg('✓ You\'re in. A welcome note is on its way.');
      setEmail('');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'newsletter_subscribe', { source: 'home' });
      }
    } catch {
      setStatus('error');
      setMsg('Something went wrong. Try again or email me directly.');
    }
  };

  return (
    <section id="newsletter" className="newsletter">
      <div className="newsletter-eyebrow">NEWSLETTER</div>
      <h2 className="newsletter-title">
        Field notes on AI engineering, RAG, and shipping production AI.
      </h2>
      <p className="newsletter-lede">
        One email when I publish — usually a long-form post or a teardown of something real I shipped. No filler. <strong>No double opt-in.</strong>
      </p>
      <form className="newsletter-form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          placeholder="you@domain.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'sending'}
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing…' : status === 'done' ? '✓ Subscribed' : 'Subscribe →'}
        </button>
      </form>
      <div className={`newsletter-status${status === 'done' ? ' ok' : status === 'error' ? ' err' : ''}`}>
        {msg || 'Free · Unsubscribe anytime · Hosted on Buttondown'}
      </div>
    </section>
  );
}

window.Newsletter = Newsletter;
