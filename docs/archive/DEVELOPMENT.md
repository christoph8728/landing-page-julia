# Development Guide - Academic CMS + Hugo Site

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Setup                        │
└─────────────────────────────────────────────────────────────┘

1. CMS Frontend (React)         http://localhost:5174
   └─> Edits content via UI

2. Worker API (Cloudflare)      http://localhost:8787
   └─> Stores content in memory (DEV_STORAGE)

3. Sync Script                  node sync-from-cms.js
   └─> Pulls content from Worker → writes to site/content/

4. Hugo Static Site             http://localhost:1313
   └─> Builds from site/content/ files

5. User visits site             http://localhost:1313
   └─> Sees published content
```

## How Content Flows

### Editing Content (CMS → Site)

1. **User edits in CMS** (http://localhost:5174)
   - Login with password: `test123`
   - Edit posts, publications, news, projects
   - Click "Speichern" to save

2. **CMS sends to Worker API**
   - PUT `/api/content/:type/:slug`
   - Content stored in Worker's in-memory storage

3. **Run sync script to update site**
   ```bash
   node sync-from-cms.js
   ```
   - Pulls all content from Worker API
   - Writes to `site/content/` files
   - Hugo auto-rebuilds (if server running)

4. **View updated site** (http://localhost:1313)
   - Changes appear immediately

### Optional: Watch Mode

Run sync in watch mode to auto-sync every 5 seconds:

```bash
node sync-from-cms.js --watch
```

This creates a live connection: CMS edits → auto-sync → Hugo rebuilds → site updates

## Running the Full System

### Terminal 1: Worker API
```bash
cd worker
npx wrangler dev
# Runs on http://localhost:8787
```

### Terminal 2: CMS Frontend
```bash
cd cms
npm run dev
# Runs on http://localhost:5174
```

### Terminal 3: Hugo Site
```bash
cd site
hugo server
# Runs on http://localhost:1313
```

### Terminal 4: Auto-sync (Optional)
```bash
node sync-from-cms.js --watch
# Syncs CMS → site every 5 seconds
```

## Initial Setup

### 1. Install Dependencies

```bash
# Worker
cd worker && npm install

# CMS
cd cms && npm install

# Hugo (via Homebrew on Mac)
brew install hugo
```

### 2. Load Existing Content into CMS

```bash
node sync-to-cms.js
```

This loads all existing files from `site/content/` into the CMS for editing.

### 3. Start All Services

See "Running the Full System" above.

## Content Types

### Posts (`site/content/posts/`)
- Blog posts and essays
- Full markdown editor in CMS
- Frontmatter: title, date, tags, draft

### Publications (`site/content/publications/`)
- Academic publications
- Structured form in CMS
- BibTeX import available
- Frontmatter: title, authors, year, type, venue, abstract, doi, pdfUrl

### Projects (`site/content/projects/`)
- Research projects and databases
- Markdown editor in CMS
- Frontmatter: title, date, tags, draft

### News (`site/content/news/`)
- Short updates and announcements
- Markdown editor in CMS
- Frontmatter: title, date, tags, draft

## Profile Data

Profile information is stored in `site/data/profile.yaml`:

- name
- title
- institution
- department
- city
- bio
- photo
- email
- orcid
- google_scholar
- academia
- github

Edit via CMS: **Profil** section

## Development Mode vs Production

### Development (Current Setup)

**Storage:** In-memory (Worker's DEV_STORAGE)
- Content persists while Worker is running
- Lost on Worker restart
- Perfect for local development and testing

**Detected when:**
- `GITHUB_TOKEN=placeholder`
- `GITHUB_REPO=placeholder/placeholder`

**Sync:** Manual via `sync-from-cms.js`

### Production (Future Deployment)

**Storage:** GitHub Contents API
- Content stored as `.md` files in GitHub repository
- Fully persistent
- Version controlled
- Triggers Cloudflare Pages build on push

**Configuration:** Update `.dev.vars` with real credentials:
```
GITHUB_TOKEN=ghp_your_actual_token
GITHUB_REPO=username/repository-name
```

**Deployment:** GitHub → Cloudflare Pages auto-builds Hugo site

## Common Tasks

### Edit a Post
1. Go to CMS → Blog-Beiträge
2. Click "Bearbeiten" on the post
3. Make changes in Milkdown editor
4. Click "Veröffentlichen"
5. Run `node sync-from-cms.js`
6. Refresh http://localhost:1313

### Add a Publication
1. Go to CMS → Publikationen → + Neu
2. Fill in form fields
3. Click "Speichern"
4. Run `node sync-from-cms.js`
5. Refresh http://localhost:1313

### Import BibTeX
1. Go to CMS → Publikationen → ↑ BibTeX importieren
2. Paste BibTeX entries
3. Click "Parse" → review → "Importieren"
4. Run `node sync-from-cms.js`
5. Refresh http://localhost:1313

### Update Profile
1. Go to CMS → Profil
2. Edit YAML directly
3. Click "Speichern"
4. Run `node sync-from-cms.js`
5. Refresh http://localhost:1313 - updated bio/links appear

## File Structure

```
landing-page-julia/
├── cms/                    # React CMS frontend
│   ├── src/
│   │   ├── screens/       # CMS pages
│   │   ├── lib/           # API client, parsers
│   │   └── styles/        # CSS
│   └── package.json
│
├── worker/                 # Cloudflare Worker API
│   ├── src/index.js       # All endpoints + dev storage
│   └── .dev.vars          # Environment variables
│
├── site/                   # Hugo static site
│   ├── content/           # Content files (.md)
│   │   ├── posts/
│   │   ├── publications/
│   │   ├── projects/
│   │   └── news/
│   ├── data/
│   │   └── profile.yaml   # Site owner profile
│   ├── layouts/           # Hugo templates
│   ├── static/            # Static assets
│   │   └── media/         # Uploaded images
│   ├── public/            # Built site (generated)
│   └── hugo.yaml          # Hugo config
│
├── sync-to-cms.js         # Load site → CMS
├── sync-from-cms.js       # Pull CMS → site
└── DEVELOPMENT.md         # This file
```

## URLs

- **CMS:** http://localhost:5174 (login: test123)
- **Worker API:** http://localhost:8787
- **Hugo Site:** http://localhost:1313
- **API Docs:** See worker/src/index.js for all endpoints

## Testing

### Run CMS Tests
```bash
cd cms && npm run test:run
# 21 tests (API, BibTeX, Slugify, Login)
```

### Run Worker Tests
```bash
cd worker && npm run test:run
# 3 tests (Configuration, env vars, content mapping)
```

### Build Hugo Site
```bash
cd site && hugo --gc --minify
# Output: site/public/
```

## Troubleshooting

### CMS shows "Unauthorized"
- Worker not running on port 8787
- Password incorrect (should be `test123`)
- Clear sessionStorage and re-login

### Content not appearing on site
- Run `node sync-from-cms.js` after editing in CMS
- Check Hugo server is running
- Check `site/content/` files were written

### Hugo build errors
- Check frontmatter syntax in `.md` files
- Run `hugo --gc --minify` to see errors
- Check `site/layouts/` templates

### Worker "bad credentials" error
- This is expected with placeholder credentials
- Dev mode uses in-memory storage instead
- For production, add real GitHub token

## Next Steps

When ready to deploy to production:

1. Create GitHub repository for content
2. Get GitHub Personal Access Token (fine-grained, contents read/write)
3. Update `worker/.dev.vars` with real credentials
4. Deploy Worker to Cloudflare Workers
5. Deploy CMS to Cloudflare Pages
6. Deploy site to Cloudflare Pages (auto-builds from GitHub)
7. Configure custom domain

See main README.md for full deployment instructions.
