# Portfolio UI Kit

The interactive portfolio demo for **Aakash Sethi** — an AI-leaning senior software engineer.
Open `index.html` and click around: tabs route between Home, Work, Education, Culinary, Photography, About, and Contact.

## Components

| File | What it is |
|---|---|
| `App.jsx` | Top-level router and modal host. |
| `Chrome.jsx` | `<Header>` (tab nav + collaborate CTA) and `<Footer>` (mono links). |
| `Hero.jsx` | `<Hero>` (display headline on dark dot-grid) + `<StatStrip>` (4-up status). |
| `Work.jsx` | `<Work>` (filter tabs + grid) and `<ProjectCard>`, `<StatusPill>`. |
| `Education.jsx` | `<Education>` — full NJIT transcript rendered as clickable courses. |
| `Culinary.jsx` | `<Culinary>` — barista/baker side page with recipe grid. |
| `Photography.jsx` | `<Photography>` — masonry of photo placeholders (swap in real `.jpg`s). |
| `About.jsx` | `<About>` — bio + experience timeline + side rail. |
| `Contact.jsx` | `<Contact>` — collaborate form with sent state. |
| `ProjectModal.jsx` | `<ProjectModal>` — bordered overlay with project + course detail. |
| `data.jsx` | `PROJECTS` — every GitHub repo with an intrinsic, descriptive title. |
| `styles.css` | All non-token styles for this kit. |

## Notes

- Photography uses generated gradient placeholders. Drop real JPEGs into `assets/photos/` and update `Photography.jsx` to swap the gradient `div` for `<img>`.
- Education courses link through to `<ProjectModal>` with a "what this turned into" blurb.
- All copy comes from the resume + transcript provided.
