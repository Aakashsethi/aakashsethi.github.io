import React from 'react';
import { useEffect, useRef, useState } from 'react';

// Client-side PDF → LaTeX resume conversion. Loads pdf.js from a CDN
// on demand, extracts every text run, then wraps the raw text into a
// clean editorial LaTeX resume template. The user copies or downloads
// the .tex — no server round-trip, no PDF ever leaves the browser.

const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.mjs';

function PdfToLatex() {
  const [status, setStatus] = useState('idle'); // idle | loading-lib | extracting | done | error
  const [error, setError] = useState(null);
  const [rawText, setRawText] = useState('');
  const [tex, setTex] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);
  const pdfjsRef = useRef(null);

  useEffect(() => {
    setStatus('loading-lib');
    import(/* @vite-ignore */ PDFJS_URL)
      .then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        pdfjsRef.current = mod;
        setStatus('idle');
      })
      .catch((e) => {
        setStatus('error');
        setError(`Could not load pdf.js: ${e.message}`);
      });
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!pdfjsRef.current) {
      setStatus('error');
      setError('PDF library still loading, retry in a second.');
      return;
    }
    setStatus('extracting');
    setError(null);
    setRawText('');
    setTex('');
    setCopied(false);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsRef.current.getDocument({ data: buf }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((it) => ('str' in it ? it.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pages.push(text);
      }
      const joined = pages.join('\n\n');
      setRawText(joined);
      setTex(toLatex(joined, file.name.replace(/\.pdf$/i, '')));
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(`Could not read PDF: ${err.message}`);
    }
  };

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
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="jb-pdf">
      <header className="jb-panel-head">
        <h2 className="jb-h2">PDF → LaTeX resume</h2>
        <p className="jb-copy">
          Drop a resume PDF. The browser extracts every text run with pdf.js and wraps it into a
          clean LaTeX template that JobBoating's tailoring pipeline can rewrite. Nothing is uploaded
          — the PDF stays in your tab.
        </p>
      </header>

      <div className="jb-drop">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={onFile}
          className="jb-file-input"
          id="jb-pdf-file"
        />
        <label htmlFor="jb-pdf-file" className="jb-drop-label">
          {status === 'loading-lib' && 'Loading PDF engine…'}
          {status === 'extracting' && 'Extracting…'}
          {(status === 'idle' || status === 'done' || status === 'error') && 'Choose a PDF resume'}
        </label>
        {rawText && (
          <p className="jb-mono jb-muted">
            {rawText.length.toLocaleString()} chars extracted from your resume
          </p>
        )}
      </div>

      {error && <p className="jb-error">Error: {error}</p>}

      {status === 'done' && tex && (
        <div className="jb-result">
          <div className="jb-result-head">
            <h3 className="jb-h3">Your LaTeX resume</h3>
            <div className="jb-result-actions">
              <button type="button" className="jb-btn ghost" onClick={copyTex}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
              <button type="button" className="jb-btn primary" onClick={downloadTex}>
                Download resume.tex
              </button>
            </div>
          </div>
          <pre className="jb-code">{tex}</pre>
        </div>
      )}
    </div>
  );
}

// Wrap raw resume text in a minimal, tex-clean LaTeX skeleton. Uses
// article class + hyperref so it compiles anywhere without exotic
// packages. The user edits the sections into shape after — the point
// is a working starter, not a final layout.
function toLatex(text, name) {
  const safe = latexEscape(text);
  const heading = latexEscape(name || 'Resume');
  return `% Auto-generated by aakashsethi.github.io/#journey — PDF → LaTeX converter
% Compile: pdflatex resume.tex
\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage{parskip}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries ${heading}}\\\\[2pt]
  \\small extracted resume · edit sections below
\\end{center}

\\section*{Extracted content}
${safe}

% ---- Suggested section headers below. Move the text above into these. ----
% \\section*{Summary}
% \\section*{Experience}
% \\section*{Education}
% \\section*{Skills}
% \\section*{Projects}

\\end{document}
`;
}

function latexEscape(s) {
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

export { PdfToLatex };
