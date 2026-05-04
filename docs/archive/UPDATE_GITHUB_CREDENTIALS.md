# Updating GitHub Credentials for Production

Currently the system runs in **development mode** with in-memory storage. To switch to **production mode** with persistent GitHub storage, follow these steps:

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `julia-website-content`)
3. Make it **private** (recommended) or public
4. Don't initialize with README (we'll push existing content)
5. Note the repository name: `username/julia-website-content`

## Step 2: Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Fine-grained tokens"**
3. Configure the token:
   - **Token name:** `Julia Website CMS`
   - **Expiration:** 1 year (or custom)
   - **Repository access:** Select "Only select repositories" → choose your new repo
   - **Permissions:**
     - Repository permissions → **Contents**: Read and write
     - (Optional) Repository permissions → **Metadata**: Read-only
4. Click **"Generate token"**
5. **IMPORTANT:** Copy the token immediately (starts with `github_pat_...` or `ghp_...`)
6. Save it somewhere secure - you won't be able to see it again!

## Step 3: Update Worker Environment Variables

### For Local Development

Edit `worker/.dev.vars`:

```bash
# worker/.dev.vars
CMS_PASSWORD=test123
JWT_SECRET=your-secret-key-min-32-chars
GITHUB_TOKEN=github_pat_YOUR_ACTUAL_TOKEN_HERE
GITHUB_REPO=username/julia-website-content
```

**Replace:**
- `github_pat_YOUR_ACTUAL_TOKEN_HERE` with your actual token
- `username/julia-website-content` with your repository name

**After saving:** Restart the Worker:
```bash
# Kill current Worker (Ctrl+C in that terminal)
# Then restart:
cd worker
npx wrangler dev
```

### For Production (Cloudflare Workers)

When deploying to Cloudflare Workers, set secrets via command line:

```bash
cd worker

# Set CMS password
npx wrangler secret put CMS_PASSWORD
# Enter: your-secure-password

# Set JWT secret
npx wrangler secret put JWT_SECRET
# Enter: a-random-32-character-string

# Set GitHub token
npx wrangler secret put GITHUB_TOKEN
# Enter: github_pat_YOUR_ACTUAL_TOKEN_HERE

# Set GitHub repo
npx wrangler secret put GITHUB_REPO
# Enter: username/julia-website-content
```

**Note:** These secrets are encrypted and stored securely in Cloudflare. They won't appear in your code or git.

## Step 4: Initialize GitHub Repository with Current Content

Once credentials are configured, run this to push current content to GitHub:

```bash
# Make sure Worker is running with new credentials
cd /Users/christoph/dev/landing-page-julia

# Option A: Push from site/ directory to GitHub
cd site
git init
git add content/ data/ layouts/ static/ hugo.yaml
git commit -m "Initial content from CMS"
git branch -M main
git remote add origin https://github.com/username/julia-website-content.git
git push -u origin main

# Then sync to CMS
cd ..
node sync-to-cms.js
```

**OR**

```bash
# Option B: If you want CMS to be the source of truth
# The current dev storage will be written to GitHub on first save
# Just make an edit in the CMS and save - it will create the files in GitHub
```

## Step 5: Verify Production Mode

1. Check Worker console - you should see:
   ```
   [PROD] Fetching from GitHub: site/content/posts/example.md
   ```
   Instead of:
   ```
   [DEV] Saved posts/example.md
   ```

2. Make a test edit in the CMS and save
3. Go to your GitHub repository → Check if the file was created/updated
4. Check the commit history - you should see commits from the CMS

## Step 6: Configure Cloudflare Pages Auto-Deploy

### For the Hugo Site

1. Go to Cloudflare Dashboard → Pages
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your GitHub repository
4. Configure build:
   - **Framework preset:** Hugo
   - **Build command:** `hugo --gc --minify`
   - **Build output directory:** `public`
   - **Root directory:** `site`
   - **Environment variables:**
     - `HUGO_VERSION`: `0.160.1`
5. Click **"Save and Deploy"**

Now every time you save content in the CMS, it:
1. Saves to GitHub (triggers commit)
2. GitHub webhook triggers Cloudflare Pages build
3. Hugo rebuilds the site
4. New version goes live automatically

## Switching Back to Development Mode

If you need to switch back to development mode:

Edit `worker/.dev.vars`:
```bash
GITHUB_TOKEN=placeholder
GITHUB_REPO=placeholder/placeholder
```

Restart the Worker. It will detect placeholders and use in-memory storage again.

## Current vs Production Mode

### Development Mode (Current)
- ✅ Fast - no API calls
- ✅ No GitHub account needed
- ✅ Perfect for local testing
- ❌ Content lost on Worker restart
- ❌ No version history
- ❌ No auto-deploy to live site

### Production Mode (with GitHub)
- ✅ Content persists permanently
- ✅ Full version history (git commits)
- ✅ Auto-deploy to live site
- ✅ Can edit in GitHub directly if needed
- ✅ Easy to back up / clone
- ❌ Slightly slower (API calls to GitHub)
- ❌ Requires GitHub token setup

## Troubleshooting

### "Bad credentials" error

The token is invalid or expired. Generate a new token with correct permissions.

### "Not Found" error

The repository doesn't exist or the token doesn't have access. Double-check:
- Repository name is correct (`username/repo`, not `https://github.com/...`)
- Token has access to that specific repository
- Repository exists and you're the owner

### Files not appearing in GitHub

Check that the Worker is running in production mode:
- `.dev.vars` should have real token (not "placeholder")
- Worker console should show `[PROD]` not `[DEV]`
- Restart Worker after changing `.dev.vars`

### CMS shows old content after switching to GitHub

Run the sync to pull GitHub content into the browser cache:
```bash
node sync-from-cms.js
```

## Security Notes

- **Never commit `.dev.vars`** to git (it's in `.gitignore`)
- **Never commit tokens** to git
- **Use fine-grained tokens** with minimal permissions
- **Rotate tokens** periodically (every 6-12 months)
- **For production:** Use Cloudflare Workers secrets (not `.dev.vars`)
