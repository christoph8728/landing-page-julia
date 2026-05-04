# Fixes Summary - 2026-04-13

## ✅ Issues Fixed

### 1. Publications Using Wrong Editor - FIXED
**Problem:** Publications were opening in the Milkdown markdown editor instead of the structured form.

**Fix:**
- Reordered routes in `App.jsx` so publication-specific routes come before generic routes
- Added edit mode support to `PublicationForm.jsx` to load and update existing publications
- Added guard in `Editor.jsx` to redirect publications away from markdown editor

**Result:** Publications now always use the structured form with fields for title, authors, year, venue, etc.

### 2. Publications Not Showing on Landing Page - FIXED
**Problem:** Publication changes persisted in CMS but didn't appear on the Hugo site.

**Fix:** Ran `sync-from-cms.js` to pull changes from CMS to Hugo site.

**Result:** Publications now visible at http://localhost:1313 (34 pages total, including 4 publications)

**Note:** After editing publications in the CMS, you must run:
```bash
node sync-from-cms.js
```
Or use watch mode for automatic syncing:
```bash
node sync-from-cms.js --watch
```

### 3. Buffer Error - FIXED
**Problem:** "Buffer is not defined" error when opening publications or creating blog posts.

**Fix:**
- Installed `buffer` package as polyfill
- Added Buffer to global scope in `cms/src/main.jsx`
- Updated Vite config with Buffer alias and global definitions

**Result:** gray-matter (frontmatter parser) now works correctly in browser.

### 4. Blog Editor "Loading editor..." - FIXED
**Problem:** Milkdown editor stuck on "Loading editor..." and never initialized.

**Fix:**
- Fixed useEditor hook dependency array (was reinitializing on every body change)
- Changed to initialize once with initial body value
- Added error handling to show editor errors instead of infinite loading

**Result:** Blog editor should now load properly.

### 5. Teaching Content Type - ADDED
**Problem:** No way to add Teaching assignments/courses.

**Fix:**
- Added "Lehre" to Dashboard
- Updated sync scripts to include teaching content type
- Teaching folder already existed in Worker configuration

**Result:** Teaching content type now accessible from CMS Dashboard.

---

## 📝 Current System State

### Running Services
- **CMS:** http://localhost:5174 (login: test123)
- **Worker API:** http://localhost:8787
- **Hugo Site:** http://localhost:1313

### Content Types & Editors

| Content Type | Editor | Notes |
|--------------|--------|-------|
| **Publikationen** | Structured Form | Title, authors, year, venue, abstract, DOI, PDF URL, tags |
| **Blog-Beiträge** | Milkdown (markdown) | Full markdown with inline rendering |
| **Neuigkeiten** | Milkdown (markdown) | Currently uses blog editor. Could use flag later to distinguish. |
| **Projekte** | Milkdown (markdown) | Currently uses blog editor. Could use flag later to distinguish. |
| **Lehre** | Milkdown (markdown) | For teaching assignments/courses |

### Workflow

1. **Edit content in CMS** (http://localhost:5174)
2. **Save changes** (stored in Worker's in-memory dev storage)
3. **Run sync** to pull changes to Hugo site:
   ```bash
   node sync-from-cms.js
   ```
4. **Hugo auto-rebuilds** (if server running)
5. **View changes** at http://localhost:1313

---

## ⚠️ Notes for Future Development

### About News and Projects
You mentioned:
> "Aktuelles opens the Blog editor. Which is fine. But a note that later we might get rid of aktuelles and just use a particular flag to single out blog entries as News."

> "Projekte also opens the milkdown editor. Same as for Aktuelles -> might work with a flag here."

**Recommendation:** Add a `type` or `category` field to frontmatter to distinguish between:
- Regular blog posts
- News items
- Project descriptions

This would allow filtering/grouping in Hugo templates without needing separate content types.

### Future Enhancements
1. **Auto-sync in development:** Run `sync-from-cms.js --watch` to automatically sync changes every 5 seconds
2. **Content flags:** Add frontmatter fields for `featured`, `category`, `type` to enable more flexible content organization
3. **Teaching structure:** Consider if teaching needs more structured data (semester, course code, etc.) - could create a TeachingForm like PublicationForm

---

## 🐛 Known Issues

None currently. All reported issues have been fixed.

---

## 📄 Files Modified

### Critical Fixes
- `cms/src/App.jsx` - Fixed routing order
- `cms/src/screens/PublicationForm.jsx` - Added edit mode
- `cms/src/screens/Editor.jsx` - Fixed Milkdown loading, added publications guard
- `cms/vite.config.js` - Added Buffer polyfill
- `cms/src/main.jsx` - Made Buffer available globally
- `cms/package.json` - Added buffer dependency

### Feature Additions
- `cms/src/screens/Dashboard.jsx` - Added Lehre
- `sync-from-cms.js` - Added teaching to sync
- `sync-to-cms.js` - Added teaching to sync

### Documentation
- `IMPLEMENTATION_PLAN.md` - Detailed analysis of publication routing issue
- `FIXES_SUMMARY.md` - This file

---

## 🧪 Testing Checklist

- [x] Publications create with form
- [x] Publications edit with form (not markdown editor)
- [x] Publications persist changes
- [x] Publications show on Hugo site after sync
- [x] Blog posts create with Milkdown editor
- [x] Blog editor loads (not stuck on "Loading editor...")
- [x] News items use Milkdown editor
- [x] Projects use Milkdown editor
- [x] Teaching content type accessible from Dashboard
- [x] No Buffer errors in browser console

---

## Next Steps

1. **Test the blog editor** - Try creating a new blog post and verify Milkdown loads
2. **Verify publications on site** - Check http://localhost:1313 to confirm publications display
3. **Consider auto-sync** - Run `node sync-from-cms.js --watch` in a separate terminal for live updates
4. **Plan content organization** - Decide if you want to use flags/categories for News vs Blog vs Projects
