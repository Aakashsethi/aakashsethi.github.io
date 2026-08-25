import React from 'react';
import { useState } from 'react';
import { subscribeEmail } from '../lib/subscribe.js';

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

    try {
      const result = await subscribeEmail(trimmed);
      setStatus('done');
      setMsg(result.message);
      setEmail('');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'newsletter_subscribe', { source: 'home' });
      }
    } catch (err) {
      setStatus('error');
      setMsg(err.message || 'Something went wrong. Try again or email me directly.');
    }
  };

  return (
    <section id="newsletter" className="jc-newsletter">
      <img
        className="jc-newsletter-dots"
        src="/assets/hero/purple-dots-accent.png"
        alt=""
        aria-hidden="true"
      />
      <div className="jc-newsletter-inner">
        <h2 className="jc-newsletter-title">
          Field notes on AI engineering, delivered when I publish.
        </h2>
        <p className="jc-newsletter-lede">
          Subscribe for long-form posts on RAG, AWS teardowns, and coaching notes from senior-level engineering work.
        </p>
        <form className="jc-form" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sending'}
          />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Subscribing…' : status === 'done' ? '✓ Subscribed' : 'Subscribe'}
          </button>
        </form>
        <p className={`jc-form-note${status === 'done' ? ' ok' : status === 'error' ? ' err' : ''}`}>
          {msg || 'No filler. No double opt-in. Unsubscribe anytime.'}
        </p>
      </div>
    </section>
  );
}

export { Newsletter };
