# Aakash Sethi — AI Engineer, Consultant & Mentor (New Jersey, US)

**AI Software Engineer · AWS Certified Solutions Architect Professional · Founder, [Tnufa.ai](https://tnufa.ai)**

I'm Aakash Sethi. I build production AI systems and help teams ship them. Five years across **Vanguard**, **Mercedes-Benz Financial Services**, and **Burpez**. NJDOE-licensed CS educator on the side.

**Available for:**
- AI engineering consulting (LLM apps, RAG pipelines, agentic systems)
- AWS cloud architecture reviews
- Tech career coaching (interview prep, system design, transitions)
- Long-form technical mentorship

**Links:** [aakashsethi.github.io](https://aakashsethi.github.io) · [LinkedIn](https://www.linkedin.com/in/aakash-sethi-007) · [Book a call →](https://aakashsethi.github.io/#contact) · [Read the blog →](https://aakashsethi.github.io/#mylogs)

---

This repository powers [**aakashsethi.github.io**](https://aakashsethi.github.io) — my personal portfolio, blog, and the automated pipeline that publishes long-form AI/engineering writing weekly. Everything below is the design system that produces it.

---

## Sources

| Source | Path | Notes |
|---|---|---|
| Codebase | `MyBlogCash/` (mounted via File System Access API) | A starter Jekyll blog using the default **Minima** theme. No custom branding present — this is a blank-slate scaffold (`_config.yml` still says "Your awesome title"). It tells us the user wants a blog/portfolio surface but provides no existing visual language. |
| User-supplied bio | Project description | "Aakash Sethi. AI-based Software Engineer. Technical Person. Portfolio that describes me and my projects, with a way to collaborate." |

> **Caveat:** Because the codebase is an unbranded scaffold, the visual language here is invented from scratch following the brief (technical, AI-engineer-feeling). Once Aakash provides direction (logo, color preferences, prior work) we can iterate this into something more personal.

---

## Index — what's in this folder

| File / folder | What it is |
|---|---|
| `README.md` | This file — context, content & visual rules. |
| `colors_and_type.css` | All design tokens (colors, type, spacing, radii, shadows, motion) as CSS variables, plus base element styles. **Single source of truth.** |
| `SKILL.md` | Agent-skill manifest so this system can be loaded as a Claude Code skill. |
| `assets/` | Logo marks, icons, illustrations, font files (when local). |
| `fonts/` | (Empty) — fonts are loaded from Google Fonts; see "Font substitution" below. |
| `preview/` | One small HTML card per concept (colors, type, components…). These populate the Design System tab. |
| `ui_kits/portfolio/` | The portfolio UI kit — `index.html` is a clickable demo; JSX components are reusable building blocks. |

---

## The brand in one paragraph

Aakash's brand is a **terminal-meets-editorial** personal portfolio. It's warm-paper light mode by default, near-black dark mode for emphasis, with a single confident **signal-amber** accent (`#F5A524`) that does the work everywhere a button, link, or status indicator needs to feel alive. Type pairs **Inter Tight** (UI + display) with **JetBrains Mono** (code, captions, eyebrows, IDs) and **Bookerly** (the editorial reading face — used for longform body and pull quotes / one human moment per page). The system is grid-locked, generously spaced, and avoids decorative gradients — every visual choice should feel like it was made by someone who reads code for a living.

---

## CONTENT FUNDAMENTALS

### Voice

**First-person, present tense, plainspoken.** Aakash speaks as himself: *"I build…"*, *"I'm working on…"*, *"I'm interested in…"*. When addressing the visitor, switch to a direct *you*: *"You can reach me at…"*. Never refer to Aakash in the third person on his own site (except in formal credits / metadata).

### Tone

- **Confident, not boastful.** State the work. Don't qualify with "I think" or "kind of."
- **Technical without jargon-flexing.** It's fine to say *"a transformer-based agent for X"* — it's not fine to write a sentence whose only purpose is to name-drop frameworks.
- **Specific over general.** *"Shipped a search index that runs in 12ms p95"* beats *"worked on performance."*
- **Warm at the edges.** The portfolio's core is precise; the about / contact moments allow a sentence of personality.

### Casing

- **Sentence case** for everything: headings, buttons, nav. Never Title Case.
- `ALL CAPS` is reserved for **eyebrow labels** rendered in mono font with `0.12em` letter-spacing. Never on body copy or buttons.
- **Lowercase** is allowed for stylistic effect on a single hero word — use sparingly (max once per page).

### "I" vs "you"

- **I** when describing Aakash's work, beliefs, projects, current focus.
- **You** when giving the reader instructions or invitations: *"You can email me, fork this repo, or open an issue."*
- **We** is reserved for collaborator credit on a specific project.

### Examples — the right vibe

> ✅ "I'm Aakash. I build AI systems that ship — agents, retrieval pipelines, evals."
>
> ✅ "Currently: making a coding agent fast enough that you forget it's there."
>
> ✅ "Open to collaborating on infra, evals, and weird research demos. Reach out."

### Examples — the wrong vibe

> ❌ "Welcome to my website! 👋 I'm a passionate, results-driven software engineer leveraging cutting-edge AI…"  *(generic, emoji, hype words)*
>
> ❌ "Aakash Sethi is a Software Engineer specializing in…"  *(third-person, on his own site)*
>
> ❌ "Hit me up if you wanna build something cool!!"  *(too casual; multiple exclamations)*

### Emoji policy

**No emoji in product copy.** A single 🟢 / `●` colored dot is fine to indicate live status (e.g. *"Currently: shipping"*), but rendered in CSS, not as an emoji codepoint. Unicode glyphs like `→`, `↗`, `·`, `—`, `/` are encouraged for inline structure.

### Punctuation

- Use **em-dashes** (—) for asides, not parentheses where avoidable.
- Use the **slash** ( / ) to compress related concepts: *"infra / evals / agents"*.
- Use the **right arrow** (→) for nav and CTAs: *"Read post →"*, *"GitHub →"*.
- One sentence per line in headlines. Avoid commas in display type.

---

## VISUAL FOUNDATIONS

### Colors

- **Two backgrounds, ever.** Warm paper (`--ink-50` / `#F6F6F4`) for light mode; near-black (`--ink-950` / `#0A0B0D`) for dark mode. No mid-tone backgrounds, no colored page backgrounds.
- **One accent, used surgically.** `--signal-500` (`#F5A524`, signal-amber) appears on primary buttons, link hover, focus rings, status dots, and the dot of the lowercase `i` in the wordmark. Never as a background fill on large surfaces.
- **Terminal green** (`--term-500`) is reserved for genuine live/online states (e.g. *"Available"* dot). Don't use it for "success" toasts or generic positive states.
- **Imagery vibe:** warm, slightly desaturated, with subtle film grain when used. No bluish stock photography. Prefer code screenshots, terminal captures, schematic diagrams.

### Type

- **Inter Tight** for UI + display. Tight tracking (`-0.02em`) on anything ≥24px.
- **JetBrains Mono** for code, eyebrows, timestamps, file paths, version numbers, IDs. Mono earns its place — it should *feel* like an artifact from the build, not decoration.
- **Bookerly** (Regular, italic for quotes) is the editorial face. Used for longform body copy on the About page and for pull quotes. This is the brand's "human moment" — warm, readable, calm.
- Display type can go very large (88–120px) on a hero. Body never goes below 14px on desktop, 16px on mobile.

### Spacing & layout

- **4px base grid.** Every spacing token is a multiple of 4. No magic numbers.
- **Generous vertical rhythm.** Sections separated by 96–128px on desktop. Cramping kills the brand.
- **Single-column reading.** Long-form content (about, posts) maxes at 640px line width. Project lists can be wider but never more than 1120px.
- **Asymmetric hero layouts.** The home page hero leans left or right — never centered horizontally. Centering reads "default theme."

### Backgrounds

- **Plain solid backgrounds.** No gradients on page surfaces, ever.
- **One allowed exception:** a faint repeating dot-grid (8px spacing, 1px dot, 6% opacity ink) over hero sections in dark mode, evoking a graph-paper / IDE feel. Use the `.bg-dotgrid` utility.
- **Code blocks** are full-width on mobile, contained on desktop, with a subtle 1px ring (no big shadow).
- **No hand-drawn illustrations or marketing-style mascots.** Schematic / wireframe / ASCII-feel only if needed.

### Animation & motion

- **Default duration: 220ms. Default easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out).**
- **Fades and 4–8px translates only.** No bounces, no springs, no scale-up entries.
- Page transitions: instant. Don't animate route changes.
- Hover transitions on links/buttons are ≤120ms (snappy).
- **Reveal-on-scroll** is allowed on the project list — a 200ms staggered fade + 8px rise. Disable when `prefers-reduced-motion`.

### Hover states

- **Links:** color shifts to `--signal-700` (a darker amber), underline thickens from 1px to 2px and `text-decoration-color` becomes the link color.
- **Buttons (primary):** background darkens by ~8% (`--signal-600`), no scale change.
- **Buttons (secondary / ghost):** background fills to `--bg-sunken`.
- **Cards:** the border darkens one step (`--border` → `--border-strong`); no shadow-bloom, no lift.

### Press states

- **All interactive elements:** subtle 1–2% scale-down (`scale(0.98)`) on `:active`, 80ms duration. Never fade opacity for press feedback alone — that reads "disabled."

### Borders

- **1px hairlines, always.** No 2px outlines except focus rings.
- Border colors come from `--border` (resting), `--border-strong` (hover/active), `--hairline` (dividers and very subtle separation).
- **Focus ring:** 2px solid `--signal-500` at `2px` outline-offset on `:focus-visible`. Never just `outline: none`.

### Shadows

- **Three levels max** — `--shadow-1` (rest), `--shadow-2` (raised card / dropdown), `--shadow-3` (modal). Defined as crisp short-distance shadows, not blurry marshmallow.
- **Insets** (`--shadow-inset`) used inside code blocks and inputs to suggest depth without lifting.
- **Cards usually have NO shadow** — they sit on a 1px border. Shadows are reserved for floating UI (menus, tooltips, modals).

### Capsules vs. protection gradients

- **Status pills** use solid translucent fills (e.g. `bg: rgba(245,165,36,0.12)`, `fg: var(--signal-700)`) with 1px matching border. Never gradients.
- **Image overlays:** when text must sit over imagery, use a solid 60% black overlay or a vertical linear-gradient from `rgba(0,0,0,0.7)` at bottom to transparent at top. Never radial.

### Layout rules / fixed elements

- **No sticky nav by default.** The home page header scrolls away with content. (Sticky nav is allowed on long-form blog posts.)
- **Footer is minimal:** name, year, three links (GitHub, email, RSS). One line if possible.
- **Side gutters** scale: 24px (mobile), 48px (tablet), 80px (desktop).

### Transparency & blur

- Used sparingly. The only blur permitted is on the optional sticky-nav backdrop (`backdrop-filter: blur(12px) saturate(180%)`) when sticky nav is active on long pages.
- Translucent fills allowed for status pills (12% accent) and hover overlays on dark imagery.

### Color vibe of imagery

- **Warm, grainy, slightly desaturated.** Code screenshots should use the brand's own dark theme (`--code-bg`) when possible. Avoid stock photography. If using project screenshots, crop tightly — show *the work*, not chrome.
- Black & white is acceptable for portrait photos; tinted cyans / purples are not.

### Corner radii

- **Default `--r-3` (8px)** for buttons, inputs, cards.
- **`--r-2` (4px)** for inline tags / pills with text.
- **`--r-pill` (999px)** for *only* the status dot and avatar.
- Code blocks use `--r-3`. Modals use `--r-4` (12px). No 20px+ "blob" radii.

### Cards

- **1px border, no shadow at rest.** Hover bumps the border to `--border-strong` and nothing else moves.
- Internal padding `--sp-6` (24px) standard, `--sp-8` (32px) for project cards.
- An optional **mono eyebrow** sits above the card title (e.g. `PROJECT · 2025`).
- A subtle **trailing arrow** (`→`) appears bottom-right or after the title on link cards.

---

## ICONOGRAPHY

This system uses **[Lucide](https://lucide.dev)** — a clean, technical, 1.5px-stroke open-source icon set — loaded from CDN. It pairs naturally with Inter Tight: geometric, even-weight, no decorative flourishes.

- **Loading:** `<script src="https://unpkg.com/lucide@latest"></script>` then `<i data-lucide="github"></i>` and `lucide.createIcons()`.
- **Default size:** 16px (inline with body), 20px (buttons), 24px (nav). 1.5px stroke at all sizes.
- **Color:** icons inherit `currentColor`. Never colored-in by default.
- **Usage hierarchy:** icons are functional, not decorative. Every icon has a label or sits beside one. **Never a row of bare icons without text.**

### Glyphs allowed inline

- `→` (right arrow) — the brand's signature CTA glyph. Used in every "Read more →", "GitHub →" link.
- `↗` (top-right arrow) — for external links.
- `·` (middle dot) — separator between metadata items: `2025 · 4 min read`.
- `—` (em-dash) — for asides.
- `/` (slash) — for compressing related concepts in tag lists.

### What we do NOT use

- ❌ No emoji in production copy.
- ❌ No iOS-style "rounded square" icons.
- ❌ No filled / duotone icon styles. Stroke only.
- ❌ No custom hand-drawn SVG illustrations.

> **Caveat — substitution flagged:** No custom icon set was provided in the codebase. We've adopted **Lucide** as the closest match to the technical/precise brand voice. If Aakash has an icon-style preference (e.g. Heroicons, Radix Icons, custom set) we should swap.

---

## Logo / wordmark

The wordmark is **`aakash.sethi`** set in **JetBrains Mono 600**, all lowercase, with a tiny signal-amber dot replacing the `.`. This evokes a file path / namespace — fitting for an engineer's identity. See `assets/wordmark.svg`.

A monogram **`a/s`** (mono, 600wt, 24px) is used as a favicon and in tight UI corners.

---

## Font substitution flag

- **Bookerly Regular** is provided locally at `fonts/Bookerly-Regular.ttf` and served via `@font-face`. Used for longform body + pull quotes.
- **Inter Tight** (UI/display) and **JetBrains Mono** (code/eyebrow) are still loaded from Google Fonts. If you want them self-hosted too, drop `.woff2` files into `fonts/` and update the `@import` block in `colors_and_type.css`.

---

## How to use this system

1. Link `colors_and_type.css` from any HTML file. Tokens are available as CSS variables.
2. Add `data-theme="dark"` to `<html>` for dark mode.
3. Pull components from `ui_kits/portfolio/` for screens / mocks. Each component is a small JSX file you can read and copy.
4. For new pages: start from the eyebrow + display + body type stack, lean on whitespace, restrict yourself to one accent moment per viewport.
