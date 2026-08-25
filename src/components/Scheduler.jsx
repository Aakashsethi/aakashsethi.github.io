import React from 'react';
import { WipPage } from './WipPage.jsx';

function Scheduler() {
  return (
    <WipPage
      eyebrow="Work in progress · Deep-work scheduler"
      title="A weekly grid that defends deep work from the rest of the calendar."
      lede="Coming soon. Here's what it will do and why I'm building it."
    >
      <h2 className="wip-h2">The problem</h2>
      <p>
        Most calendar tools treat every hour as fungible. A 25-minute status
        update sits in the same block as a two-hour architecture review — and
        the tool has no opinion about which one you should protect. So the
        default becomes "whoever puts a meeting on you wins."
      </p>
      <p>
        Deep work — the hard, ambiguous, high-leverage stuff — gets pushed to
        evenings and weekends by default. I've watched senior engineers with
        real judgment lose four hours a day to interruptions they never chose,
        just because their calendar didn't have a shape.
      </p>

      <h2 className="wip-h2">What this tool does</h2>
      <p>
        You get a Mon–Fri × 9–5 grid. Each hour is a click-to-cycle cell with
        five kinds: <b>deep</b>, <b>meetings</b>, <b>admin</b>, <b>focus</b>,
        or empty. You paint your ideal week — deep work in the mornings,
        meetings clumped in the afternoons, admin in the low-energy dregs.
      </p>
      <p>
        Then the tool enforces the rules you set:
      </p>
      <ul className="wip-list">
        <li><b>Core hours must be filled.</b> Between (say) 10a and 3p, no cell can be empty. Blocks are for work; empty blocks are for evenings.</li>
        <li><b>Minimum hours per day.</b> If Tuesday only has three countable hours, the tool warns you before you publish.</li>
        <li><b>Deep-vs-meetings ratio.</b> The header shows the split live. If meetings creep past a threshold you set, it flags it.</li>
        <li><b>Weekly total target.</b> Aim for 40 (or 32, or 50 — your call). The remaining count updates as you paint.</li>
      </ul>

      <h2 className="wip-h2">Why publish it</h2>
      <p>
        You publish the week to a shareable link. Your team, your report,
        your partner, your boss — they can see when you're heads-down and
        when meetings are welcome. It's a soft social contract, not a hard
        block. In my experience the visibility alone changes behavior more
        than any Do-Not-Disturb toggle ever has.
      </p>

      <h2 className="wip-h2">What's left to build</h2>
      <ul className="wip-list">
        <li>Recurring-template mode so you don't repaint every Monday.</li>
        <li>iCal export so your published week actually shows up on other people's calendars.</li>
        <li>Retrospective view — end of week, mark what you actually did vs. what you planned, so the tool learns your realistic ratios.</li>
        <li>Team-of-teams view so you can see everyone's deep-work windows on one grid before scheduling that recurring sync.</li>
      </ul>

      <h2 className="wip-h2">Timing</h2>
      <p>
        I'm shipping the click-to-paint MVP + the shareable-link publish in
        the next iteration. iCal and templates come after. Subscribe to the
        newsletter and you'll get the note when it lands.
      </p>
    </WipPage>
  );
}

export { Scheduler };
