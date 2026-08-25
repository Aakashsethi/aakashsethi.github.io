import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

// One-shot tailoring flow: PDF → structured LaTeX → paste JD → ranked
// bullets with matched keywords highlighted → downloadable tailored .tex.
//
// Everything happens in the browser. No API keys, no server round-trip.
// The tailoring is deterministic keyword matching — same idea as an ATS
// on the other side of the wall — so what you see is what a filter sees.

const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

// Section headers we recognize in a resume — used to group bullets
// under a section so we don't reorder across the whole document.
const SECTION_RE = /^(experience|work experience|professional experience|employment|education|skills?|technical skills?|projects?|selected projects?|publications?|awards?|certifications?|summary|profile|objective|leadership|volunteer|extracurricular|activities)\s*:?$/i;

// Common English stop-words we skip when pulling JD keywords.
const STOP = new Set([
  'the','a','an','and','or','but','if','then','of','to','in','for','on','with','as','by','at','from','into','onto','over','under','about','after','before','through','during','via','per','using','use','used','uses','be','is','are','was','were','been','being','have','has','had','having','do','does','did','doing','will','would','can','could','should','may','might','must','shall','you','your','yours','we','our','ours','they','their','theirs','this','that','these','those','it','its','not','no','yes','so','than','also','who','what','when','where','why','how','which','other','some','any','all','each','every','both','more','most','less','least','many','much','few','several','across','including','include','includes','included','job','role','position','description','required','requirements','preferred','qualifications','candidate','candidates','team','teams','work','working','ability','abilities','strong','excellent','ideal','great','good','best','plus','years','year','minimum','experience','experiences','experienced','knowledge','skills','skill','proficient','proficiency','familiar','familiarity'
]);

function TailorFlow() {
  const [pdfStatus, setPdfStatus] = useState('idle'); // idle | loading | extracting | done | error
  const [pdfError, setPdfError] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [sections, setSections] = useState([]); // [{ heading, bullets: [line, ...] }]
  const [jd, setJd] = useState('');
  const [tex, setTex] = useState('');
  const [copied, setCopied] = useState(false);
  const pdfjsRef = useRef(null);

  useEffect(() => {
    setPdfStatus('loading');
    import(/* @vite-ignore */ PDFJS_URL)
      .then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        pdfjsRef.current = mod;
        setPdfStatus('idle');
      })
      .catch((e) => {
        setPdfStatus('error');
        setPdfError(`Could not load pdf.js: ${e.message}`);
      });
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pdfjsRef.current) return;
    setPdfStatus('extracting');
    setPdfError(null);
    setPdfName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsRef.current.getDocument({ data: buf }).promise;
      const structured = await extractStructured(pdf);
      setSections(structured);
      setPdfStatus('done');
    } catch (err) {
      setPdfStatus('error');
      setPdfError(`Could not read PDF: ${err.message}`);
    }
  };

  const keywords = useMemo(() => extractJdKeywords(jd), [jd]);
  const keywordSet = useMemo(() => new Set(keywords.map((k) => k.toLowerCase())), [keywords]);

  const rankedSections = useMemo(() => {
    if (!sections.length) return [];
    return sections.map((sec) => {
      const scored = sec.bullets.map((b) => ({
        text: b,
        score: scoreBullet(b, keywordSet),
        matches: findMatches(b, keywordSet),
      }));
      // Reorder bullets by score descending, keeping bullets with 0 score in original order at the end.
      const withScore = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
      const noScore = scored.filter((s) => s.score === 0);
      return { heading: sec.heading, ranked: [...withScore, ...noScore] };
    });
  }, [sections, keywordSet]);

  const stats = useMemo(() => {
    const totalBullets = sections.reduce((n, s) => n + s.bullets.length, 0);
    const matchedBullets = rankedSections.reduce(
      (n, s) => n + s.ranked.filter((b) => b.score > 0).length, 0);
    const totalKeywords = keywords.length;
    const coveredKeywords = new Set();
    rankedSections.forEach((s) => s.ranked.forEach((b) => b.matches.forEach((m) => coveredKeywords.add(m.toLowerCase()))));
    return {
      totalBullets,
      matchedBullets,
      totalKeywords,
      coveredKeywords: coveredKeywords.size,
    };
  }, [sections, rankedSections, keywords]);

  useEffect(() => {
    if (!sections.length) { setTex(''); return; }
    setTex(toLatex(rankedSections, pdfName.replace(/\.pdf$/i, '') || 'Resume', keywords));
  }, [rankedSections, pdfName, keywords]);

  const copyTex = async () => {
    if (!tex) return;
    await navigator.clipboard.writeText(tex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadTex = () => {
    if (!tex) return;
    const blob = new Blob([tex], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-tailored.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tf">
      <header className="jb-panel-head">
        <h2 className="jb-h2">Tailor a resume to a job description.</h2>
        <p className="jb-copy">
          Drop a PDF resume and paste the JD. The browser converts your resume to LaTeX
          (line-by-line, section-preserving), pulls the JD's keywords, then reorders bullets
          inside each section so the highest-relevance ones surface first — matches are
          highlighted so you can see exactly why. Download the tailored <code>.tex</code>.
        </p>
        <div className="tf-flow" role="list" aria-label="Data flow">
          <span role="listitem" className="tf-flow-step">
            <span className="tf-flow-dot" aria-hidden="true"></span>
            <span className="tf-flow-key">PDF</span>
            <span className="tf-flow-val">this tab</span>
          </span>
          <span className="tf-flow-arrow" aria-hidden="true">→</span>
          <span role="listitem" className="tf-flow-step">
            <span className="tf-flow-dot" aria-hidden="true"></span>
            <span className="tf-flow-key">pdf.js parse</span>
            <span className="tf-flow-val">in-memory</span>
          </span>
          <span className="tf-flow-arrow" aria-hidden="true">→</span>
          <span role="listitem" className="tf-flow-step">
            <span className="tf-flow-dot" aria-hidden="true"></span>
            <span className="tf-flow-key">Score + rank</span>
            <span className="tf-flow-val">local</span>
          </span>
          <span className="tf-flow-arrow" aria-hidden="true">→</span>
          <span role="listitem" className="tf-flow-step">
            <span className="tf-flow-dot" aria-hidden="true"></span>
            <span className="tf-flow-key">LaTeX out</span>
            <span className="tf-flow-val">your download</span>
          </span>
        </div>
      </header>

      <div className="tf-inputs">
        <section className="tf-input">
          <p className="tf-step">1 · Resume PDF</p>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={onFile}
            className="jb-file-input"
            id="tf-pdf"
          />
          <label htmlFor="tf-pdf" className="jb-drop-label">
            {pdfStatus === 'loading' && 'Loading PDF engine…'}
            {pdfStatus === 'extracting' && 'Extracting…'}
            {pdfStatus === 'done' && (pdfName || 'Choose another PDF')}
            {(pdfStatus === 'idle' || pdfStatus === 'error') && 'Choose PDF'}
          </label>
          {pdfError && <p className="jb-error">{pdfError}</p>}
          {pdfStatus === 'done' && (
            <p className="tf-summary jb-mono jb-muted">
              {sections.length} sections · {sections.reduce((n, s) => n + s.bullets.length, 0)} lines
            </p>
          )}
        </section>

        <section className="tf-input">
          <p className="tf-step">2 · Job description</p>
          <textarea
            className="tf-jd"
            placeholder="Paste the full JD here…"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={8}
          />
          {jd.trim().length > 0 && (
            <p className="tf-summary jb-mono jb-muted">
              {jd.trim().length.toLocaleString()} chars · {keywords.length} keywords extracted
            </p>
          )}
        </section>
      </div>

      {sections.length > 0 && (
        <section className="tf-results">
          <div className="tf-results-head">
            <p className="tf-step">3 · Tailored output</p>
            {jd.trim().length > 0 && (
              <p className="tf-stats jb-mono jb-muted">
                {stats.matchedBullets}/{stats.totalBullets} bullets match ·
                {' '}{stats.coveredKeywords}/{stats.totalKeywords} JD keywords covered
              </p>
            )}
          </div>

          {keywords.length > 0 && (
            <div className="tf-keywords">
              {keywords.map((k) => (
                <span key={k} className="tf-kw">{k}</span>
              ))}
            </div>
          )}

          <div className="tf-preview">
            {rankedSections.map((sec, i) => (
              <div key={i} className="tf-sec">
                {sec.heading && <h4 className="tf-sec-heading">{sec.heading}</h4>}
                <ul className="tf-bullets">
                  {sec.ranked.map((b, j) => (
                    <li key={j} className={b.score > 0 ? 'tf-b tf-b-hit' : 'tf-b'}>
                      {b.score > 0 && <span className="tf-score">{b.score}</span>}
                      <span className="tf-b-text" dangerouslySetInnerHTML={{ __html: highlightMatches(b.text, keywordSet) }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="tf-tex">
            <div className="tf-tex-head">
              <p className="tf-step">4 · LaTeX source</p>
              <div className="tf-actions">
                <button type="button" className="jb-btn ghost" onClick={copyTex}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
                <button type="button" className="jb-btn primary" onClick={downloadTex}>
                  Download resume-tailored.tex
                </button>
              </div>
            </div>
            <pre className="jb-code">{tex}</pre>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── PDF extraction ────────────────────────────────────────────────────────

async function extractStructured(pdf) {
  const allLines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    // Group items by y-position so wrapped runs on the same visual line
    // merge back into one string.
    const lineBins = new Map();
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const bin = Math.round(y / 2) * 2; // 2px tolerance
      if (!lineBins.has(bin)) lineBins.set(bin, []);
      lineBins.get(bin).push(item);
    }

    // Sort bins top-to-bottom (higher y = higher on PDF page)
    const sortedYs = [...lineBins.keys()].sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = lineBins.get(y).sort((a, b) => a.transform[4] - b.transform[4]);
      const text = items.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim();
      if (text) allLines.push(text);
    }
  }

  // Split into sections. A line is a heading if it matches SECTION_RE
  // OR it's short + all-uppercase (common resume style).
  const sections = [];
  let current = { heading: '', bullets: [] };
  for (const raw of allLines) {
    const line = raw.replace(/^[•●▪·\-–—*]\s*/, '').trim();
    if (!line) continue;
    if (SECTION_RE.test(line) || isShortUppercaseHeading(line)) {
      if (current.bullets.length || current.heading) sections.push(current);
      current = { heading: titleCase(line), bullets: [] };
    } else {
      current.bullets.push(line);
    }
  }
  if (current.bullets.length || current.heading) sections.push(current);

  // If we didn't detect any sections, keep everything in one bucket.
  if (sections.length === 0 || sections.every((s) => !s.heading)) {
    return [{ heading: '', bullets: allLines }];
  }
  return sections;
}

function isShortUppercaseHeading(line) {
  if (line.length > 40) return false;
  const letters = line.replace(/[^A-Za-z]/g, '');
  if (letters.length < 3) return false;
  return letters === letters.toUpperCase();
}

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── JD keyword extraction ─────────────────────────────────────────────────

function extractJdKeywords(jd) {
  if (!jd || jd.trim().length < 20) return [];

  // Grab tokens + short multi-word phrases. We're deliberately loose —
  // any high-signal noun that shows up multiple times is worth surfacing.
  const clean = jd.toLowerCase().replace(/[^\w\s\-\+.#/]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);

  const counts = new Map();
  for (const t of tokens) {
    if (t.length < 3) continue;
    if (STOP.has(t)) continue;
    if (/^\d+$/.test(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }

  // 2-word phrases that look meaningful (both non-stop-word, not too generic).
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i + 1];
    if (a.length < 3 || b.length < 3) continue;
    if (STOP.has(a) || STOP.has(b)) continue;
    const phrase = `${a} ${b}`;
    counts.set(phrase, (counts.get(phrase) || 0) + 1);
  }

  const ranked = [...counts.entries()]
    .filter(([, n]) => n >= 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 24)
    .map(([t]) => t);

  // Prefer distinctive terms — drop generic verbs / adjectives that survived.
  return ranked.filter((t) => !/^(new|good|great|solid|clear|core|full|part)$/.test(t));
}

function scoreBullet(line, keywordSet) {
  if (!keywordSet.size) return 0;
  const low = line.toLowerCase();
  let score = 0;
  for (const kw of keywordSet) {
    if (kw.includes(' ')) {
      if (low.includes(kw)) score += 2; // phrase match worth more
    } else {
      const re = new RegExp(`\\b${escapeRegex(kw)}\\b`);
      if (re.test(low)) score += 1;
    }
  }
  return score;
}

function findMatches(line, keywordSet) {
  const low = line.toLowerCase();
  const hits = [];
  for (const kw of keywordSet) {
    if (kw.includes(' ')) {
      if (low.includes(kw)) hits.push(kw);
    } else {
      const re = new RegExp(`\\b${escapeRegex(kw)}\\b`);
      if (re.test(low)) hits.push(kw);
    }
  }
  return hits;
}

function highlightMatches(line, keywordSet) {
  if (!keywordSet.size) return escapeHtml(line);
  const kws = [...keywordSet].sort((a, b) => b.length - a.length); // longest first
  let result = escapeHtml(line);
  for (const kw of kws) {
    const pattern = kw.includes(' ')
      ? new RegExp(`(${escapeRegex(kw)})`, 'gi')
      : new RegExp(`\\b(${escapeRegex(kw)})\\b`, 'gi');
    result = result.replace(pattern, '<mark class="tf-mark">$1</mark>');
  }
  return result;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ─── LaTeX emission ────────────────────────────────────────────────────────

function toLatex(rankedSections, name, keywords) {
  const preamble = `% Auto-generated by aakashsethi.github.io/#journey — JobBoating tailor
% Compile: pdflatex resume-tailored.tex
\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage{parskip}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}
\\setlist[itemize]{leftmargin=1.4em,itemsep=1pt,topsep=2pt}
\\pagestyle{empty}
`;

  const header = `\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries ${latexEscape(name)}}\\\\[2pt]
  \\small tailored resume · JobBoating auto-generated
\\end{center}
`;

  const kwLine = keywords.length
    ? `\n% Detected JD keywords: ${keywords.map((k) => k.replace(/[%\\]/g, '')).join(', ')}\n`
    : '';

  const body = rankedSections.map((sec) => {
    const heading = sec.heading || 'Extracted content';
    const items = sec.ranked.map((b) => `  \\item ${latexEscape(b.text)}`).join('\n');
    return `\\section*{${latexEscape(heading)}}\n\\begin{itemize}\n${items}\n\\end{itemize}\n`;
  }).join('\n');

  const footer = `\n\\end{document}\n`;
  return `${preamble}${kwLine}\n${header}\n${body}${footer}`;
}

function latexEscape(s) {
  return String(s)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export { TailorFlow };
