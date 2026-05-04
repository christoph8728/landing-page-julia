# Academic Personal Website — Build Context

This is a single-author academic site for Dr. Julia Schneidawind (LMU München, deutsch-jüdische Geschichte). It deploys as a single GitHub repo to GitHub Pages, with browser-based content editing via Sveltia CMS.

---

## Architecture

```
GitHub repo
├── site/                          # Hugo static site source (extended ≥ 0.160)
├── site/static/admin/             # Sveltia CMS (config + loader, served at /admin/)
├── scripts/                       # Maintenance CLIs (BibTeX import)
└── .github/workflows/deploy.yml   # Hugo build → GitHub Pages
```

**Single deploy target.** The site at `<host>/`. The CMS at `<host>/admin/`. The content store is the same git repo. No Cloudflare, no Worker, no Netlify, no third-party CMS service.

```
GitHub repo (content)
   ▲                ▼
   │              GitHub Actions  ──→  GitHub Pages (yourdomain.com)
   │
   │ direct GitHub Contents API (browser → GitHub)
   │
Sveltia CMS  ←  Julia logs in at /admin/ via GitHub OAuth (PKCE) or PAT
```

---

## Content schema

All content is plain Markdown with YAML frontmatter. The frontmatter shape is the source of truth — Sveltia's `config.yml` mirrors it, and Hugo templates read from `.Params.<field>`.

### Reserved Hugo fields to AVOID

Hugo treats two frontmatter keys as control fields, **not** as page metadata:
- `type:` — sets the layout lookup key. Use `publication_type:`, `news_type:`, `project_type:`, `course_type:` instead.
- `url:` — overrides the page route. Use `external_url:` for outbound links.

Both have bitten this codebase before — see `_default/single.html` falling back when `type:` was set wrong. Don't re-introduce.

### Collections

| Collection | Folder | Filename pattern | Single layout |
|---|---|---|---|
| posts | `site/content/posts/` | `<slug>.md` | `layouts/posts/single.html` |
| publications | `site/content/publications/` | `<year>-<slug>.md` | `layouts/publications/single.html` |
| projects | `site/content/projects/` | `<slug>.md` | `layouts/projects/single.html` |
| news | `site/content/news/` | `<year>-<month>-<slug>.md` | `layouts/news/single.html` |
| teaching | `site/content/teaching/` | `<slug>.md` | `layouts/teaching/single.html` |

Plus the singleton `site/data/profile.yaml` (read by Hugo as `hugo.Data.profile`).

### Publications frontmatter (canonical)

```yaml
---
title: "..."                            # required
authors: ["First Last", ...]            # required, list
year: 2024                              # required, integer
date: 2024-11-25                        # required, full date for sorting
publication_type: "newspaper"           # required: monograph | edited_volume | article | book_chapter | newspaper | review
bibtex_type: "article"                  # required: article | book | incollection | inbook | inproceedings | phdthesis | mastersthesis | techreport | unpublished | misc
venue: "..."                            # optional — journal/newspaper/publisher
publisher: "..."                        # optional — for monographs
booktitle: "..."                        # optional — for book chapters
editors: [...]                          # optional, list
volume: "..." / number: "..." / pages: "..."  # optional — for journal articles
doi: "10.1093/..."                      # optional
external_url: "https://..."             # optional
language: "en"                          # optional, defaults German
cover_image: "/media/..."               # optional
highlight: true                         # optional — homepage feature
awards: [...]                           # optional, list
isbn: "..."                             # optional
abstract: "..."                         # optional
draft: false                            # required
---
```

### Other collection frontmatter (summarized)

- **Posts**: `title`, `date`, `category`, `image`, `image_caption`, `tags`, `draft`, body
- **Projects**: `title`, `subtitle`, `project_type`, `status` (laufend|abgeschlossen|geplant), `featured`, `collaborators`, `date`, `external_url`, body
- **News**: `title`, `date`, `news_type` (press|interview|review), `outlet`, `author`, `interviewer`, `external_url`
- **Teaching**: `title`, `date`, `semester`, `institution`, `course_type`, `tags`, body

---

## Hugo specifics

- **Version**: extended 0.160.1 (matches CI). Older 0.128 also works.
- **Theme**: hand-rolled in `site/layouts/`. No external Hugo modules.
- **Typography**: EB Garamond (serif, body), Instrument Sans (UI), DM Mono (metadata).
- **Two-column layout**: `.scols` grid.
- **Section labels**: see `partials/section-label.html` — maps English section names to German display labels (posts→Blog, news→Aktuelles, etc.).
- **Publication type labels**: see `partials/pub-type-label.html` — maps enum values to German.
- **BibTeX export**: see `partials/bibtex-entry.html` — generates BibTeX from publication frontmatter on each publication single page.
- **Google Scholar meta**: see `_default/baseof.html` — emits `citation_*` meta tags for indexing.
- **Email obfuscation**: profile stores `email_user` + `email_domain` separately; `static/js/email.js` joins them at runtime so the raw address never appears in static HTML.
- **Print stylesheet**: `static/css/print.css` is loaded with `media="print"` — zero screen cost, gives clean offprint-style output for academics who print pages.

---

## Deployment

```yaml
# .github/workflows/deploy.yml — push to main → Hugo build → GitHub Pages
```

No secrets needed for the build. Sveltia auth happens client-side (PAT or GitHub OAuth PKCE), so no Actions secrets to configure.

After the first push, in repo settings:
1. **Settings → Pages → Source: GitHub Actions**
2. **(Optional) Settings → Pages → Custom domain** — add domain + DNS CNAME

## Editing workflow

For Julia (non-technical):
1. Open `<your-domain>/admin/`
2. Sign in (PAT or GitHub OAuth)
3. Edit, save → automatic commit → automatic rebuild → live in ~1 minute

For Christoph (or anyone with a clone):
- Edit Markdown directly in your editor of choice → `git push`
- Or run `node scripts/import-bibtex.js paper.bib` to bulk-import publications (writes locally, you commit)

---

## Constraints (non-negotiables)

- **Plain Markdown is the canonical format.** Every content file is `.md` with YAML frontmatter. No database, no JSON store, no proprietary format.
- **No external services beyond GitHub.** Migrating off GitHub means cloning the repo and pointing any static host at `site/public/`.
- **No reserved Hugo frontmatter** (`type:`, `url:`). Always use the namespaced variants.
- **Email is split + JS-joined.** Never put `email:` plaintext in profile.yaml.
- **Slugs are immutable.** Renaming a content file breaks links. Sveltia keeps the slug stable on edits — only set it on creation.
- **German umlaut handling in slugs**: ä→ae, ö→oe, ü→ue, ß→ss. See `scripts/import-bibtex.js` for the canonical implementation.

---

## Sveltia CMS notes

- Config: `site/static/admin/config.yml`. Edit-and-commit; no rebuild needed (Sveltia is a static SPA, picks up the new config on next page load).
- Auth modes:
  - `auth_type: pat` — paste a fine-grained PAT in the login form (testing, single dev).
  - `auth_type: pkce` — needs a GitHub OAuth App; user clicks "Sign in with GitHub" (production for Julia).
- Repo: `backend.repo:` must match the GitHub repo path (`<owner>/<name>`). Update after every repo move.
- Slug templates: per-collection `slug:` decides filename. Publications use `{{year}}-{{slug}}`, news uses `{{year}}-{{month}}-{{slug}}`.

---

## What's NOT here (intentionally removed)

The architecture went through earlier iterations. Previous versions had:
- A custom React CMS (replaced by Sveltia)
- A Cloudflare Worker (replaced by Sveltia's direct GitHub API calls)
- A local sync script for offline editing in Typora (dropped — CMS handles editing)
- Cloudflare Pages hosting (replaced by GitHub Pages)

Old planning docs are preserved under `docs/archive/` for historical reference. They describe the *previous* architecture and should not be used as build guidance.
