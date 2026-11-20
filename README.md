# Bookmarks

A page of links, written in Markdown and generated as a single static HTML file.

## Writing

One `.md` file per category in `content/bookmarks/` (display order is determined by the number at the beginning of the filename: `1-`, `2-`, `10-`…; categories without a number appear last):

```md
# 🛠️ dev-tools

- [MDN Web Docs](https://developer.mozilla.org) — The web reference.
```

## Generate locally (optional)

```sh
node build-bookmarks.js          # writes dist/bookmarks.html
```

No dependencies (Node 14+). Options: `--handle mxpln`, `--accent "#a98bff"`, `--glow bright|soft|off`, `--density comfortable|compact`, `--in`, `--out`.

## Publish (GitHub Pages)

Edit a `.md` file and then `git push` to `main`: the `.github/workflows/deploy.yml` Action generates and publishes the page—nothing else to do.

One-time setup: in the repository, **Settings → Pages → Source: GitHub Actions**.

## Manage bookmarks

Run the interactive manager from the repository root:

```sh
node add-bookmark.js
```

The menu lets you add, edit, or delete links, as well as add, rename, or delete categories. Changes require confirmation with `y` or `yes`.
