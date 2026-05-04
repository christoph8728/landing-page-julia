# Debug Login Flash Issue

Follow these steps to diagnose the problem:

## Step 1: Check Browser Console

1. Open the CMS in your browser
2. **Press F12** (or Cmd+Option+I on Mac) to open Developer Tools
3. Go to the **Console** tab
4. Try logging in with password: `test123`
5. Look for error messages in the console

**What to look for:**
- "Login successful:" - means login worked
- "Failed to load [content-type]:" - means content loading failed (expected with placeholder GitHub)
- "JWT validation failed" - means token is invalid
- Any red error messages

## Step 2: Check Network Tab

1. In Developer Tools, go to the **Network** tab
2. Try logging in again
3. Look for these requests:
   - `POST /api/auth` - should return 200 with a token
   - `GET /api/content/posts` - might fail with placeholder GitHub
   - `GET /api/content/publications` - might fail

**Click on each request to see:**
- Status code (200 = success, 401 = unauthorized, 500 = server error)
- Response body

## Step 3: Check SessionStorage

1. In Developer Tools, go to **Application** tab (or **Storage** in Firefox)
2. Look under **Session Storage** → **http://localhost:5173**
3. You should see: `cms_token` with a value

**If cms_token is missing:**
- Login didn't store the token properly

**If cms_token exists but you still get redirected:**
- Token might be invalid or JWT validation is failing

## Step 4: Test API Directly

Open a new tab and try these URLs:

**Without login (should fail):**
```
http://localhost:8787/api/content/posts
```
Should return: `{"error":"Unauthorized"}`

**Test auth endpoint:**
```
POST http://localhost:8787/api/auth
Body: {"password": "test123"}
```

You can test this with curl:
```bash
curl -X POST http://localhost:8787/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password": "test123"}'
```

Should return something like:
```json
{"token": "eyJhbGc..."}
```

## Step 5: Common Issues & Fixes

### Issue: Worker not running
**Symptom:** Network tab shows "Failed to fetch" or connection refused
**Fix:**
```bash
cd worker
npm run dev
```

### Issue: Wrong password
**Symptom:** Console shows "Invalid password"
**Fix:** Check that password matches `CMS_PASSWORD` in `worker/.dev.vars`

### Issue: Token not stored
**Symptom:** Login succeeds but sessionStorage is empty
**Fix:** Check browser console for errors when storing token

### Issue: Immediate redirect after login
**Symptom:** See Dashboard for a flash, then back to login
**Fix:** This is what we're debugging! Share the console errors with me.

## What to Share With Me

If it still doesn't work, please share:

1. **Console errors** (copy the red error messages)
2. **Network tab screenshot** showing the /api/auth request
3. **SessionStorage contents** (is cms_token there?)
4. **Any error from the Worker terminal** (Terminal 1)

This will help me understand exactly what's failing!
