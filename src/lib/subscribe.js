// Single source of truth for the Buttondown-backed subscribe call.
// Newsletter.jsx (home) and SubscribeInline.astro (blog / posts) both
// consume this so the endpoint URL, response shape, and messaging
// live in one place.

const PROD_API = 'https://portfolio-contact-j70g.onrender.com';

export function subscribeApiBase() {
  if (typeof window === 'undefined') return PROD_API;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') {
    return `http://${h}:4001`;
  }
  return PROD_API;
}

/**
 * POST /subscribe. Returns { ok, already?, message } or throws.
 * Deliberately does not send `tag` — Buttondown's free plan 403s on tagged
 * subscribers; re-add if you upgrade.
 */
export async function subscribeEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) throw new Error('Email is required.');

  const res = await fetch(`${subscribeApiBase()}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: trimmed }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Subscription failed (${res.status}).`);
  return {
    ok: true,
    already: !!data.already,
    message: data.already
      ? "✓ You're already on the list — thanks for the support."
      : "✓ You're in. A welcome note is on its way.",
  };
}
