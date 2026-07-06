#!/usr/bin/env python3
"""
Match assets/posts/*.png files to _posts/*.md front matter.
Adds cover_image / cover_image_alt / cover_image_width / cover_image_height
YAML fields to any post that doesn't already declare them.

Usage:
  python3 scripts/wire_post_images.py           # apply changes
  python3 scripts/wire_post_images.py --dry-run # preview only
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "_posts"
IMAGES = ROOT / "assets/posts"

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)

def image_dims(path: Path):
    try:
        from PIL import Image
        with Image.open(path) as im:
            return im.size
    except Exception:
        return (1200, 630)

def match_image(slug: str) -> Path | None:
    # slug: 2026-06-02-agentic-rag-its-...
    candidates = [
        IMAGES / f"{slug}.png",
        IMAGES / f"{slug}.jpg",
        IMAGES / f"{slug}.jpeg",
    ]
    for c in candidates:
        if c.exists():
            return c
    # Fuzzy: some images are truncated (blog title had a longer slug)
    prefix = slug[:60]
    for f in sorted(IMAGES.glob("*.png")):
        if f.stem.startswith(prefix):
            return f
    return None

def update_post(md_path: Path, dry_run: bool):
    text = md_path.read_text(encoding="utf-8")
    m = FM_RE.match(text)
    if not m:
        return "no-frontmatter", None
    fm = m.group(1)
    if re.search(r"^cover_image:", fm, re.MULTILINE):
        return "already-set", None
    slug = md_path.stem
    img = match_image(slug)
    if not img:
        return "no-image", None
    w, h = image_dims(img)
    alt_source = None
    for line in fm.splitlines():
        if line.startswith("title:"):
            alt_source = line.split(":", 1)[1].strip().strip('"').strip("'")
            break
    alt = f"{alt_source} — cover art" if alt_source else "Cover image"
    rel = f"/assets/posts/{img.name}"
    added = (
        f"cover_image: {rel}\n"
        f"cover_image_alt: {alt!r}\n"
        f"cover_image_width: {w}\n"
        f"cover_image_height: {h}\n"
    )
    new_fm = fm.rstrip() + "\n" + added
    new_text = text.replace(m.group(0), f"---\n{new_fm}---\n", 1)
    if not dry_run:
        md_path.write_text(new_text, encoding="utf-8")
    return "wired", rel

def main():
    dry = "--dry-run" in sys.argv
    results = {"wired": [], "already-set": [], "no-image": [], "no-frontmatter": []}
    for md in sorted(POSTS.glob("*.md")):
        status, extra = update_post(md, dry)
        results[status].append((md.name, extra))
    print(f"\n=== wire_post_images.py {'(dry run)' if dry else ''} ===\n")
    for status, entries in results.items():
        print(f"[{status}] {len(entries)}")
        for name, extra in entries:
            suffix = f" -> {extra}" if extra else ""
            print(f"  {name}{suffix}")
    print()

if __name__ == "__main__":
    main()
