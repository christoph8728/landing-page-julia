# Quick Test - Login Issue Fix

The login flash issue was caused by the Dashboard trying to load content before GitHub credentials were configured. I've fixed this.

## What I Fixed:

1. ✅ **Login issue** - The auth flow now properly stores the token and won't redirect on failed content loads
2. ✅ **Added Teaching section** - New content type available in CMS and site navigation
3. ✅ **Better error handling** - Won't kick you back to login when GitHub isn't configured yet

## Test Without GitHub (CMS Only)

You can now test the CMS login **without** configuring GitHub credentials first!

### 1. Start the Worker (no GitHub needed for login test):

Edit `worker/.dev.vars`:
```env
CMS_PASSWORD=test123
JWT_SECRET=my-test-secret-key-12345678901234567890
GITHUB_TOKEN=placeholder
GITHUB_REPO=placeholder/placeholder
```

Then start it:
```bash
cd worker
npm run dev
```

### 2. Start the CMS:

```bash
cd cms
npm run dev
```

### 3. Test Login:

1. Open: http://localhost:5173
2. Enter password: `test123`
3. You should now see the Dashboard with 5 cards:
   - Posts
   - Publications
   - **Teaching** (new!)
   - Projects
   - News

**Note:** The counts will show 0 or errors until you configure real GitHub credentials, but the login should work!

## Full Test With GitHub

To actually create/edit content, you need real GitHub credentials:

### 1. Create GitHub Token:

1. Go to: https://github.com/settings/tokens/new
2. Click "Generate new token (classic)"
3. Name: "Academic CMS Local Dev"
4. Check: **repo** (all repo permissions)
5. Generate and copy the token

### 2. Update `.dev.vars`:

```bash
nano worker/.dev.vars
```

Change to:
```env
CMS_PASSWORD=test123
JWT_SECRET=my-test-secret-key-12345678901234567890
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_REPO=yourusername/your-repo-name
```

### 3. Restart Worker:

```bash
# Ctrl+C to stop, then:
npm run dev
```

### 4. Test Full Workflow:

1. Login to CMS: http://localhost:5173
2. Click **"Teaching"**
3. Click **"New teaching"**
4. Create a course:
   - Title: "Introduction to History"
   - Date: Today
   - Tags: seminar, history
   - Content: Add course description in markdown
5. Click **"Publish"**
6. Check your GitHub repo - the file should appear at `site/content/teaching/introduction-to-history.md`
7. View on site: http://localhost:1313/teaching/

## Teaching Section Features

The new Teaching section appears:
- In the CMS Dashboard (🎓 icon)
- In site navigation (between Publications and Posts)
- Same markdown editor as Posts
- Perfect for course syllabi, materials, schedules

## Still Having Issues?

If login still flashes:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in
4. Look for error messages
5. Share the error with me

If it says "Invalid password":
- Make sure the password in CMS matches `CMS_PASSWORD` in worker/.dev.vars
- Restart the worker after changing .dev.vars
