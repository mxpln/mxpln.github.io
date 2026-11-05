#!/usr/bin/env python3
"""Static site generator, stdlib only. Reads src/content/*.md, writes dist/."""
import html
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DIST = ROOT / "dist"


def esc(s):
    return html.escape(str(s), quote=True)


def read_md(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n([\s\S]*?)\n---\n?([\s\S]*)$", raw)
    if not m:
        return {}, raw.strip()
    data = {}
    for line in m.group(1).split("\n"):
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip(), v.strip()
        if v.startswith("[") and v.endswith("]"):
            v = [s.strip().strip('"') for s in v[1:-1].split(",") if s.strip()]
        elif v == "true":
            v = True
        elif v == "false":
            v = False
        elif re.fullmatch(r"-?\d+", v):
            v = int(v)
        else:
            v = v.strip('"')
        data[k] = v
    return data, m.group(2).strip()


def parse_dir(d):
    items = []
    for f in sorted(d.glob("*.md")):
        data, body = read_md(f)
        items.append({"slug": f.stem, "data": data, "body": body})
    items.sort(key=lambda x: (x["data"].get("order", 0), x["slug"]))
    return items


def search_text(d):
    parts = [d.get("title", ""), d.get("description", ""), d.get("url", "")]
    tags = d.get("tags", [])
    parts.append(" ".join(tags) if isinstance(tags, list) else str(tags))
    return esc(" ".join(str(p) for p in parts).lower())


def link_row(d, idx=None):
    star = "&#9733;" if d.get("starred") else ""
    first = (
        f'<span class="idx dim">{idx + 1:02d}</span>'
        if idx is not None
        else '<span class="star" aria-hidden="true">&#9733;</span>'
    )
    second = (
        f'<span class="star" aria-hidden="true">{star}</span>'
        if idx is not None
        else ""
    )
    return (
        f'<div class="row" data-gdn-row data-search="{search_text(d)}">\n'
        f'        {first}\n'
        f"        {second}\n"
        f'        <a href="{esc(d.get("url", "#"))}" target="_blank" rel="noopener noreferrer" class="title">{esc(d.get("title", d.get("slug", "")))}</a>\n'
        f'        <span class="dim dash">&#8212;</span>\n'
        f'        <span class="desc">{esc(d.get("description", ""))}</span>\n'
        f"      </div>"
    )


def build():
    sections = parse_dir(SRC / "content" / "sections")
    links = parse_dir(SRC / "content" / "links")

    starred = [l for l in links if l["data"].get("starred")]
    starred_section = ""
    if starred:
        rows = "\n      ".join(link_row(l["data"]) for l in starred)
        starred_section = (
            '    <section class="section-block" data-gdn-section aria-label="Starred">\n'
            '      <h2 class="section-label"><span class="accent">&#9733;</span> <span class="dim">most-used/</span></h2>\n'
            f"      {rows}\n"
            "    </section>\n    "
        )

    section_blocks = []
    for sec in sections:
        sec_links = [l for l in links if l["data"].get("section") == sec["slug"]]
        rows = "\n      ".join(link_row(l["data"], i) for i, l in enumerate(sec_links))
        section_blocks.append(
            f'    <section class="section-block" data-gdn-section aria-label="{esc(sec["data"].get("file", sec["slug"]))}">\n'
            f'      <h2 class="section-label"><span class="path">{esc(sec["data"].get("file", sec["slug"]))}/</span> <span class="count dim">{len(sec_links)}</span></h2>\n'
            f"      {rows}\n"
            f"    </section>"
        )

    template = (SRC / "template.html").read_text(encoding="utf-8")
    page = (
        template.replace("{{STARRED_SECTION}}", starred_section)
        .replace("{{SECTIONS}}", "\n\n".join(section_blocks))
        .replace("{{TOTAL}}", str(len(links)))
    )

    shutil.rmtree(DIST, ignore_errors=True)
    DIST.mkdir(parents=True)
    (DIST / "index.html").write_text(page, encoding="utf-8")
    shutil.copyfile(SRC / "style.css", DIST / "style.css")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Built 1 page — {len(links)} links, {len(sections)} sections -> dist/")


if __name__ == "__main__":
    build()
