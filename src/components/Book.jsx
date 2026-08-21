import React from 'react';

const BOOKING_URL = 'https://calendar.app.google/SyaqcQSQ5zDqvRvx9';

function Book() {
  return (
    <section id="book">
      <header className="section-head">
        <span className="eyebrow">SCHEDULE</span>
        <h2 className="section-title">Book a meeting</h2>
        <p className="section-lede">
          60-minute sessions, weekdays only. Pick a time that works and I'll meet you there —
          we can dig into your project, technical requirements, and what a collaboration could look like.
        </p>
        <div className="book-meta">
          <span className="book-chip"><i data-lucide="clock" style={{width:14,height:14}}></i> 60 min</span>
          <span className="book-chip"><i data-lucide="calendar" style={{width:14,height:14}}></i> Mon – Fri</span>
          <span className="book-chip"><i data-lucide="video" style={{width:14,height:14}}></i> Google Meet</span>
        </div>
      </header>

      <div className="book-frame-wrap">
        <iframe
          src={BOOKING_URL}
          title="Schedule a meeting with Aakash Sethi"
          className="book-frame"
          frameBorder="0"
          allowFullScreen
        />
      </div>

      <p className="book-note muted small">
        A confirmation email with all session details will be sent after booking.
        Prefer async? <a href="mailto:aakash.sethi7@gmail.com">Drop a note instead →</a>
      </p>
    </section>
  );
}

export { Book };
