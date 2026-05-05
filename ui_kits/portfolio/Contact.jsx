/* global React */
const { useState } = React;

const CONTACT_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4001/contact'
  : 'https://portfolio-contact-j70g.onrender.com/contact';
const CAL_SRC = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Rltasz4uqIKognJ1oONG3bLqe3bE9jel0fDDq2SZACLOBezQkjj6vLqgNZs8OFl2iebj8GqKK?gv=true';

function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [booking, setBooking] = useState(false);
  const [status, setStatus]   = useState('idle');
  const [errMsg, setErrMsg]   = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, booking: booking ? 'yes' : 'no' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
    } catch (err) {
      setErrMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <section id="contact">
      <header className="section-head">
        <span className="eyebrow">COLLABORATE</span>
        <h2 className="section-title">Working on something serious?</h2>
        <p className="section-lede">
          Fastest path: email <a href="mailto:aakash.sethi7@gmail.com"><b>aakash.sethi7@gmail.com</b></a>.
          Or do both below — share what you're working on <em>and</em> book a time in one go. I'll come prepared.
        </p>
      </header>

      <div className="collab-grid">

        {/* ── Left: message form ── */}
        <div className="collab-col">
          <div className="collab-col-header">
            <span className="collab-step">01</span>
            <span className="collab-col-title">Tell me what you're working on</span>
          </div>

          {status === 'sent' ? (
            <div className="contact-sent">
              <span className="live-dot" />
              <div>
                <b>Message sent{booking ? ' + meeting booked' : ''}.</b>
                <div className="muted small">
                  {booking
                    ? "You'll get a calendar confirmation, and I'll come prepared. — A."
                    : "I'll write back within a couple of days. — A."}
                </div>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="row">
                <div className="field">
                  <label>Your name</label>
                  <input required value={form.name}
                         onChange={e => setForm({...form, name: e.target.value})}
                         placeholder="Ada Lovelace" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={form.email}
                         onChange={e => setForm({...form, email: e.target.value})}
                         placeholder="ada@analytical.engine" />
                </div>
              </div>
              <div className="field">
                <label>What are you working on?</label>
                <textarea required rows={5} value={form.message}
                          onChange={e => setForm({...form, message: e.target.value})}
                          placeholder="A sentence or three. I'd rather hear the messy version." />
              </div>

              <label className="booking-check">
                <input type="checkbox" checked={booking}
                       onChange={e => setBooking(e.target.checked)} />
                <span>I'm also booking a meeting on the calendar →</span>
              </label>

              <div className="contact-actions">
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : booking ? 'Send + I\'ve booked →' : 'Send message →'}
                </button>
              </div>
              {status === 'error' && (
                <p style={{color:'var(--danger-500)',fontSize:14,marginTop:'var(--sp-3)'}}>
                  {errMsg}
                </p>
              )}
              <p className="collab-hint muted small">or open a GitHub issue · or DM on LinkedIn</p>
            </form>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="collab-divider">
          <div className="collab-divider-line" />
          <span className="collab-divider-and">+</span>
          <div className="collab-divider-line" />
        </div>

        {/* ── Right: calendar ── */}
        <div className="collab-col">
          <div className="collab-col-header">
            <span className="collab-step">02</span>
            <span className="collab-col-title">Pick a time to meet</span>
          </div>
          <div className="book-chips">
            <span className="book-chip"><i data-lucide="clock" style={{width:13,height:13}}></i> 60 min</span>
            <span className="book-chip"><i data-lucide="calendar" style={{width:13,height:13}}></i> Mon – Fri</span>
            <span className="book-chip"><i data-lucide="video" style={{width:13,height:13}}></i> Google Meet</span>
          </div>
          <div className="book-frame-wrap">
            <iframe
              src={CAL_SRC}
              className="book-frame"
              frameBorder="0"
              title="Schedule a meeting with Aakash Sethi"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

window.Contact = Contact;
