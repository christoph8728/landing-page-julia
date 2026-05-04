# 🚀 Start Here - Local Testing

Everything is installed! Follow these steps to test locally.

## Step 1: Configure Environment Variables

Edit this file with your GitHub credentials:

```bash
nano worker/.dev.vars
```

Or open it in your editor:

```bash
code worker/.dev.vars
```

**Required values:**

```env
CMS_PASSWORD=test123                          # ← Any password for local testing
JWT_SECRET=my-super-secret-32-char-string     # ← Any random string (32+ chars)
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE              # ← See below how to get this
GITHUB_REPO=yourusername/reponame             # ← Your GitHub repo
```

### How to get a GitHub Token:

1. Go to: https://github.com/settings/tokens/new
2. Click "Generate new token (classic)"
3. Give it a name: "Academic CMS Local Dev"
4. Select scopes: Check **repo** (full control of private repositories)
5. Click "Generate token" at the bottom
6. Copy the token (starts with `ghp_`) and paste into `.dev.vars`

**IMPORTANT:** The token will only be shown once! Save it somewhere safe.

## Step 2: Start the Services

Open **3 separate terminal windows** and run these commands:

### Terminal 1 - Worker (API)

```bash
cd /Users/christoph/dev/landing-page-julia/worker
npm run dev
```

Wait for: `Ready on http://localhost:8787`

### Terminal 2 - CMS Frontend

```bash
cd /Users/christoph/dev/landing-page-julia/cms
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Terminal 3 - Static Site

```bash
cd /Users/christoph/dev/landing-page-julia/site
hugo server
```

Wait for: `Web Server is available at http://localhost:1313/`

## Step 3: Test the CMS

1. **Open CMS:** http://localhost:5173
2. **Login** with your `CMS_PASSWORD` (the one you set in `.dev.vars`)
3. **Click "Posts"** to see existing posts
4. **Click "New post"** to create one:
   - Title: "Test Post"
   - Date: Today's date
   - Tags: test, demo
   - Content: Type some markdown:
     ```markdown
     This is a **test post** with some content.

     ## Heading

     - Bullet point 1
     - Bullet point 2
     ```
5. **Click "Publish"**
6. Go to your GitHub repo and verify the file was created at `site/content/posts/test-post.md`

## Step 4: View the Static Site

1. **Open site:** http://localhost:1313
2. You should see:
   - Julia's profile information
   - Recent posts (including your test post if you published it)
   - Publications
   - Projects

## Common Issues

### "Invalid password" when logging in
- Make sure the password in the CMS matches `CMS_PASSWORD` in `worker/.dev.vars`
- Restart the Worker after changing `.dev.vars`

### "Failed to save" errors in CMS
- Check that `GITHUB_TOKEN` is correct in `worker/.dev.vars`
- Check that `GITHUB_REPO` matches your repo exactly (format: `username/reponame`)
- Make sure the token has `repo` permissions

### Worker won't start - "Missing secret" error
- Make sure `worker/.dev.vars` exists and has all 4 variables filled in

### Site shows no content
- Check that files exist in `site/content/posts/`, `site/content/publications/`, etc.
- Hugo has live reload - if you add files, they should appear automatically

## Stop the Services

Press `Ctrl+C` in each terminal window to stop the services.

## Next Steps

Once local testing works, see:
- **README.md** - How to deploy to Cloudflare
- **LOCAL_DEV.md** - More detailed testing guide
- **sync/README.md** - Set up local sync with Typora/Obsidian

## Need Help?

Check the terminal output for error messages. Most issues are:
1. Wrong GitHub token
2. Wrong repo name format
3. Token doesn't have correct permissions
