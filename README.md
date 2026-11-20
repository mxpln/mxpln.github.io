# Bookmarks

Une page de liens, écrite en Markdown et générée en un seul fichier HTML statique.

## Écrire

Un fichier `.md` par catégorie dans `content/bookmarks/` (l'ordre d'affichage est le numéro au début du nom : `1-`, `2-`, `10-`… ; sans numéro, la catégorie passe en dernier) :

```md
# 🛠️ dev-tools

- [MDN Web Docs](https://developer.mozilla.org) — La référence du web.
```

## Générer en local (optionnel)

```sh
node build-bookmarks.js          # écrit dist/bookmarks.html
```

Sans dépendance (Node 14+). Options : `--handle mxpln`, `--accent "#a98bff"`, `--glow bright|soft|off`, `--density comfortable|compact`, `--in`, `--out`.

## Publier (GitHub Pages)

Modifie un `.md` puis `git push` sur `main` : l'Action `.github/workflows/deploy.yml` génère la page et la publie, rien d'autre à faire.

Réglage unique : dans le repo, **Settings → Pages → Source : GitHub Actions**.
