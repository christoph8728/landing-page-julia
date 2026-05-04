# New Features — Implementation Spec

Seven features to add to the CMS. Read all sections before starting.
Do not modify anything not mentioned here. Work through features in order.

---

## Prerequisites — read first

The CSS design tokens in `cms.css` define the palette. Use them everywhere.
All modals follow the same pattern (see Feature 1). Build Modal once, reuse.
The theme switcher (Feature 6) must be implemented before features that add new UI,
so new components automatically respect the light mode variables.

---

## Feature 1 — Photo Modal (Foto, Foto rechts, Foto-Paar)

**Replace** the three `prompt()` calls in the editor toolbar with a proper modal.
One modal component handles all three photo layout types.

### New component: `src/components/PhotoModal.jsx`

```jsx
// Props:
// - isOpen: boolean
// - layout: 'full' | 'right' | 'pair'
// - onInsert: (markdownString) => void
// - onClose: () => void

// Layout 'full': single image
//   Fields: URL (text input), Caption (text input)
//   "Aus Mediathek" button — opens MediaPicker modal on top (see below)
//   Insert produces: \n\n![{caption}]({url})\n*{caption}*\n\n

// Layout 'right': float-right image
//   Fields: URL, Caption
//   Insert produces:
//   \n\n<figure style="float:right;margin:0 0 1em 1.5em;width:240px">
//   <img src="{url}" alt="{caption}" />
//   <figcaption>{caption}</figcaption>
//   </figure>\n\n

// Layout 'pair': two images side by side
//   Fields: URL 1, Caption 1, URL 2, Caption 2
//   Each URL field has its own "Aus Mediathek" button
//   Insert produces:
//   \n\n<div class="prose-img-pair">
//   <figure><img src="{url1}" alt="{cap1}" /><figcaption>{cap1}</figcaption></figure>
//   <figure><img src="{url2}" alt="{cap2}" /><figcaption>{cap2}</figcaption></figure>
//   </div>\n\n
```

### Modal visual spec

```
Overlay: fixed, full viewport, background rgba(0,0,0,0.6), z-index 500
Card: background var(--s1), border 1px solid var(--bd), border-radius 8px
      max-width 480px, width 90vw, padding 28px
      position fixed, top 50%, left 50%, transform translate(-50%,-50%)

Header row:
  Title (EB Garamond 18px, color var(--ink)) — "Foto einfügen" / "Foto rechts" / "Foto-Paar"
  × close button (top right, btn bghost bxs)

Body:
  For each image slot:
    Label "Bild-URL" (slabel class)
    Row: sinput text field (flex: 1) + "Aus Mediathek" button (btn bsm bghost, margin-left 8px)
    Label "Bildunterschrift" (slabel class)
    sinput text field

  For 'pair': two identical slot groups separated by a thin hr (border: 1px solid var(--bd))

Footer row (margin-top 20px):
  Cancel button (btn bsm bghost) left
  Insert button (btn bsm bteal) right — label "Einfügen"
  Insert is disabled if required URL fields are empty
```

### Media picker integration

"Aus Mediathek" loads a simplified picker: calls `api.listMedia()`, shows a grid of
thumbnails (same grid as MediaLibrary screen), click to select → fills the URL field.
Render the picker as a second layer inside the same modal overlay, not a new modal.

### Integration in Editor.jsx

Replace the three prompt()-based buttons:

```jsx
const [photoModal, setPhotoModal] = useState(null) // null | 'full' | 'right' | 'pair'

// Toolbar buttons:
<button className="tb tb-photo" onClick={() => setPhotoModal('full')}>⊞ Foto</button>
<button className="tb tb-photo" onClick={() => setPhotoModal('right')}>⊟ Foto rechts</button>
<button className="tb tb-photo" onClick={() => setPhotoModal('pair')}>⊡ Foto-Paar</button>

// Render modal:
{photoModal && (
  <PhotoModal
    isOpen
    layout={photoModal}
    onClose={() => setPhotoModal(null)}
    onInsert={(md) => {
      onBodyChange(prev => (prev || '') + md)
      onForceRemount()
      setPhotoModal(null)
    }}
  />
)}
```

---

## Feature 2 — Markdown Cheatsheet

A panel that slides in from the right side of the editor, or appears inline below
the toolbar. Not a modal — it must be visible while editing.

### Implementation

Add a `showCheatsheet` boolean state to `MilkdownEditorComponent`.
Toggle button in toolbar: `?` (after the other toolbar buttons, before mode toggle).

```jsx
<button
  className={`tb ${showCheatsheet ? 'tb-active' : ''}`}
  onClick={() => setShowCheatsheet(s => !s)}
  title="Markdown Cheatsheet"
>?</button>
```

When `showCheatsheet` is true, render a panel **below the toolbar, above the editor**:

```
Background: var(--s2)
Border: 1px solid var(--bd)
Border-radius: 6px
Padding: 16px 20px
Margin-bottom: 14px
Font-family: var(--mono)
Font-size: 11px
Line-height: 1.9
Color: var(--ink2)

Title: "Markdown — Kurzreferenz" in Instrument Sans 11px 600, color var(--ink), margin-bottom 10px

Two-column grid (grid-template-columns: 1fr 1fr, gap: 8px 24px):

Left column:               Right column:
# Überschrift 1            **fett**
## Überschrift 2           *kursiv*
### Überschrift 3          `code`
- Listenpunkt              [Link](url)
1. Nummeriert              ![Bild](url)
> Blockzitat               ---  (Trennlinie)

Below grid, full-width in a slightly different color (var(--ink3)):
Code-Block:  ```  (drei Backticks, neue Zeile, Code, neue Zeile, ```)
Foto einfügen:  ⊞ Foto  ⊟ Foto rechts  ⊡ Foto-Paar (Buttons in Toolbar)
```

CSS for cheatsheet:
```css
.ed-cheatsheet { background: var(--s2); border: 1px solid var(--bd); border-radius: 6px; padding: 16px 20px; margin-bottom: 14px; }
.ed-cheatsheet-title { font-family: var(--sans); font-size: 11px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.ed-cheatsheet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-family: var(--mono); font-size: 11px; color: var(--ink2); line-height: 1.9; }
.ed-cheatsheet-note { font-family: var(--mono); font-size: 10.5px; color: var(--ink3); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--bd); line-height: 1.7; }
.tb-active { background: var(--s3); color: var(--ink); }
```

---

## Feature 3 — Link Modal

A proper modal for inserting links, triggered by the 🔗 button in both WYSIWYG and raw toolbars.

### New component: `src/components/LinkModal.jsx`

```jsx
// Props:
// - isOpen: boolean
// - selectedText: string  (pre-fills the label field)
// - onInsert: ({ label, url }) => void
// - onClose: () => void
```

### Visual spec

Same overlay/card pattern as PhotoModal.

```
Title: "Link einfügen" (EB Garamond 18px)

Field 1: "Linktext"
  sinput, value pre-filled with selectedText if available

Field 2: "URL"
  sinput, placeholder "https://..."
  Auto-focus on open

Footer: Cancel (bghost) | Einfügen (bteal, disabled if URL empty)

On insert:
  If label is empty: insert bare URL as markdown — [url](url)
  Otherwise: insert [label](url)
```

### Integration in Editor.jsx

**WYSIWYG mode:** On insert, use Milkdown's command API:
```jsx
import { updateLinkCommand } from '@milkdown/kit/preset/commonmark'
// If updateLinkCommand doesn't exist in v7, fall back to:
// editorInstanceRef.current.action((ctx) => {
//   const view = ctx.get(editorViewCtx)
//   const { from, to } = view.state.selection
//   const schema = view.state.schema
//   const mark = schema.marks.link.create({ href: url })
//   view.dispatch(view.state.tr.addMark(from, to, mark))
// })
```

**Raw mode:** On insert, wrap selected text or insert at cursor:
```jsx
// If textarea has selection: replace with [selectedText](url)
// If no selection: insert [label](url) at cursor
```

**Capture selected text before opening modal:**
```jsx
const [linkModal, setLinkModal] = useState(false)
const [selectedText, setSelectedText] = useState('')

// 🔗 button handler:
function handleLinkButton() {
  if (rawMode) {
    const ta = document.querySelector('.ed-raw-textarea')
    const sel = ta ? ta.value.substring(ta.selectionStart, ta.selectionEnd) : ''
    setSelectedText(sel)
  } else {
    // Get Milkdown selection text
    const selText = editorInstanceRef.current?.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      return view.state.doc.textBetween(
        view.state.selection.from,
        view.state.selection.to
      )
    }) || ''
    setSelectedText(selText)
  }
  setLinkModal(true)
}
```

---

## Feature 4 — Titelbild (Cover Image) in Editor Sidebar

The cover image field in the sidebar must be fully functional.

### Current state
The sidebar has a `.ed-cover-thumb` slot but it shows nothing useful and has no picker.

### Required behaviour

```
Sidebar field "Titelbild":

If cover is set:
  Show thumbnail: div.ed-cover-thumb > img (src=cover, object-fit:cover, 100%×60px)
  Below thumbnail: two buttons side by side
    "Ändern" (btn bxs bghost) — opens PhotoPicker
    "Entfernen" (btn bxs, color var(--red), border-color var(--red)) — clears cover

If cover is not set:
  Show dashed drop zone:
    border: 2px dashed var(--bd), border-radius 4px, height 60px
    centered text: "Kein Titelbild" in DM Mono 10px, color var(--ink4)
  Below: "Bild auswählen" button (btn bxs bghost, full width)
    — opens PhotoPicker

PhotoPicker: same media grid component as in PhotoModal's "Aus Mediathek" picker.
Click selects → sets cover state.
Cover state is stored in frontmatter as `image:` key on save.
```

### State management in EditorScreen

```jsx
const [cover, setCover] = useState('') // URL string or empty

// On loadContent: populate from data.image
// On save: include in frontmatter as image: cover || undefined
```

CSS additions:
```css
.ed-cover-empty { border: 2px dashed var(--bd); border-radius: 4px; height: 60px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; cursor: pointer; transition: border-color .12s; }
.ed-cover-empty:hover { border-color: var(--teal2); }
.ed-cover-empty span { font-family: var(--mono); font-size: 10px; color: var(--ink4); }
.ed-cover-actions { display: flex; gap: 6px; }
.btn-danger-xs { padding: 5px 10px; font-size: 11px; border-radius: 4px; background: transparent; color: var(--red); border: 1px solid var(--red); cursor: pointer; font-family: var(--sans); font-weight: 600; transition: background .12s; }
.btn-danger-xs:hover { background: rgba(139,74,74,.1); }
```

---

## Feature 5 — Sidebar Item Counters

The sidebar nav items for Publikationen, Blog, Aktuelles, Projekte must show
live item counts — same as the dashboard cards, but inline in the sidebar.

### Current state
`Layout.jsx` renders static sidebar items with no counters.

### Implementation

Move item count loading into `Layout.jsx`. Fetch counts on mount, refresh when
navigation changes (use `useLocation` as dependency).

```jsx
// In Layout.jsx:
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api'

const COUNT_TYPES = ['publications', 'posts', 'news', 'projects']

// Inside Layout():
const location = useLocation()
const [counts, setCounts] = useState({})

useEffect(() => {
  COUNT_TYPES.forEach(type => {
    api.listContent(type)
      .then(items => setCounts(c => ({ ...c, [type]: items.length })))
      .catch(() => {})
  })
}, [location.pathname]) // Refresh when navigating — catches new saves
```

Render counts in sidebar items:
```jsx
<Link to="/content/publications" className={...}>
  <div className="sb-pip pip-a"></div>
  Publikationen
  {counts.publications !== undefined && (
    <span className="sb-ct">{counts.publications}</span>
  )}
</Link>

// Same pattern for posts (Blog), news (Aktuelles), projects (Projekte)
// Teaching: do not show counter (not in design)
```

The `.sb-ct` class is already in `cms.css` — no CSS addition needed.

---

## Feature 6 — Light/Dark Mode Switcher

The CMS dark theme is hardcoded. Add a toggle that:
- Defaults to system preference (`prefers-color-scheme`)
- Persists manual override in `localStorage` under key `cms-theme`
- Switches between the existing dark variables and a new light variant

### Light mode CSS variables

Add to `cms.css`, scoped to `[data-theme="light"]` on the `<html>` element:

```css
[data-theme="light"] {
  --s0:  #f0ebe3;
  --s1:  #f7f4ef;
  --s2:  #ede8df;
  --s3:  #e2dbd0;
  --s4:  #d5cfc5;
  --bd:  #d5cfc5;
  --ink:  #1a1714;
  --ink2: #3a3428;
  --ink3: #6e6458;
  --ink4: #9a8e80;
  --teal:  #3d6e5e;
  --teal2: #2a5a4a;
  --amb:   #7a5a30;
  --amb2:  #8b6f47;
  --red:   #7a3a3a;
}
/* Dark is the default (no attribute) — existing :root variables unchanged */
```

### Theme provider: `src/lib/theme.js`

```js
const STORAGE_KEY = 'cms-theme'

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved)
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem(STORAGE_KEY, next)
  return next
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark'
}
```

Call `initTheme()` in `main.jsx` before rendering:
```jsx
import { initTheme } from './lib/theme'
initTheme()
```

### Toggle button in sidebar footer

In `Layout.jsx`, add a theme toggle button next to the avatar:

```jsx
import { toggleTheme, getCurrentTheme } from '../lib/theme'

// In Layout():
const [theme, setTheme] = useState(getCurrentTheme())

function handleThemeToggle() {
  const next = toggleTheme()
  setTheme(next)
}
```

```jsx
// In sidebar footer, after the avatar:
<div className="sb-foot">
  <div className="sb-av">JS</div>
  Angemeldet
  <button
    className="theme-toggle"
    onClick={handleThemeToggle}
    title={theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
  >
    {theme === 'dark' ? '☀' : '☾'}
  </button>
</div>
```

CSS:
```css
.theme-toggle { margin-left: auto; background: none; border: 1px solid var(--bd); border-radius: 4px; color: var(--ink3); font-size: 12px; padding: 3px 7px; cursor: pointer; transition: background .12s, color .12s; line-height: 1; }
.theme-toggle:hover { background: var(--s3); color: var(--ink); }
```

---

## Feature 7 — YAML Data Editor

A new CMS screen for editing all `.yaml` files in `site/_data/`.
Accessible via a new sidebar item "Inhalte" or under the existing "Einstellungen" section.

### New route

In `App.jsx`, add:
```jsx
import YamlEditor from './screens/YamlEditor'

// Inside Routes:
<Route path="/data" element={<PrivateRoute><YamlEditor /></PrivateRoute>} />
<Route path="/data/:filename" element={<PrivateRoute><YamlEditor /></PrivateRoute>} />
```

### New sidebar item in Layout.jsx

Under "Einstellungen", add before or after "Profil":
```jsx
<Link to="/data" className={`sb-item ${isActive('/data') ? 'on' : ''}`}>
  <div className="sb-pip"></div>Website-Texte
</Link>
```

### New screen: `src/screens/YamlEditor.jsx`

```jsx
// Behaviour:
// 1. On mount: call GET /api/data to list all .yaml files in site/_data/
//    — add this endpoint to the Worker (see Worker section below)
// 2. Show a file list on the left (or tabs if only a few files)
// 3. Selected file: load content via GET /api/data/:filename
// 4. Display in a <textarea> with DM Mono font — raw YAML
// 5. "Speichern" button: PUT /api/data/:filename with new content
// 6. Show save status (saved / error) after each save
```

### Visual spec

```
Layout: same ctop + two-panel structure as other screens

Left panel (file list, 200px wide, border-right 1px solid var(--bd)):
  Each file as a clickable list item:
    padding: 10px 16px
    font: DM Mono 12px, color var(--ink2)
    active: background var(--s3), color var(--ink)
    filename without path: profile.yaml, navigation.yaml, etc.

Right panel (flex: 1):
  Filename heading (ctop-t style)
  Description hint below heading:
    "Direkte YAML-Bearbeitung. Änderungen werden sofort auf der Website sichtbar."
    font: DM Mono 10px, color var(--ink4), margin-bottom 12px
  Textarea (full remaining height):
    font-family: var(--mono), font-size: 13px, line-height: 1.7
    background: var(--s2), border: 1px solid var(--bd), border-radius: 4px
    padding: 16px, color: var(--ink2)
    min-height: 400px, resize: vertical, outline: none
    focus: border-color var(--teal)
  Footer row: "Speichern" button (bteal) right-aligned
```

CSS additions:
```css
.yaml-shell { display: grid; grid-template-columns: 200px 1fr; height: calc(100vh - 50px); }
.yaml-files { border-right: 1px solid var(--bd); overflow-y: auto; }
.yaml-file-item { padding: 10px 16px; font-family: var(--mono); font-size: 12px; color: var(--ink2); cursor: pointer; transition: background .1s, color .1s; border-bottom: 1px solid var(--bd); }
.yaml-file-item:hover { background: var(--s2); color: var(--ink); }
.yaml-file-item.on { background: var(--s3); color: var(--ink); }
.yaml-main { display: flex; flex-direction: column; padding: 20px 24px; gap: 12px; }
.yaml-hint { font-family: var(--mono); font-size: 10px; color: var(--ink4); line-height: 1.6; }
.yaml-textarea { font-family: var(--mono); font-size: 13px; line-height: 1.7; background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; padding: 16px; color: var(--ink2); resize: vertical; outline: none; transition: border-color .15s; flex: 1; min-height: 400px; width: 100%; }
.yaml-textarea:focus { border-color: var(--teal); }
.yaml-footer { display: flex; justify-content: flex-end; padding-top: 8px; }
```

### New Worker endpoints

Add to `worker/src/index.js`:

```javascript
// GET /api/data — list all .yaml files in site/_data/
app.get('/api/data', jwtMiddleware, async (c) => {
  try {
    const files = await ghGet(c.env, 'site/_data')
    const yamlFiles = files
      .filter(f => f.name.endsWith('.yaml') || f.name.endsWith('.yml'))
      .map(f => ({ name: f.name, sha: f.sha }))
    return c.json(yamlFiles)
  } catch (err) {
    return c.json({ error: err.message }, 500)
  }
})

// GET /api/data/:filename — get a single YAML file
app.get('/api/data/:filename', jwtMiddleware, async (c) => {
  const { filename } = c.req.param()
  if (!filename.endsWith('.yaml') && !filename.endsWith('.yml')) {
    return c.json({ error: 'Only .yaml files allowed' }, 400)
  }
  try {
    const file = await ghGet(c.env, `site/_data/${filename}`)
    const content = decodeURIComponent(escape(atob(file.content.replace(/\n/g, ''))))
    return c.json({ content, sha: file.sha })
  } catch (err) {
    return c.json({ error: err.message }, 500)
  }
})

// PUT /api/data/:filename — update a YAML file
app.put('/api/data/:filename', jwtMiddleware, async (c) => {
  const { filename } = c.req.param()
  if (!filename.endsWith('.yaml') && !filename.endsWith('.yml')) {
    return c.json({ error: 'Only .yaml files allowed' }, 400)
  }
  const { content, sha } = await c.req.json()
  try {
    const result = await ghPut(
      c.env,
      `site/_data/${filename}`,
      content,
      sha,
      `Update data/${filename}`
    )
    return c.json({ ok: true, sha: result.content?.sha })
  } catch (err) {
    return c.json({ error: err.message }, 500)
  }
})
```

Add corresponding API client methods in `src/lib/api.js`:
```javascript
listData: () => req('GET', '/api/data'),
getData: (filename) => req('GET', `/api/data/${filename}`),
putData: (filename, content, sha) => req('PUT', `/api/data/${filename}`, { content, sha }),
```

---

## Shared Modal infrastructure

Since Features 1, 3, and 4 all use modals, extract shared modal styles to `cms.css`:

```css
/* ── MODALS ─────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 500; display: flex; align-items: center; justify-content: center; }
.modal-card { background: var(--s1); border: 1px solid var(--bd); border-radius: 8px; padding: 28px; width: 90vw; max-width: 480px; max-height: 85vh; overflow-y: auto; position: relative; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.modal-title { font-family: var(--serif); font-size: 18px; font-weight: 400; color: var(--ink); }
.modal-close { background: none; border: 1px solid var(--bd); border-radius: 4px; color: var(--ink3); padding: 4px 9px; cursor: pointer; font-size: 14px; line-height: 1; transition: background .12s; }
.modal-close:hover { background: var(--s3); color: var(--ink); }
.modal-body { display: flex; flex-direction: column; gap: 14px; }
.modal-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--bd); }
.modal-divider { border: none; border-top: 1px solid var(--bd); margin: 16px 0; }

/* Media picker (shared between PhotoModal and CoverImage) */
.media-picker-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 280px; overflow-y: auto; margin-top: 12px; }
.media-picker-item { border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: border-color .12s; }
.media-picker-item:hover { border-color: var(--teal); }
.media-picker-item.sel { border-color: var(--teal); }
.media-picker-thumb { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; background: var(--s3); }
.media-picker-name { padding: 4px 6px; font-family: var(--mono); font-size: 9px; color: var(--ink4); background: var(--s2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```

### Shared `MediaPicker` sub-component

Create `src/components/MediaPicker.jsx`:

```jsx
// Props:
// - onSelect: (url: string, name: string) => void
// - onClose: () => void (optional — render inline if null)

// Behaviour:
// - Calls api.listMedia() on mount
// - Shows loading state while fetching
// - Renders media-picker-grid of thumbnails
// - Click → calls onSelect(file.url, file.name)
// - If api.listMedia() returns empty: show "Keine Bilder. Zuerst Bilder hochladen."
```

---

## Implementation order

1. `cms.css` — add modal styles and Feature 6 light-mode variables and theme-toggle
2. `src/lib/theme.js` — theme provider
3. `main.jsx` — call `initTheme()` on startup
4. `Layout.jsx` — add theme toggle button + sidebar counters (Features 5 + 6)
5. `worker/src/index.js` — add `/api/data` endpoints (Feature 7)
6. `src/lib/api.js` — add `listData`, `getData`, `putData`
7. `src/components/MediaPicker.jsx` — shared media grid (used by Features 1, 4)
8. `src/components/PhotoModal.jsx` — photo layout modal (Feature 1)
9. `src/components/LinkModal.jsx` — link modal (Feature 3)
10. `src/screens/YamlEditor.jsx` — YAML data editor (Feature 7)
11. `App.jsx` — add `/data` routes
12. `Editor.jsx` — wire up PhotoModal, LinkModal, cover image, cheatsheet (Features 1–4)

---

## Verification checklist

**Photo Modal (Feature 1):**
- [ ] ⊞ Foto button opens styled modal (not browser prompt)
- [ ] "Aus Mediathek" loads thumbnail grid inside modal
- [ ] Selecting from grid fills URL field
- [ ] ⊟ Foto rechts inserts float-right HTML figure
- [ ] ⊡ Foto-Paar shows two URL+caption field groups
- [ ] Einfügen button disabled when URL is empty
- [ ] Modal dismisses on ×, Cancel, and after successful insert

**Cheatsheet (Feature 2):**
- [ ] ? button toggles cheatsheet panel (not modal)
- [ ] Panel visible while editing — does not block editor
- [ ] Two-column layout, DM Mono font, correct dark/light colours

**Link Modal (Feature 3):**
- [ ] 🔗 button opens modal
- [ ] Selected text pre-fills label field
- [ ] URL field auto-focuses
- [ ] Insert disabled when URL is empty
- [ ] WYSIWYG mode: creates actual link in Milkdown
- [ ] Raw mode: inserts [label](url) at cursor

**Cover Image (Feature 4):**
- [ ] Empty state: dashed zone + "Bild auswählen" button
- [ ] Set state: thumbnail preview + Ändern / Entfernen buttons
- [ ] Media picker grid opens on "Bild auswählen"
- [ ] Cover saved as `image:` in frontmatter
- [ ] Cover loads correctly when editing existing post

**Sidebar counters (Feature 5):**
- [ ] Counts show on page load
- [ ] Counts update after navigating back from an edit

**Light/dark (Feature 6):**
- [ ] CMS defaults to system preference on first visit
- [ ] Toggle button in sidebar footer switches theme
- [ ] Preference persists after page reload
- [ ] All existing screens look correct in light mode
- [ ] New modal components work in both modes

**YAML Editor (Feature 7):**
- [ ] "Website-Texte" appears in sidebar under Einstellungen
- [ ] Lists all .yaml files from site/_data/
- [ ] Selecting a file loads its content into textarea
- [ ] Saves correctly, SHA updates for subsequent saves
- [ ] Worker returns 400 for non-.yaml filenames
