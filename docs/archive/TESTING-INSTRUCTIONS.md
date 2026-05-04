# Testing Instructions — Login Issue Debug

I've added detailed logging to both the Worker API and CMS frontend to help identify why JWT tokens aren't being accepted.

## Current Status

- ✅ Worker is running on http://localhost:8787
- ✅ CMS frontend should be running on http://localhost:5173
- ✅ Hugo static site running on http://localhost:1313
- ✅ Added debug logging to track token flow

## How to Test

### Step 1: Open Browser DevTools

1. Open CMS in browser: http://localhost:5173
2. Press **F12** (or Cmd+Option+I on Mac) to open DevTools
3. Go to the **Console** tab
4. Keep it open during login

### Step 2: Clear Previous Session

1. In DevTools Console, run:
   ```javascript
   sessionStorage.clear()
   ```
2. Refresh the page (you should see login screen)

### Step 3: Attempt Login

1. Enter password: `test123`
2. Click "Log in"
3. **Watch both the browser console AND Terminal 1 (Worker logs)**

### What You Should See

**In Browser Console (Terminal 2 - CMS):**
```
API request to /api/auth
Token from sessionStorage: NONE
Response from /api/auth: 200 OK
Storing token in sessionStorage: eyJhbGciOiJIUzI1Ni...
Token stored. Verifying: SUCCESS
Login successful: {token: "..."}
API request to /api/content/posts
Token from sessionStorage: eyJhbGciOiJIUzI1Ni...
Response from /api/content/posts: 200 OK (or 401 if still failing)
```

**In Worker Terminal (Terminal 1):**
```
Generated token: eyJhbGciOiJIUzI1Ni...
[wrangler:inf] POST /api/auth 200 OK
JWT middleware - Auth header: Bearer eyJhbGciOiJIUzI1...
JWT middleware - Token validated successfully (or error message if failing)
[wrangler:inf] GET /api/content/posts 200 OK (or 401 if still failing)
```

### What I Need From You

Please copy and paste:

1. **Full browser console output** after login attempt
2. **Full Worker terminal output** (Terminal 1) after login attempt
3. **SessionStorage contents**: In DevTools, go to Application tab → Session Storage → http://localhost:5173 → screenshot or copy the `cms_token` value

### Common Scenarios

**Scenario A: Token not being stored**
- Browser console shows: `Token stored. Verifying: FAILED`
- **Fix**: SessionStorage issue in browser

**Scenario B: Token not being sent**
- Browser console shows: `Token from sessionStorage: NONE` on content requests
- Worker logs don't show: `JWT middleware - Auth header: Bearer...`
- **Fix**: Token retrieval issue

**Scenario C: Token being rejected**
- Worker logs show: `JWT middleware - Auth header: Bearer...`
- Worker logs show: `JWT validation error: [error details]`
- **Fix**: JWT secret mismatch or token format issue

**Scenario D: Authorization header missing**
- Worker logs show: `JWT middleware - No valid Authorization header`
- **Fix**: Token not being attached to requests

## Next Steps

Once you've tested and gathered the logs, share them with me and I'll identify the exact issue and fix it.

## Quick Reset

If you need to start fresh:
```bash
# In browser console:
sessionStorage.clear()

# Refresh page
```
