/* global React */
function Newsletter() {
  return (
    <section id="newsletter" className="newsletter">
      <div className="newsletter-eyebrow">NEWSLETTER</div>
      <h2 className="newsletter-title">
        Field notes on AI engineering, RAG, and shipping production AI.
      </h2>
      <p className="newsletter-lede">
        One email when I publish — usually a long-form post or a teardown of something real I shipped. No filler.
      </p>
      <form
        className="newsletter-form"
        action="https://buttondown.com/api/emails/embed-subscribe/sethi"
        method="post"
        target="popupwindow"
        onSubmit={() => window.open('https://buttondown.com/sethi', 'popupwindow')}
      >
        <input type="email" name="email" required placeholder="you@domain.com" aria-label="Email address" />
        <input type="hidden" name="tag" value="site" />
        <button type="submit">Subscribe →</button>
      </form>
      <div className="newsletter-meta">Free · Unsubscribe anytime · Hosted on Buttondown</div>
    </section>
  );
}

window.Newsletter = Newsletter;
