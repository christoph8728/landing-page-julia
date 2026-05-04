# Julia Schneidawind — Academic Personal Website

Static Hugo site with browser-based CMS, hosted entirely on GitHub.

## Architecture

```
GitHub repo  ──→  GitHub Actions  ──→  GitHub Pages
   ▲                                    (yourdomain.com)
   │
   │ direct GitHub Contents API calls
   │
Sveltia CMS (yourdomain.com/admin/)  ←  Julia logs in via GitHub OAuth/PAT
```

**Single deploy target.** No Cloudflare. No Worker. No backend service. Content is plain Markdown with YAML frontmatter, committed directly to this repo. The static site rebuilds automatically on every commit via GitHub Actions.

## Repository layout

```
landing-page-julia/
├── .github/workflows/deploy.yml   # Hugo build → GitHub Pages
├── site/                          # Hugo source
│   ├── content/                   # Posts, publications, projects, news, teaching
│   ├── data/profile.yaml          # Profile (name, bio, links, ORCID, …)
│   ├── layouts/                   # Hugo templates
│   └── static/
│       ├── admin/                 # Sveltia CMS — config + loader
│       └── …                      # CSS, JS, images, media
├── scripts/
│   └── import-bibtex.js           # CLI for BibTeX bulk import
├── docs/archive/                  # Old planning docs (historical reference)
├── CLAUDE.md                      # Build context for AI tooling
└── README.md
```

## Prerequisites

- GitHub account
- Hugo extended ≥ 0.160 (`brew install hugo`)
- Node.js ≥ 20 (for the BibTeX CLI; not needed for daily editing)

## One-time setup

### 1. Push this repo to GitHub

```bash
gh repo create <user>/landing-page-julia --private --source=. --push
# or use github.com/new and `git push` manually
```

### 2. Update the Sveltia config to point at your repo

Edit `site/static/admin/config.yml` — change the `backend.repo:` line to `<user>/<repo-name>` and commit/push.

### 3. Enable GitHub Pages

Repo **Settings → Pages → Source: GitHub Actions**. Wait ~60 s for the first workflow run to finish. The site is then live at `https://<user>.github.io/<repo-name>/`.

### 4. Generate a Personal Access Token (for the CMS)

GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained**:
- Repository access: only this repo
- Permissions: **Contents: Read and write**, **Metadata: Read**
- Expiry: 90 days (rotate as needed)

### 5. Log into the CMS

Visit `https://<user>.github.io/<repo-name>/admin/` → paste the PAT → start editing. Saves commit directly to GitHub; the site rebuilds in ~60 s.

### 6. Optional: custom domain

Repo **Settings → Pages → Custom domain**. Add a `CNAME` record at your registrar pointing at `<user>.github.io`. Enable HTTPS once propagated.

### 7. Optional: switch from PAT to GitHub OAuth (recommended for production)

For the production handoff to Julia, register a GitHub OAuth App in her account (free). Then in `site/static/admin/config.yml`:

```yaml
backend:
  name: github
  repo: <user>/<repo>
  branch: main
  auth_type: pkce
  client_id: <oauth-app-client-id>
```

Set the OAuth App's homepage + callback URL to `https://<your-domain>/admin/`. No client secret is stored anywhere — Sveltia uses the PKCE flow.

## Local development

```bash
# Run Hugo locally (auto-reload)
cd site && hugo server

# Bulk import publications from a .bib file
cd scripts && npm install
node scripts/import-bibtex.js path/to/papers.bib
```

The CMS itself doesn't need local installation — it's served as static files from `/admin/` once deployed. To preview it locally, point the `backend.repo:` in `config.yml` at a real repo and use `hugo server`; Sveltia loads from a CDN.

## Daily usage (for the site owner)

1. Open `https://<your-domain>/admin/`
2. (First visit) paste the PAT or sign in with GitHub
3. Pick a collection (Blog, Publikationen, Projekte, Aktuelles, Lehre, Profil)
4. Edit, click **Save**
5. The site rebuilds automatically. Wait ~1 minute, refresh.

## Migration story

Content is plain Markdown + YAML in this repo. There is no proprietary CMS database. To migrate to a different host:
- **Pages alternatives** (Cloudflare Pages, Netlify, Vercel): fork the repo, point at it, done.
- **Self-hosted** (any Linux box): clone the repo, `hugo --minify`, serve `site/public/` with any static webserver.

The CMS (Sveltia) only requires a GitHub repo to function — moving the *site host* doesn't affect editing.
