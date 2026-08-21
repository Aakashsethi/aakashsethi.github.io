#!/usr/bin/env node
// After `astro build`, flatten blog-post outputs from
//   dist/{category}/{yyyy}/{mm}/{dd}/{slug}/index.html
// to
//   dist/{category}/{yyyy}/{mm}/{dd}/{slug}.html
// so the URLs match the legacy Jekyll permalinks that existing inbound links,
// search index, and RSS subscribers depend on.

import { readdir, rename, rmdir, stat, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full);
    }
  }
  // Post-order: after descending, check whether this dir matches the pattern.
  const rel = dir.slice(DIST.length);
  if (matchesPostDir(rel)) {
    await flatten(dir);
  }
}

// Match `{category}/{yyyy}/{mm}/{dd}/{slug}` or `{yyyy}/{mm}/{dd}/{slug}`.
// The slug dir contains an index.html we want to lift up as `slug.html`.
function matchesPostDir(rel) {
  return /(^|\/)(\d{4})\/(\d{2})\/(\d{2})\/[^/]+$/.test(rel);
}

async function flatten(dir) {
  const indexPath = join(dir, 'index.html');
  try { await access(indexPath, constants.F_OK); } catch { return; }
  const parent = dirname(dir);
  const slug = dir.slice(parent.length + 1);
  const target = join(parent, `${slug}.html`);
  await rename(indexPath, target);
  // Best-effort cleanup: if the slug dir is now empty, remove it. Any
  // sub-assets Astro emitted alongside the page stay untouched.
  try {
    const leftovers = await readdir(dir);
    if (leftovers.length === 0) await rmdir(dir);
  } catch {}
  console.log(`flatten: ${slug}/index.html → ${slug}.html`);
}

try {
  await stat(DIST);
} catch {
  console.error(`finalize-post-urls: ${DIST} not found; run astro build first.`);
  process.exit(1);
}
await walk(DIST);
