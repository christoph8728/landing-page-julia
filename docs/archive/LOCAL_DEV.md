# Local Development Guide

Test the entire system locally before deploying to Cloudflare.

## Prerequisites

- Node.js 20+
- Hugo 0.128.0 (`brew install hugo`)
- Wrangler CLI (`npm install -g wrangler`)

## Setup

### 1. Install dependencies

```bash
# Worker
cd worker
npm install

# CMS Frontend
cd ../cms
npm install

# Sync script
cd ../sync
npm install
```

### 2. Configure local environment

Create `worker/.dev.vars` (gitignored) with your secrets:

```env
CMS_PASSWORD=your-test-password
JWT_SECRET=any-random-32-character-string-here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO=username/reponame
```

**To create a GitHub token:**
1. Go to https://github.com/settings/tokens/new
2. Select "Fine-grained tokens" (recommended) or "Personal access token (classic)"
3. Give it a name like "Academic CMS Local Dev"
4. For fine-grained: select this repository only
5. Permissions needed: "Contents" → Read and write access
6. Generate token and copy to `.dev.vars`

## Run Locally

Open **3 terminal windows** and run:

### Terminal 1: Worker (API)

```bash
cd worker
npm run dev
```

This starts the Worker at `http://localhost:8787`

You should see:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Terminal 2: CMS Frontend

```bash
cd cms
npm run dev
```

This starts the CMS at `http://localhost:5173`

The Vite proxy will forward `/api/*` requests to the Worker at `localhost:8787`.

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Terminal 3: Hugo Site

```bash
cd site
hugo server
```

This starts the static site at `http://localhost:1313`

You should see:
```
Web Server is available at http://localhost:1313/
```

## Test the System

### 1. Test the CMS

1. Open http://localhost:5173
2. Log in with the password from your `.dev.vars` file
3. You should see the Dashboard with 4 content type cards
4. Try creating a new post:
   - Click "Posts"
   - Click "New post"
   - Fill in title, date, tags
   - Type some markdown in the editor
   - Click "Publish"
5. Check that it was saved to GitHub (go to your repo on GitHub)

### 2. Test the Static Site

1. Open http://localhost:1313
2. You should see the homepage with your profile info
3. Navigate to Publications, Posts, Projects
4. Hugo has live reload - any changes to markdown files will auto-refresh

### 3. Test the Sync Script

Create a test file locally:

```bash
mkdir -p ~/test-content/posts
cat > ~/test-content/posts/test-post.md << 'EOF'
---
title: "Test Post from Local Sync"
date: 2026-04-11
tags: [test]
draft: false
---

This is a test post created locally and synced via the sync script.
EOF
```

Configure the sync script:

```bash
cd sync
cp sync.config.example.json sync.config.json
```

Edit `sync/sync.config.json`:

```json
{
  "localDir": "/Users/yourusername/test-content",
  "githubToken": "ghp_your_github_token_here",
  "githubRepo": "username/reponame",
  "remoteDir": "site/content",
  "contentTypes": ["posts", "publications", "projects", "news"]
}
```

Push the test file:

```bash
node sync.js
```

You should see:
```
→ Fetching remote file list...
  ↑ test-post.md... ok

↑ pushed 1 files, X unchanged
```

Check GitHub to verify the file was pushed to `site/content/posts/test-post.md`.

## Test the Editor Features

### Upload/Download .md files

1. In the CMS, go to Posts → New post
2. Click "↓ Download .md" to download a blank template
3. Edit it in Typora or any text editor
4. Click "↑ Upload .md" to load it back
5. The frontmatter should populate the form fields

### BibTeX Import

1. Go to Publications → Import BibTeX
2. Paste this test entry:

```bibtex
@article{doe2023,
  title={A Test Publication},
  author={Doe, John and Smith, Jane},
  journal={Nature},
  year={2023},
  doi={10.1234/test},
  abstract={This is a test abstract.}
}
```

3. Click "Parse" → should show 1 entry
4. Click "Import 1 publications"
5. Check Publications list - should appear as "2023-doe-a"

## Troubleshooting

### Worker not starting

**Error:** `Missing secret: CMS_PASSWORD`

**Fix:** Make sure `worker/.dev.vars` exists with all required variables.

### CMS can't connect to API

**Error:** Network errors in browser console

**Fix:**
1. Make sure Worker is running on `localhost:8787`
2. Check Vite proxy config in `cms/vite.config.js`
3. Open browser DevTools → Network tab to see failed requests

### Hugo site shows empty data

**Error:** Profile info not showing, no posts/publications

**Fix:**
1. Check `site/_data/profile.yaml` exists and has content
2. Check `site/content/` folders have `.md` files
3. Make sure frontmatter is valid YAML

### Sync script errors

**Error:** `sync.config.json not found`

**Fix:** Copy `sync.config.example.json` to `sync.config.json` and fill in values.

**Error:** `GitHub 403: Rate limited`

**Fix:** You've hit GitHub's API rate limit. Wait an hour or use a different token.

**Error:** `GitHub 404: Not Found`

**Fix:** Check that `githubRepo` in `sync.config.json` matches your repo exactly (e.g., `username/reponame`).

## Clean Up

To stop all services:

1. Press `Ctrl+C` in each terminal window
2. All local dev servers will stop

## Next Steps

Once local testing works:

1. Follow the deployment guide in `README.md`
2. Deploy Worker to Cloudflare Workers
3. Deploy CMS to Cloudflare Pages
4. Deploy site to Cloudflare Pages
5. Configure custom domains

The local `.dev.vars` file is gitignored, so you'll need to set secrets in Cloudflare using `wrangler secret put`.
