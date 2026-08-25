import React from 'react';
import { WipPage } from './WipPage.jsx';

function Journey() {
  return (
    <WipPage
      eyebrow="Work in progress · Job-search journey"
      title="The job search, in public. Numbers, funnels, and lessons in real time."
      lede="Coming soon. Here's what it will do and why I'm building it."
    >
      <h2 className="wip-h2">Why publish a job search</h2>
      <p>
        Job hunts are the most opaque process in a technical career. Everyone
        does one every few years; almost nobody talks about the numbers.
        How many applications turned into recruiter calls? How many
        recruiter calls turned into onsites? How long did the median
        offer take? What did the compensation range actually look like?
      </p>
      <p>
        Aggregated data exists (Levels.fyi, Blind), but the funnel — the
        real conversion at each stage — is invisible. This page fixes
        that for one job search: mine.
      </p>

      <h2 className="wip-h2">What this page shows</h2>
      <ul className="wip-list">
        <li><b>Live funnel.</b> Applications submitted → recruiter screens → onsites → offers. Each number updates as I move through the hunt.</li>
        <li><b>Response-rate by company tier.</b> Big Tech vs mid-stage startup vs late-stage AI lab — the response rates aren't what most people assume.</li>
        <li><b>Time-per-stage.</b> How many days between "I applied" and "recruiter emailed"? Between "phone screen" and "onsite scheduled"? The stalls are as informative as the wins.</li>
        <li><b>What killed each application.</b> No response, rejected after screen, rejected after onsite, comp mismatch, or "I withdrew because red flag." Every dead application gets a one-line post-mortem.</li>
        <li><b>Weekly retro.</b> A short note each Friday: what I tried, what worked, what didn't, what I'm changing next week.</li>
      </ul>

      <h2 className="wip-h2">What I hope you get from it</h2>
      <p>
        If you're mid-hunt: calibration. Your response rate probably isn't
        as bad as you think — or it's worse for reasons that have nothing
        to do with your resume. Real numbers help.
      </p>
      <p>
        If you're a hiring manager: a candidate-side view of what your
        process actually feels like. Six weeks between phone screen and
        offer isn't "thorough" — it's a signal to good candidates that
        you're not serious.
      </p>
      <p>
        If you're a recruiter or founder: patterns in what makes a warm
        intro convert vs. a cold app die on the vine.
      </p>

      <h2 className="wip-h2">What's left to build</h2>
      <ul className="wip-list">
        <li>Company anonymization toggle — some conversations happen off the record; the funnel still counts them.</li>
        <li>Comparison mode — my numbers next to the industry median (from public sources) so you can see whether the stall is me or the market.</li>
        <li>A subscribe-to-hunt option that emails you when a specific stage crosses a threshold ("first offer received", "hit 100 applications", "took a role").</li>
      </ul>

      <h2 className="wip-h2">Timing</h2>
      <p>
        First version is a static dashboard reading from a JSON file I
        update manually. Later versions will pull directly from the tools
        I track applications in. Subscribe and I'll email when the live
        version goes up.
      </p>
    </WipPage>
  );
}

export { Journey };
