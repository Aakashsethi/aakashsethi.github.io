/* global React */
const { useState } = React;

const CONTACT_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4001/contact'
  : 'https://portfolio-contact-j70g.onrender.com/contact';

const CAL_SRC = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Rltasz4uqIKognJ1oONG3bLqe3bE9jel0fDDq2SZACLOBezQkjj6vLqgNZs8OFl2iebj8GqKK?gv=true';
const MEET_LINK = 'https://meet.google.com/wza-dnjb-byb';

const WHERE_OPTIONS = [
  "I'm actively job searching",
  "I'm getting ready to job search",
  "I'm exploring options and pressure-testing ideas",
  "I've received an offer and need help evaluating it",
  "I'm paused / unsure",
];

const SUPPORT_OPTIONS = [
  'I have a direction and want help executing it well',
  'I have a few viable directions and need to choose thoughtfully',
  'I know something needs to change, but I\'m not ready to choose yet',
];

const TIMELINE_OPTIONS = [
  'Active urgency (offer in hand, deadline or layoff)',
  'Next 3–6 months',
  'Exploring deliberately, no fixed timeline',
];

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className="radio-group">
      {options.map(opt => (
        <label key={opt} className={`radio-option${value === opt ? ' selected' : ''}`}>
          <input type="radio" name={name} value={opt} checked={value === opt}
                 onChange={() => onChange(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', linkedin: '',
    role: '', decision: '', where: '',
    direction: '', support: '', useful: '', timeline: '',
    agree: false,
  });
  const [booking, setBooking] = useState(false);
  const [status, setStatus]   = useState('idle');
  const [errMsg, setErrMsg]   = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target ? e.target.value : e });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) { setErrMsg('Please confirm you understand before submitting.'); return; }
    setStatus('sending');
    setErrMsg('');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, booking: booking ? 'yes' : 'no', meetLink: MEET_LINK }),
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
          Fill in your details and pick a time — this is mutual evaluation, not a pitch.
          I'll review your responses beforehand so we can make the most of our time together.
        </p>
      </header>

      <div className="collab-grid">

        {/* ── Left: intake form ── */}
        <div className="collab-col">
          <div className="collab-col-header">
            <span className="collab-step">01</span>
            <span className="collab-col-title">Enter your details</span>
          </div>

          {status === 'sent' ? (
            <div className="contact-sent">
              <span className="live-dot" />
              <div>
                <b>Submitted{booking ? ' + meeting booked' : ''}.</b>
                <div className="muted small" style={{marginBottom: booking ? 'var(--sp-3)' : 0}}>
                  {booking
                    ? "I'll review your details before we meet. — A."
                    : "I'll write back within a couple of days. — A."}
                </div>
                {booking && (
                  <div className="meet-reveal">
                    <i data-lucide="video" style={{width:14,height:14}}></i>
                    <span>Your meeting link:</span>
                    <a href={MEET_LINK} target="_blank" rel="noopener noreferrer">{MEET_LINK}</a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>

              {/* Basic */}
              <div className="row">
                <div className="field">
                  <label>Name <span className="req">*</span></label>
                  <input required value={form.name} onChange={set('name')} placeholder="Ada Lovelace" />
                </div>
                <div className="field">
                  <label>Email <span className="req">*</span></label>
                  <input required type="email" value={form.email} onChange={set('email')} placeholder="ada@analytical.engine" />
                </div>
              </div>

              <div className="field">
                <label>LinkedIn profile <span className="optional">(optional)</span></label>
                <input type="url" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/yourname" />
              </div>

              {/* Situation */}
              <div className="intake-section-label">Your situation</div>

              <div className="field">
                <label>Current role & company <span className="req">*</span></label>
                <input required value={form.role} onChange={set('role')}
                       placeholder="e.g. Senior Engineer at Acme (or most recent role if you've left)" />
              </div>

              <div className="field">
                <label>What specific decision are you facing right now? <span className="req">*</span></label>
                <textarea required rows={3} value={form.decision} onChange={set('decision')}
                          placeholder="What prompted you to book this call? A few sentences is plenty." />
              </div>

              <div className="field">
                <label>Where are you today? <span className="req">*</span></label>
                <RadioGroup name="where" options={WHERE_OPTIONS} value={form.where} onChange={set('where')} />
              </div>

              {/* Direction */}
              <div className="intake-section-label">Direction & support</div>

              <div className="field">
                <label>One plausible direction for your next career step <span className="req">*</span></label>
                <textarea required rows={2} value={form.direction} onChange={set('direction')}
                          placeholder="Even if it's not final — what's one direction you're considering?" />
              </div>

              <div className="field">
                <label>What kind of support would help you most?</label>
                <RadioGroup name="support" options={SUPPORT_OPTIONS} value={form.support} onChange={set('support')} />
              </div>

              <div className="field">
                <label>What would make this conversation feel useful to you? <span className="req">*</span></label>
                <textarea required rows={2} value={form.useful} onChange={set('useful')}
                          placeholder="What outcome would make this call worth your time?" />
              </div>

              <div className="field">
                <label>Your timeline for making a career move</label>
                <RadioGroup name="timeline" options={TIMELINE_OPTIONS} value={form.timeline} onChange={set('timeline')} />
              </div>

              {/* Agree */}
              <label className="booking-check">
                <input type="checkbox" checked={form.agree}
                       onChange={e => setForm({ ...form, agree: e.target.checked })} />
                <span>I understand this will be added to a secure mailing list. I can unsubscribe at any time. <span className="req">*</span></span>
              </label>

              <label className="booking-check" style={{marginTop: 'var(--sp-2)'}}>
                <input type="checkbox" checked={booking}
                       onChange={e => setBooking(e.target.checked)} />
                <span>I'm also booking a time on the calendar →</span>
              </label>

              {status === 'error' && (
                <p style={{color:'var(--danger-500)',fontSize:14,marginTop:'var(--sp-2)'}}>
                  {errMsg}
                </p>
              )}

              <div className="contact-actions">
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : booking ? 'Submit + I\'ve booked →' : 'Submit →'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="collab-divider">
          <div className="collab-divider-line" />
          <span className="collab-divider-and">+</span>
          <div className="collab-divider-line" />
        </div>

        {/* ── Right: booking card ── */}
        <div className="collab-col">
          <div className="collab-col-header">
            <span className="collab-step">02</span>
            <span className="collab-col-title">Pick a time to meet</span>
          </div>

          <div className="cal-card">
            <div className="cal-card-avatar">A</div>
            <div className="cal-card-name">Aakash Sethi</div>
            <div className="cal-card-title-text">60-min Strategy Session</div>

            <div className="cal-card-chips">
              <span className="cal-chip"><i data-lucide="clock" style={{width:13,height:13}}></i> 60 min</span>
              <span className="cal-chip"><i data-lucide="calendar" style={{width:13,height:13}}></i> Mon – Fri</span>
              <span className="cal-chip"><i data-lucide="video" style={{width:13,height:13}}></i> Google Meet</span>
            </div>

            <p className="cal-card-desc">
              This is mutual evaluation — not a pitch. We'll discuss the decision you're facing,
              whether you're forming it or executing it, and if working together makes sense.
            </p>

            <div className="cal-card-steps">
              <div className="cal-step"><span className="cal-step-num">1</span><span>Fill in your details on the left</span></div>
              <div className="cal-step"><span className="cal-step-num">2</span><span>Click below to pick your time slot</span></div>
              <div className="cal-step"><span className="cal-step-num">3</span><span>Submit the form — your Meet link arrives by email</span></div>
            </div>

            <a className="cal-book-btn" href={CAL_SRC} target="_blank" rel="noopener noreferrer">
              <i data-lucide="calendar-plus" style={{width:16,height:16}}></i>
              Book a time →
            </a>

            <p className="cal-card-note muted small">Opens Google Calendar · No account required</p>
          </div>
        </div>

      </div>
    </section>
  );
}

window.Contact = Contact;
