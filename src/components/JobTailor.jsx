import React from 'react';
import { WipPage } from './WipPage.jsx';

function JobTailor() {
  return (
    <WipPage
      eyebrow="Work in progress · Resume tailor"
      title="Paste a JD and your resume. Get one that speaks the same language."
      lede="Coming soon. Here's what it will do and why I'm building it."
    >
      <h2 className="wip-h2">The problem</h2>
      <p>
        Generic resumes lose. Recruiters spend six seconds on the first pass,
        and ATS keyword filters have even shorter attention spans. But
        rewriting the same three pages for every posting is soul-crushing
        work — so most engineers ship the same generic PDF everywhere and
        lose interviews they should have won.
      </p>
      <p>
        The other failure mode is worse: engineers use ChatGPT to "tailor"
        their resume, and it invents skills they don't have. HR calls them
        out in the phone screen, and the whole application dies.
      </p>

      <h2 className="wip-h2">What this tool does</h2>
      <p>
        You paste two things: the job description and your real resume. The
        tool sends both to a fast LLM (Groq's llama-3.3-70b) with a strict
        rewrite prompt:
      </p>
      <ul className="wip-list">
        <li><b>Never invent.</b> Every skill, employer, date, and metric in the output must come from your source resume. No hallucinated experience.</li>
        <li><b>Reorder to match.</b> Move the bullets that map to the JD to the top of each role. Drop bullets that don't apply.</li>
        <li><b>Rephrase, don't rewrite.</b> Use the JD's terminology when you have genuine adjacent experience — "microservices" instead of "distributed services" if that's what they call it.</li>
        <li><b>Length discipline.</b> Stay within ~10% of the original length. Recruiters know when a resume balloons after tailoring.</li>
      </ul>
      <p>
        You also get a rationale — 3–5 bullets explaining what got
        emphasized and why — so you can defend the changes in the phone
        screen.
      </p>

      <h2 className="wip-h2">Free tier and paid runs</h2>
      <p>
        One free run per day for anonymous users (IP-limited). Sign in with
        a magic link and you get ten a day, plus a history of every tailor
        you've run. Groq costs are cheap enough that the whole thing runs
        on my nickel.
      </p>

      <h2 className="wip-h2">What's left to build</h2>
      <ul className="wip-list">
        <li>Diff view — see exactly what changed between your source and the tailored version, sentence by sentence.</li>
        <li>Cover-letter mode — same JD + resume, but produce a 180-word intro paragraph, not a full resume rewrite.</li>
        <li>PDF export with your chosen typography (right now it emits markdown for you to paste into your editor).</li>
        <li>Batch mode — paste 10 JDs, get 10 tailored versions in one run.</li>
      </ul>

      <h2 className="wip-h2">Timing</h2>
      <p>
        The tailor + rationale flow is wired end-to-end; I'm ironing out
        the sign-in UX and diff view before opening it to real use.
        Subscribe to the newsletter and I'll email when it's live.
      </p>
    </WipPage>
  );
}

export { JobTailor };
