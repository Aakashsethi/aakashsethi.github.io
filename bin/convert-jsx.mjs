#!/usr/bin/env node
// Convert legacy browser-global JSX to ES modules for Astro/Vite. Idempotent.
import fs from 'node:fs';
import path from 'node:path';

const DIR = new URL('../src/components/', import.meta.url).pathname;
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jsx'));

// Pass 1: figure out which component names are exported from which file.
const nameToFile = {};
for (const f of files) {
  const body = fs.readFileSync(path.join(DIR, f), 'utf8');
  const rx = /window\.(\w+)\s*=\s*\1\b/g;
  let m;
  while ((m = rx.exec(body))) nameToFile[m[1]] = f;
  // Also capture PROJECTS-style non-component data
  const rx2 = /window\.(\w+)\s*=\s*(\w+)\s*;/g;
  while ((m = rx2.exec(body))) nameToFile[m[1]] = f;
}

// Hook names Vite needs; anything referenced but not defined gets imported from React.
const REACT_HOOKS = new Set([
  'useState','useEffect','useCallback','useMemo','useRef','useReducer','useLayoutEffect'
]);

for (const f of files) {
  const p = path.join(DIR, f);
  let body = fs.readFileSync(p, 'utf8');
  const original = body;

  // Strip the `/* global ... */` header comment.
  body = body.replace(/^\s*\/\*\s*global\s+[^*]+\*\/\s*\n?/m, '');

  // Strip `const { useState, ... } = React;` (with any hooks list).
  body = body.replace(/^\s*const\s*\{\s*[\w\s,:_]+\s*\}\s*=\s*React\s*;\s*\n/gm, '');

  // Detect which hooks + component refs the file actually uses.
  const usedHooks = new Set();
  for (const h of REACT_HOOKS) {
    const re = new RegExp(`\\b${h}\\b`);
    if (re.test(body)) usedHooks.add(h);
  }
  // Also catch aliased hooks like `useState: _useX`
  const aliasHooks = [...body.matchAll(/const\s*\{\s*([^}]+)\s*\}\s*=\s*React\s*;?/g)];
  // Above already stripped; just also catch any `React.useX` calls
  const rxReactCall = /React\.(\w+)/g;
  let mR;
  while ((mR = rxReactCall.exec(body))) {
    if (REACT_HOOKS.has(mR[1])) usedHooks.add(mR[1]);
  }

  // Collect the exported names via window.X = Y patterns.
  const exports = [];
  body = body.replace(/^\s*window\.(\w+)\s*=\s*(\w+)\s*;\s*\n?/gm, (_, name, val) => {
    if (name === val) exports.push(name);
    else exports.push(`${val} as ${name}`);
    return '';
  });

  // Figure out which cross-component names this file references but doesn't define.
  const defined = new Set();
  for (const mm of body.matchAll(/\bfunction\s+(\w+)/g)) defined.add(mm[1]);
  for (const mm of body.matchAll(/\bconst\s+(\w+)\s*=/g)) defined.add(mm[1]);
  const needsImport = new Set();
  for (const name of Object.keys(nameToFile)) {
    if (nameToFile[name] === f) continue;
    if (defined.has(name)) continue;
    // Word-boundary match; skip strings/comments loosely by using a simple regex.
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(body)) needsImport.add(name);
  }

  // Build the header.
  const header = [];
  header.push("import React from 'react';");
  if (usedHooks.size) header.push(`import { ${[...usedHooks].sort().join(', ')} } from 'react';`);
  // Group imports by source file.
  const byFile = {};
  for (const name of needsImport) {
    const src = nameToFile[name];
    (byFile[src] = byFile[src] || []).push(name);
  }
  for (const src of Object.keys(byFile).sort()) {
    const bareName = src.replace(/\.jsx$/, '');
    header.push(`import { ${byFile[src].sort().join(', ')} } from './${bareName}.jsx';`);
  }

  // Append the export block.
  let footer = '';
  if (exports.length) footer = `\nexport { ${exports.join(', ')} };\n`;

  // Trim leading blank lines then compose.
  body = body.replace(/^\s+/, '');
  const out = header.join('\n') + '\n\n' + body.trimEnd() + '\n' + footer;

  if (out !== original) {
    fs.writeFileSync(p, out);
    console.log(`converted: ${f}  (exports: ${exports.join(', ') || '(none)'}${needsImport.size ? `; imports: ${[...needsImport].join(', ')}` : ''})`);
  } else {
    console.log(`unchanged: ${f}`);
  }
}
