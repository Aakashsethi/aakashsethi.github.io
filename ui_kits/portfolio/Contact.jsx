/* global React */
const { useState } = React;

const CONTACT_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:4001/contact'
  : 'https://portfolio-contact-j70g.onrender.com/contact';

const CAL_SRC = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Rltasz4uqIKognJ1oONG3bLqe3bE9jel0fDDq2SZACLOBezQkjj6vLqgNZs8OFl2iebj8GqKK?gv=true';
const MEET_LINK = 'https://meet.google.com/wza-dnjb-byb';

/* ── Track A: AI Engineering / Consulting ──────────────────── */
const SCOPE_OPTIONS = [
  'AI / LLM application or RAG system',
  'Agentic system or AI workflow automation',
  'AWS architecture / cloud infrastructure',
  'AI security / SOC 2 / compliance review',
  'System design or technical due diligence',
  'Something else (describe below)',
];

const STAGE_OPTIONS = [
  'Discovery — we know the problem, exploring approaches',
  'Design — we have direction, need an architect',
  'Build — actively shipping, need senior hands',
  'Review — production system, want an outside read',
];

/* ── Track B: Career Coaching ──────────────────────────────── */
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
  const [track, setTrack] = useState('consulting'); // 'consulting' | 'coaching'

  // Shared fields
  const [shared, setShared] = useState({ name: '', email: '', linkedin: '', company: '' });

  // Consulting fields
  const [consulting, setConsulting] = useState({
    scope: '', problem: '', stage: '', timeline: '', outcome: '',
  });

  // Coaching fields
  const [coaching, setCoaching] = useState({
    role: '', decision: '', where: '',
    direction: '', support: '', useful: '', timeline: '',
  });

  const [agree, setAgree] = useState(false);
  const [booking, setBooking] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const setSharedField = (key) => (e) => setShared({ ...shared, [key]: e.target.value });
  const setConsultingField = (key) => (e) => setConsulting({ ...consulting, [key]: e.target ? e.target.value : e });
  const setCoachingField = (key) => (e) => setCoaching({ ...coaching, [key]: e.target ? e.target.value : e });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!agree) { setErrMsg('Please confirm you understand before submitting.'); return; }
    setStatus('sending');
    setErrMsg('');
    const payload = track === 'consulting'
      ? { track: 'consulting', ...shared, ...consulting }
      : { track: 'coaching', ...shared, ...coaching };
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, booking: booking ? 'yes' : 'no', meetLink: MEET_LINK }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'contact_submit', { track });
      }
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
          Pick the track that fits — consulting on an AI / cloud build, or career coaching for engineers.
          Fill in your details and pick a time. This is mutual evaluation, not a pitch.
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
            <>
              {/* Track toggle */}
              <div className="track-toggle" role="tablist" aria-label="Select track">
                <button type="button"
                        role="tab"
                        aria-selected={track === 'consulting'}
                        className={`track-btn${track === 'consulting' ? ' active' : ''}`}
                        onClick={() => setTrack('consulting')}>
                  AI Engineering / Consulting
                </button>
                <button type="button"
                        role="tab"
                        aria-selected={track === 'coaching'}
                        className={`track-btn${track === 'coaching' ? ' active' : ''}`}
                        onClick={() => setTrack('coaching')}>
                  Career Coaching
                </button>
              </div>

              <form className="contact-form" onSubmit={onSubmit}>

                {/* Shared basics */}
                <div className="row">
                  <div className="field">
                    <label>Name <span className="req">*</span></label>
                    <input required value={shared.name} onChange={setSharedField('name')} placeholder="Ada Lovelace" />
                  </div>
                  <div className="field">
                    <label>Email <span className="req">*</span></label>
                    <input required type="email" value={shared.email} onChange={setSharedField('email')} placeholder="ada@analytical.engine" />
                  </div>
                </div>

                <div className="field">
                  <label>LinkedIn profile <span className="optional">(optional)</span></label>
                  <input type="url" value={shared.linkedin} onChange={setSharedField('linkedin')} placeholder="https://linkedin.com/in/yourname" />
                </div>

                {track === 'consulting' ? (
                  <>
                    <div className="intake-section-label">Your engagement</div>

                    <div className="field">
                      <label>Company / project <span className="req">*</span></label>
                      <input required value={shared.company} onChange={setSharedField('company')}
                             placeholder="e.g. Acme — internal RAG platform for support" />
                    </div>

                    <div className="field">
                      <label>What's the scope? <span className="req">*</span></label>
                      <RadioGroup name="scope" options={SCOPE_OPTIONS} value={consulting.scope} onChange={setConsultingField('scope')} />
                    </div>

                    <div className="field">
                      <label>Describe the problem you're trying to solve <span className="req">*</span></label>
                      <textarea required rows={4} value={consulting.problem} onChange={setConsultingField('problem')}
                                placeholder="What does success look like? What's failing or unclear today?" />
                    </div>

                    <div className="field">
                      <label>Where is the project right now? <span className="req">*</span></label>
                      <RadioGroup name="stage" options={STAGE_OPTIONS} value={consulting.stage} onChange={setConsultingField('stage')} />
                    </div>

                    <div className="field">
                      <label>Timeline <span className="optional">(when do you need outcomes?)</span></label>
                      <input value={consulting.timeline} onChange={setConsultingField('timeline')}
                             placeholder="e.g. POC by end of Q3, production by Q4" />
                    </div>

                    <div className="field">
                      <label>What outcome would make this engagement a clear win? <span className="req">*</span></label>
                      <textarea required rows={2} value={consulting.outcome} onChange={setConsultingField('outcome')}
                                placeholder="One concrete result that would make this worth the time." />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="intake-section-label">Your situation</div>

                    <div className="field">
                      <label>Current role & company <span className="req">*</span></label>
                      <input required value={coaching.role} onChange={setCoachingField('role')}
                             placeholder="e.g. Senior Engineer at Acme (or most recent role if you've left)" />
                    </div>

                    <div className="field">
                      <label>What specific decision are you facing right now? <span className="req">*</span></label>
                      <textarea required rows={3} value={coaching.decision} onChange={setCoachingField('decision')}
                                placeholder="What prompted you to book this call? A few sentences is plenty." />
                    </div>

                    <div className="field">
                      <label>Where are you today? <span className="req">*</span></label>
                      <RadioGroup name="where" options={WHERE_OPTIONS} value={coaching.where} onChange={setCoachingField('where')} />
                    </div>

                    <div className="intake-section-label">Direction & support</div>

                    <div className="field">
                      <label>One plausible direction for your next career step <span className="req">*</span></label>
                      <textarea required rows={2} value={coaching.direction} onChange={setCoachingField('direction')}
                                placeholder="Even if it's not final — what's one direction you're considering?" />
                    </div>

                    <div className="field">
                      <label>What kind of support would help you most?</label>
                      <RadioGroup name="support" options={SUPPORT_OPTIONS} value={coaching.support} onChange={setCoachingField('support')} />
                    </div>

                    <div className="field">
                      <label>What would make this conversation feel useful to you? <span className="req">*</span></label>
                      <textarea required rows={2} value={coaching.useful} onChange={setCoachingField('useful')}
                                placeholder="What outcome would make this call worth your time?" />
                    </div>

                    <div className="field">
                      <label>Your timeline for making a career move</label>
                      <RadioGroup name="timeline" options={TIMELINE_OPTIONS} value={coaching.timeline} onChange={setCoachingField('timeline')} />
                    </div>
                  </>
                )}

                <label className="booking-check">
                  <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
                  <span>I understand this will be added to a secure mailing list. I can unsubscribe at any time. <span className="req">*</span></span>
                </label>

                <label className="booking-check" style={{marginTop: 'var(--sp-2)'}}>
                  <input type="checkbox" checked={booking} onChange={e => setBooking(e.target.checked)} />
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
            </>
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
            <div className="cal-card-title-text">
              {track === 'consulting' ? '45-min Consulting Intro' : '60-min Strategy Session'}
            </div>

            <div className="cal-card-chips">
              <span className="cal-chip"><i data-lucide="clock" style={{width:13,height:13}}></i> {track === 'consulting' ? '45 min' : '60 min'}</span>
              <span className="cal-chip"><i data-lucide="calendar" style={{width:13,height:13}}></i> Mon – Fri</span>
              <span className="cal-chip"><i data-lucide="video" style={{width:13,height:13}}></i> Google Meet</span>
            </div>

            <p className="cal-card-desc">
              {track === 'consulting'
                ? 'A working session to size the engagement: scope, constraints, stack, success criteria. No pitch — if it\'s not a fit I\'ll say so.'
                : 'Mutual evaluation — not a pitch. We\'ll discuss the decision you\'re facing, whether you\'re forming it or executing it, and if working together makes sense.'}
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
