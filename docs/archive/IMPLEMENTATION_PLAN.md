# Implementation Issues & Fix Plan

## CRITICAL ISSUE: Publications Using Wrong Editor

### Problem
Publications are opening in the Milkdown markdown editor instead of the structured form.

### Root Cause
**File: `cms/src/App.jsx` (lines 23-26)**

Current routing:
```javascript
<Route path="/content/publications/new" element={<PrivateRoute><PublicationForm /></PrivateRoute>} />
<Route path="/content/publications/import" element={<PrivateRoute><BibTeXImport /></PrivateRoute>} />
<Route path="/content/:type/new" element={<PrivateRoute><Editor /></PrivateRoute>} />
<Route path="/content/:type/:slug/edit" element={<PrivateRoute><Editor /></PrivateRoute>} />
```

**What happens:**
- ✅ `/content/publications/new` → PublicationForm (CORRECT)
- ✅ `/content/publications/import` → BibTeXImport (CORRECT)
- ❌ `/content/publications/some-slug/edit` → **Editor** (WRONG - should be PublicationForm)

The generic route `/content/:type/:slug/edit` catches publication edits and sends them to the markdown Editor.

### Specification Requirements

**From CLAUDE.md (lines 256-269):**
> #### Publication Form
>
> Structured form — **no markdown editor**. Fields:
> - Title (text)
> - Authors (dynamic list)
> - Date (year only)
> - Publication type (select)
> - Journal / Conference name
> - Abstract (textarea)
> - DOI, PDF URL, Tags
>
> On save, serialize to **frontmatter + empty body**.

**Content Type → Editor Mapping:**

| Content Type   | Editor Component    | File Format                    |
|----------------|---------------------|--------------------------------|
| posts          | Editor (Milkdown)   | Frontmatter + markdown body    |
| projects       | Editor (Milkdown)   | Frontmatter + markdown body    |
| news           | Editor (Milkdown)   | Frontmatter + markdown body    |
| **publications** | **PublicationForm** | **Frontmatter + empty body**   |

---

## Fix Required

### 1. Update Routing (App.jsx)

**Current order (WRONG):**
```javascript
<Route path="/content/publications/new" element={...} />
<Route path="/content/publications/import" element={...} />
<Route path="/content/:type/new" element={...} />              // generic
<Route path="/content/:type/:slug/edit" element={...} />       // generic - catches publications!
```

**Fixed order (CORRECT):**
```javascript
// Publications routes FIRST (more specific)
<Route path="/content/publications/new" element={<PrivateRoute><PublicationForm /></PrivateRoute>} />
<Route path="/content/publications/:slug/edit" element={<PrivateRoute><PublicationForm /></PrivateRoute>} />
<Route path="/content/publications/import" element={<PrivateRoute><BibTeXImport /></PrivateRoute>} />

// Generic routes LAST (less specific)
<Route path="/content/:type/new" element={<PrivateRoute><Editor /></PrivateRoute>} />
<Route path="/content/:type/:slug/edit" element={<PrivateRoute><Editor /></PrivateRoute>} />
```

React Router matches routes in order. Specific routes must come before generic routes.

---

### 2. Update PublicationForm to Support Editing

**File: `cms/src/screens/PublicationForm.jsx`**

**Current state:** Only supports creating NEW publications

**Required changes:**
1. Check if `slug` param exists in URL → edit mode
2. Load existing publication data from API on mount
3. Parse frontmatter to populate form fields
4. Show "Edit Publication" vs "New Publication" in title
5. Lock slug field (don't regenerate on save)

**Implementation:**
```javascript
import { useParams } from 'react-router-dom'

export default function PublicationForm() {
  const { slug } = useParams()  // undefined for new, present for edit
  const isEditing = Boolean(slug)

  useEffect(() => {
    if (isEditing) {
      loadPublication(slug)
    }
  }, [slug])

  async function loadPublication(slug) {
    const { content } = await api.getContent('publications', slug)
    const { data } = matter(content)

    // Populate form fields from frontmatter
    setTitle(data.title || '')
    setAuthors(data.authors || [''])
    setYear(data.date || new Date().getFullYear())
    setPubType(data.type || 'Journal Article')
    setVenue(data.venue || '')
    setAbstract(data.abstract || '')
    setDoi(data.doi || '')
    setPdfUrl(data.pdfUrl || '')
    setTags(data.tags?.join(', ') || '')
  }

  async function handleSave() {
    // Use existing slug if editing, generate new slug if creating
    const finalSlug = isEditing ? slug : generateSlug()

    const frontmatter = { /* ... */ }
    const markdown = matter.stringify('', frontmatter)

    await api.putContent('publications', finalSlug, markdown)
    navigate('/content/publications')
  }

  return (
    <div className="ctop-t">
      {isEditing ? 'Publikation bearbeiten' : 'Neue Publikation'}
    </div>
  )
}
```

---

## Testing Checklist

After implementing fixes:

- [ ] Navigate to `/content/publications`
- [ ] Click "Bearbeiten" on an existing publication
- [ ] Verify PublicationForm opens (NOT Milkdown editor)
- [ ] Verify all fields populate with existing data
- [ ] Modify a field and save
- [ ] Verify changes persist
- [ ] Click "+ Neu" to create new publication
- [ ] Verify form opens empty
- [ ] Create new publication and verify slug generation

---

## Additional Issues to Address

### Issue 2: Editor.jsx also needs routing awareness

**File: `cms/src/screens/Editor.jsx`**

Currently Editor handles all content types. Should verify it's NOT being used for publications.

**Check:** Does Editor.jsx check the `type` param and redirect publications away?

**Recommended:** Add guard at top of Editor:
```javascript
function Editor() {
  const { type, slug } = useParams()
  const navigate = useNavigate()

  // Publications should never use this editor
  useEffect(() => {
    if (type === 'publications') {
      const path = slug
        ? `/content/publications/${slug}/edit`
        : '/content/publications/new'
      navigate(path, { replace: true })
    }
  }, [type, slug])

  // ... rest of editor
}
```

This provides defense-in-depth if routing order changes.

---

## Summary of Changes Required

| File | Change | Priority |
|------|--------|----------|
| `cms/src/App.jsx` | Add specific route for publication editing BEFORE generic routes | **CRITICAL** |
| `cms/src/screens/PublicationForm.jsx` | Add edit mode support (load existing data, show edit title) | **CRITICAL** |
| `cms/src/screens/Editor.jsx` | Add guard to reject publications | Recommended |

---

## Specification Compliance Check

### CLAUDE.md Requirements

✅ Publications use structured form (not markdown editor)
❌ **Publications can be edited via form** ← CURRENTLY BROKEN
✅ Posts/Projects/News use Milkdown editor
✅ BibTeX import creates publications
✅ Slug generation for publications: `{year}-{author}-{title}`

### DESIGN.md Requirements

✅ CMS uses dark theme with correct colors
✅ Sidebar navigation implemented
✅ Table layout for content lists
⚠️ Need to verify PublicationForm matches design spec for form inputs

---

## Expected Behavior After Fix

1. **Creating publication:** `/content/publications/new` → PublicationForm ✓
2. **Editing publication:** `/content/publications/2023-smith-machine/edit` → PublicationForm ✓
3. **Importing publications:** `/content/publications/import` → BibTeXImport ✓
4. **Creating post:** `/content/posts/new` → Editor with Milkdown ✓
5. **Editing post:** `/content/posts/my-post/edit` → Editor with Milkdown ✓

Publications NEVER see the Milkdown editor at any point in their lifecycle.
