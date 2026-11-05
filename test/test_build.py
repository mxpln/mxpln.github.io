import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
LINKS = ROOT / "src" / "content" / "links"


def build():
    subprocess.run(["python", "build.py"], cwd=ROOT, check=True,
                   capture_output=True, text=True)


def link_files():
    return sorted(LINKS.glob("*.md"))


def titles():
    out = []
    for f in link_files():
        m = re.search(r'^title:\s*(.+)$', f.read_text(encoding="utf-8"), re.M)
        out.append(m.group(1).strip().strip('"'))
    return out


class BuildTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        build()
        cls.html = (DIST / "index.html").read_text(encoding="utf-8")

    def test_output_files_exist(self):
        self.assertTrue((DIST / "index.html").exists())
        self.assertTrue((DIST / "style.css").exists())
        self.assertTrue((DIST / ".nojekyll").exists())

    def test_every_link_title_renders(self):
        for t in titles():
            self.assertIn(t, self.html, f"missing title: {t}")

    def test_relative_urls_only(self):
        self.assertNotRegex(self.html, r'href="/')
        self.assertNotRegex(self.html, r'src="/')

    def test_row_count_matches_links_plus_starred(self):
        rows = len(re.findall(r'<div class="row" data-gdn-row', self.html))
        starred = sum(1 for f in link_files()
                      if re.search(r'^starred:\s*true', f.read_text(encoding="utf-8"), re.M))
        self.assertEqual(rows, len(link_files()) + starred)

    def test_deterministic_rebuild(self):
        first = (DIST / "index.html").read_text(encoding="utf-8")
        build()
        second = (DIST / "index.html").read_text(encoding="utf-8")
        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
