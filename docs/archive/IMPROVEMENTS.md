# Improvements — Complete Implementation Spec

18 improvements across site and CMS. Read all sections before starting.
Work through them in the numbered order — several have dependencies.

---

## What is already working — do not touch

All existing routing, API client, Worker endpoints, sidebar, dashboard, content CRUD,
BibTeX import, media library, profile editor, CSS tokens and base components.

---

## SECTION A — Site improvements

### A1 — RSS feed (1 line)

In `site/hugo.yaml`, change the outputs section to:

```yaml
outputs:
  home: ['HTML', 'RSS']
  section: ['HTML', 'RSS']
  page: ['HTML']
```

No template changes needed. Hugo generates `/index.xml` and `/posts/index.xml` automatically.

---

### A2 — Open Graph + Twitter Card meta tags

In `site/layouts/_default/baseof.html`, add inside `<head>` after the existing meta tags:

```html
{{/* Open Graph / Social Sharing */}}
<meta property="og:type" content="{{ if .IsHome }}website{{ else }}article{{ end }}">
<meta property="og:site_name" content="{{ .Site.Title }}">
<meta property="og:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} — {{ .Site.Title }}{{ end }}">
<meta property="og:description" content="{{ with .Description }}{{ . }}{{ else }}{{ with .Summary }}{{ . | plainify | truncate 160 }}{{ else }}{{ .Site.Params.description }}{{ end }}{{ end }}">
<meta property="og:url" content="{{ .Permalink }}">
{{ with .Params.image }}<meta property="og:image" content="{{ . | absURL }}">{{ end }}
{{ with .Site.Params.og_image }}<meta property="og:image" content="{{ . | absURL }}">{{ end }}

{{/* Twitter Card */}}
<meta name="twitter:card" content="{{ if .Params.image }}summary_large_image{{ else }}summary{{ end }}">
<meta name="twitter:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }}{{ end }}">
<meta name="twitter:description" content="{{ with .Description }}{{ . }}{{ else }}{{ with .Summary }}{{ . | plainify | truncate 160 }}{{ else }}{{ .Site.Params.description }}{{ end }}{{ end }}">
{{ with .Params.image }}<meta name="twitter:image" content="{{ . | absURL }}">{{ end }}
```

Also add to `site/hugo.yaml` params:
```yaml
params:
  description: 'Historikerin · Deutsch-Jüdische Geschichte · LMU München'
  og_image: '/media/portrait.jpg'  # fallback when page has no image
```

---

### A3 — robots.txt

Create `site/static/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://julia-schneidawind.com/sitemap.xml
```

---

### A4 — Reading time on blog posts

In `site/layouts/posts/single.html`, find the post header section and add reading time:

In the no-hero fallback block (the `pubpage-header` div), add after the date:
```html
<div class="detail-date">
  {{ .Date.Format "2. January 2006" }}
  <span class="detail-readtime">· {{ .ReadingTime }} Min. Lesezeit</span>
</div>
```

In the hero overlay block, add after `bdetail-cap`:
```html
<div class="bdetail-readtime">{{ .ReadingTime }} Min. Lesezeit</div>
```

CSS additions to `site/static/css/main.css`:
```css
.detail-readtime { color: var(--ink4); font-size: 10.5px; }
.bdetail-readtime { font-family: var(--mono); font-size: 9.5px; color: rgba(240,230,210,.45); margin-top: 4px; }
```

---

### A5 — Tags linked to filtered pages

Currently tags render as text. They need to link to `/tags/{tagname}/` which Hugo generates automatically — but the tag list/taxonomy pages have no templates and fall back to the generic unstyled list.

**Create `site/layouts/_default/terms.html`** (the taxonomy index — `/tags/`):

```html
{{ define "main" }}
<div class="pubpage-header">
  <div class="hlabel" style="margin-bottom:14px">Schlagwörter</div>
  <h1 class="pubpage-h">Alle Tags</h1>
</div>
<div class="pubpage-body">
  <div class="tag-cloud">
    {{ range .Data.Terms.ByCount }}
    <a href="{{ .Page.RelPermalink }}" class="tag-cloud-item">
      {{ .Page.Title }}
      <span class="tag-cloud-count">{{ .Count }}</span>
    </a>
    {{ end }}
  </div>
</div>
{{ partial "footer.html" . }}
{{ end }}
```

**Create `site/layouts/_default/taxonomy.html`** (filtered post list — `/tags/exil/`):

```html
{{ define "main" }}
<div class="pubpage-header">
  <div class="hlabel" style="margin-bottom:14px">Tag</div>
  <h1 class="pubpage-h">{{ .Title }}</h1>
  <p class="pubpage-sub">{{ len .Pages }} {{ if eq (len .Pages) 1 }}Beitrag{{ else }}Beiträge{{ end }}</p>
</div>
<div class="pubpage-body">
  {{ range .Pages }}
  <div class="bcard-c" style="padding: 18px 0;">
    <div class="bdate">{{ .Date.Format "Jan 2006" }}</div>
    <div>
      <a href="{{ .RelPermalink }}" class="bc-title-sm" style="text-decoration:none">{{ .Title }}</a>
      {{ with .Summary }}<div class="bc-sum" style="margin-top:3px">{{ . }}</div>{{ end }}
    </div>
  </div>
  {{ end }}
  <div class="back-link-wrap">
    <a href="/tags/" class="back-link">← Alle Schlagwörter</a>
  </div>
</div>
{{ partial "footer.html" . }}
{{ end }}
```

**Make tags clickable** — in `site/layouts/posts/single.html`, change the tag rendering:
```html
{{/* Replace static tag spans with links: */}}
{{ range .Params.tags }}
<a href="/tags/{{ . | urlize }}/" class="tag">{{ . }}</a>
{{ end }}
```

CSS additions to `site/static/css/main.css`:
```css
/* Tags as links */
.tag { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; background: var(--p2); color: var(--acc2); padding: 3px 8px; border-radius: 2px; text-decoration: none; display: inline-block; transition: background .12s, color .12s; }
.tag:hover { background: var(--p3); color: var(--acc); }

/* Tag cloud on /tags/ page */
.tag-cloud { display: flex; flex-wrap: wrap; gap: 10px; padding: 24px 0; }
.tag-cloud-item { font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--ink2); text-decoration: none; display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--p3); border-radius: 4px; transition: border-color .12s, color .12s; }
.tag-cloud-item:hover { border-color: var(--acc2); color: var(--ink); }
.tag-cloud-count { font-family: var(--mono); font-size: 10px; color: var(--ink4); }
```

---

### A6 — Publications client-side filter

In `site/layouts/publications/list.html`, add a filter row after the page header and before the publication groups. Add data attributes to each publication entry for JS filtering.

**Add filter UI** immediately after `<div class="pubpage-body">`:
```html
<div class="pub-filter-row">
  <select class="pub-filter-select" id="pub-year-filter" onchange="filterPubs()">
    <option value="">Alle Jahre</option>
    {{ range $years }}<option value="{{ . }}">{{ . }}</option>{{ end }}
  </select>
  <select class="pub-filter-select" id="pub-type-filter" onchange="filterPubs()">
    <option value="">Alle Typen</option>
    <option value="Monographie">Monographie</option>
    <option value="Aufsatz">Aufsatz</option>
    <option value="Sammelband">Sammelband</option>
    <option value="Rezension">Rezension</option>
    <option value="Preprint">Preprint</option>
  </select>
  <button class="pub-filter-reset" onclick="resetFilter()">Zurücksetzen</button>
</div>
```

**Add data attributes** to each pub entry in the template:
```html
{{/* On pub-e and pub-with-cover divs, add: */}}
data-year="{{ .Date.Format "2006" }}"
data-type="{{ .Params.publication_type }}"
```

Also add `data-year` to each `.yr-label` div:
```html
<div class="yr-label" data-year="{{ $year }}">{{ $year }}</div>
```

**Add filter script** to the bottom of `publications/list.html` before `{{ end }}`:
```html
<script>
function filterPubs() {
  const year = document.getElementById('pub-year-filter').value
  const type = document.getElementById('pub-type-filter').value

  document.querySelectorAll('.pub-e, .pub-with-cover').forEach(el => {
    const matchYear = !year || el.dataset.year === year
    const matchType = !type || el.dataset.type === type
    el.style.display = matchYear && matchType ? '' : 'none'
  })

  // Hide year labels that have no visible children
  document.querySelectorAll('.yr-label').forEach(label => {
    const yr = label.dataset.year
    const siblings = document.querySelectorAll(`[data-year="${yr}"].pub-e, [data-year="${yr}"].pub-with-cover`)
    const anyVisible = Array.from(siblings).some(el => el.style.display !== 'none')
    label.style.display = anyVisible ? '' : 'none'
  })
}

function resetFilter() {
  document.getElementById('pub-year-filter').value = ''
  document.getElementById('pub-type-filter').value = ''
  filterPubs()
}
</script>
```

CSS additions to `site/static/css/main.css`:
```css
.pub-filter-row { display: flex; gap: 10px; align-items: center; margin-bottom: 32px; flex-wrap: wrap; }
.pub-filter-select { font-family: var(--mono); font-size: 12px; color: var(--ink2); background: var(--paper); border: 1px solid var(--p3); border-radius: 4px; padding: 7px 12px; outline: none; cursor: pointer; transition: border-color .12s; appearance: none; -webkit-appearance: none; padding-right: 28px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239a8e80'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
.pub-filter-select:focus { border-color: var(--acc2); }
.pub-filter-reset { font-family: var(--sans); font-size: 12px; color: var(--ink4); background: none; border: 1px solid var(--p3); border-radius: 4px; padding: 7px 12px; cursor: pointer; transition: all .12s; }
.pub-filter-reset:hover { color: var(--ink); border-color: var(--p3); background: var(--p2); }
```

---

### A7 — Teaching section layout

Create `site/layouts/teaching/list.html`:

```html
{{ define "main" }}
<div class="pubpage-header">
  <div class="hlabel" style="margin-bottom:14px">Lehre</div>
  <h1 class="pubpage-h">Lehrveranstaltungen</h1>
</div>
<div class="pubpage-body">
  {{ $courses := .Pages | sort "Params.semester" "desc" }}
  {{ range $courses }}
  <div class="course-entry">
    <div class="course-semester">{{ .Params.semester | default (.Date.Format "WS 2006") }}</div>
    <div>
      <a href="{{ .RelPermalink }}" class="pub-t">{{ .Title }}</a>
      {{ with .Params.type }}<div class="pub-in">{{ . }}</div>{{ end }}
      {{ with .Params.institution }}<div class="pub-m"><span>{{ . }}</span></div>{{ end }}
    </div>
  </div>
  {{ end }}
</div>
{{ partial "footer.html" . }}
{{ end }}
```

CSS additions to `site/static/css/main.css`:
```css
.course-entry { display: grid; grid-template-columns: 120px 1fr; gap: 0 18px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--p3); align-items: start; }
.course-entry:last-child { border-bottom: none; }
.course-semester { font-family: var(--mono); font-size: 10.5px; color: var(--ink4); padding-top: 3px; letter-spacing: .04em; }
```

---

## SECTION B — CMS improvements

### B1 — Unsaved changes warning

In `src/screens/Editor.jsx`, add `isDirty` tracking and `beforeunload` listener.

```jsx
// Add isDirty state:
const [isDirty, setIsDirty] = useState(false)

// Mark dirty when body, title, tags, cover, or date changes:
// Wrap each setter:
function handleBodyChange(newBody) {
  setBody(newBody)
  setIsDirty(true)
}
// Also wrap setTitle, setTags, setCover, setDate similarly — or use a single useEffect:
useEffect(() => {
  if (!loading) setIsDirty(true)
}, [body, title, tags, cover, date])
// Clear isDirty after successful save:
// In handleSave, after api.putContent succeeds: setIsDirty(false)
// Also clear on initial load: setIsDirty(false) at the end of loadContent()

// beforeunload listener:
useEffect(() => {
  const handler = (e) => {
    if (isDirty) {
      e.preventDefault()
      e.returnValue = 'Nicht gespeicherte Änderungen gehen verloren.'
    }
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])

// Also intercept react-router navigation — add to the back button handler:
function handleBack() {
  if (isDirty && !confirm('Nicht gespeicherte Änderungen verwerfen?')) return
  navigate(`/content/${type}`)
}
```

Show a visual dirty indicator in the topbar — a small dot next to the title:
```jsx
<div className="ctop-t">
  {isNew ? 'Neuer Beitrag' : 'Beitrag bearbeiten'}
  {isDirty && <span className="dirty-dot" title="Nicht gespeichert" />}
</div>
```

CSS in `cms.css`:
```css
.dirty-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--amb2); margin-left: 8px; vertical-align: middle; }
```

---

### B2 — Auto-save to localStorage

In `src/screens/Editor.jsx`:

```jsx
const AUTOSAVE_KEY = `cms-autosave-${type}-${slug || 'new'}`

// Auto-save every 30 seconds when dirty:
useEffect(() => {
  if (!isDirty) return
  const interval = setInterval(() => {
    const snapshot = {
      title, body, tags, date, cover, isDraft,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot))
  }, 30000)
  return () => clearInterval(interval)
}, [isDirty, title, body, tags, date, cover, isDraft])

// On mount — check for autosave newer than 5 minutes:
useEffect(() => {
  const saved = localStorage.getItem(AUTOSAVE_KEY)
  if (!saved) return
  try {
    const snap = JSON.parse(saved)
    const age = Date.now() - new Date(snap.savedAt).getTime()
    if (age < 5 * 60 * 1000) { // 5 minutes
      const restore = confirm(
        `Es gibt eine automatisch gespeicherte Version vom ${new Date(snap.savedAt).toLocaleTimeString('de')}. Wiederherstellen?`
      )
      if (restore) {
        setTitle(snap.title || '')
        setBody(snap.body || '')
        setTags(snap.tags || '')
        setDate(snap.date || '')
        setCover(snap.cover || '')
        setIsDraft(snap.isDraft ?? true)
        setEditorKey(k => k + 1)
      }
    }
    localStorage.removeItem(AUTOSAVE_KEY)
  } catch {}
}, []) // Mount only

// Clear autosave after successful manual save:
// In handleSave success block:
localStorage.removeItem(AUTOSAVE_KEY)
```

---

### B3 — Keyboard shortcuts

In `src/screens/Editor.jsx`, add a keyboard shortcut listener:

```jsx
useEffect(() => {
  function handleKey(e) {
    const mod = e.metaKey || e.ctrlKey
    if (!mod) return

    if (e.key === 's') {
      e.preventDefault()
      handleSave(isDraft) // Save with current draft state
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSave(false) // Cmd+Shift+Enter = publish
    }
    if (e.key === 'k') {
      e.preventDefault()
      handleLinkButton() // Cmd+K = open link modal
    }
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [isDraft, isDirty, handleSave, handleLinkButton])
```

Show shortcuts in toolbar tooltips:
```jsx
// On Entwurf button:
title="Entwurf speichern (⌘S)"
// On Veröffentlichen button:
title="Veröffentlichen (⌘⇧↵)"
// On link button:
title="Link einfügen (⌘K)"
```

Show shortcuts in the cheatsheet panel (add a section at bottom):
```
Tastaturkürzel:
  ⌘S — Entwurf speichern
  ⌘⇧↵ — Veröffentlichen
  ⌘K — Link einfügen
```

---

### B4 — Alt text warning on save

In `src/screens/Editor.jsx`, inside `handleSave` before the API call:

```jsx
// Check for images with empty alt text
const emptyAltRegex = /!\[\]\([^)]+\)/g
const emptyAlts = (body || '').match(emptyAltRegex)
if (emptyAlts && emptyAlts.length > 0) {
  const proceed = confirm(
    `${emptyAlts.length} Bild${emptyAlts.length > 1 ? 'er haben' : ' hat'} keinen Alt-Text. Alt-Text verbessert Barrierefreiheit und SEO.\n\nTrotzdem speichern?`
  )
  if (!proceed) return
}
```

---

### B5 — Search / filter in content lists

In `src/screens/ContentList.jsx`, add a search input above the table:

```jsx
const [search, setSearch] = useState('')

// Filter items:
const filtered = items.filter(item =>
  item.slug.toLowerCase().includes(search.toLowerCase())
)

// Render search input in ctop row, between title and action buttons:
<input
  className="content-search"
  type="search"
  placeholder="Suchen…"
  value={search}
  onChange={e => setSearch(e.target.value)}
/>

// Render `filtered` instead of `items` in the table body
```

CSS in `cms.css`:
```css
.content-search { background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; padding: 6px 12px; font-family: var(--mono); font-size: 12px; color: var(--ink); outline: none; transition: border-color .15s; width: 200px; }
.content-search:focus { border-color: var(--teal); }
.content-search::placeholder { color: var(--ink4); }
```

---

### B6 — Relative timestamps in content list

Create `src/lib/reltime.js`:

```js
export function relativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return dateStr

  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (days < 1)   return 'heute'
  if (days < 2)   return 'gestern'
  if (days < 7)   return `vor ${days} Tagen`
  if (days < 14)  return 'vor einer Woche'
  if (days < 30)  return `vor ${Math.floor(days / 7)} Wochen`
  if (months < 2) return 'vor einem Monat'
  if (months < 12) return `vor ${months} Monaten`
  if (years < 2)  return 'vor einem Jahr'
  return `vor ${years} Jahren`
}
```

In `src/screens/ContentList.jsx`:
```jsx
import { relativeTime } from '../lib/reltime'

// In the table date cell — show both formatted date and relative:
<td>
  <span style={{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--ink4)'}}>
    {item.date ? new Date(item.date).toLocaleDateString('de') : '—'}
  </span>
  <span style={{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--ink4)',display:'block'}}>
    {relativeTime(item.date)}
  </span>
</td>
```

Note: `item.date` requires the Worker's list endpoint to return `date` from the file's frontmatter. Update `GET /api/content/:type` in the Worker to parse frontmatter and include `date` in the response:

```javascript
// In the list endpoint, after fetching the files array:
// For each file, fetch its content to extract the date — this is expensive for large lists.
// Better: extract date from the slug prefix if using date-prefixed slugs,
// OR return the file's last-modified date from the GitHub API (use file.sha to proxy).
// Simplest correct approach: return file metadata only (sha, name) and let the frontend
// derive approximate date from the slug if it's date-prefixed (e.g. 2023-05-14-archivarbeit).
// Parse slug: const dateMatch = item.slug.match(/^(\d{4}-\d{2}-\d{2})/)

// In ContentList.jsx — derive date from slug:
function dateFromSlug(slug) {
  const m = slug.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : null
}
```

---

### B7 — Build status indicator

Add a build status pill to the CMS topbar that shows when the site last deployed.

**New Worker endpoint** in `worker/src/index.js`:

```javascript
// GET /api/build-status
// Calls Cloudflare Pages API to get latest deployment status
// Requires additional env vars: CF_ACCOUNT_ID, CF_PAGES_PROJECT (set via wrangler secret put)

app.get('/api/build-status', jwtMiddleware, async (c) => {
  const { CF_ACCOUNT_ID, CF_PAGES_PROJECT } = c.env
  if (!CF_ACCOUNT_ID || !CF_PAGES_PROJECT) {
    return c.json({ status: 'unknown', message: 'Not configured' })
  }
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${CF_PAGES_PROJECT}/deployments?per_page=1`,
      { headers: { Authorization: `Bearer ${c.env.GITHUB_TOKEN}` } }
      // Note: use a Cloudflare API Token, not GitHub token.
      // Add CF_API_TOKEN as a separate secret: wrangler secret put CF_API_TOKEN
    )
    const data = await res.json()
    const latest = data.result?.[0]
    if (!latest) return c.json({ status: 'unknown' })

    return c.json({
      status: latest.latest_stage?.status || 'unknown', // 'success' | 'failure' | 'active'
      deployedAt: latest.created_on,
      url: latest.url
    })
  } catch (err) {
    return c.json({ status: 'error', message: err.message })
  }
})
```

**New Worker secret** (document in README):
```
wrangler secret put CF_ACCOUNT_ID
wrangler secret put CF_PAGES_PROJECT   # the project name, e.g. julia-academic-site
wrangler secret put CF_API_TOKEN       # Cloudflare API token with Pages:Read permission
```

**API client** in `src/lib/api.js`:
```js
getBuildStatus: () => req('GET', '/api/build-status'),
```

**Build status component** in `src/components/BuildStatus.jsx`:
```jsx
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function BuildStatus() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000) // Poll every minute
    return () => clearInterval(interval)
  }, [])

  async function load() {
    try {
      const data = await api.getBuildStatus()
      setStatus(data)
    } catch {}
  }

  if (!status) return null

  const label = {
    success: '✓ Live',
    active:  '⟳ Wird gebaut…',
    failure: '✕ Fehler',
    unknown: '? Unbekannt',
  }[status.status] || '?'

  const color = {
    success: 'var(--teal)',
    active:  'var(--amb2)',
    failure: 'var(--red)',
    unknown: 'var(--ink4)',
  }[status.status] || 'var(--ink4)'

  const timeStr = status.deployedAt
    ? new Date(status.deployedAt).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="build-status" style={{ color }} title={timeStr ? `Zuletzt gebaut: ${timeStr}` : ''}>
      {label}
      {timeStr && <span className="build-time">{timeStr}</span>}
    </div>
  )
}
```

**Add to `Layout.jsx`** in the sidebar footer:
```jsx
import BuildStatus from './BuildStatus'

// In sidebar footer, after theme toggle:
<BuildStatus />
```

CSS in `cms.css`:
```css
.build-status { font-family: var(--mono); font-size: 10px; display: flex; align-items: center; gap: 6px; margin-left: auto; }
.build-time { color: var(--ink4); font-size: 9px; }
```

---

### B8 — BibTeX deduplication on import

In `src/screens/BibTeXImport.jsx`, after parsing entries and before showing the preview:

```jsx
// Check which slugs already exist:
const [existingSlugs, setExistingSlugs] = useState(new Set())
const [overwrite, setOverwrite] = useState(false)

async function parse() {
  const parsed = parseBib(raw)
  // Fetch existing slugs
  try {
    const existing = await api.listContent('publications')
    setExistingSlugs(new Set(existing.map(e => e.slug)))
  } catch {}
  setEntries(parsed)
}

// Show duplicate warning in preview:
// For each entry where existingSlugs.has(entry.slug), show a warning badge
{entries.map(e => (
  <div className="preview-row" key={e.slug}>
    <div>
      <div className="preview-title">
        {e.title}
        {existingSlugs.has(e.slug) && (
          <span className="preview-duplicate">bereits vorhanden</span>
        )}
      </div>
      <div className="preview-meta">{e.authors?.join('; ')} · {e.date?.slice(0,4)}</div>
    </div>
    <span className="preview-type">{e.publication_types?.[0]}</span>
  </div>
))}

// Add overwrite checkbox before import button:
<label className="overwrite-toggle">
  <input
    type="checkbox"
    checked={overwrite}
    onChange={e => setOverwrite(e.target.checked)}
  />
  <span>Vorhandene Einträge überschreiben</span>
</label>

// In importAll: if !overwrite, skip entries where existingSlugs.has(slug)
async function importAll() {
  for (let i = 0; i < entries.length; i++) {
    const { slug, ...fm } = entries[i]
    if (!overwrite && existingSlugs.has(slug)) continue // Skip duplicates
    // ... rest of existing logic
  }
}
```

CSS in `cms.css`:
```css
.preview-duplicate { font-family: var(--mono); font-size: 9px; color: var(--amb2); background: rgba(139,111,71,.1); padding: 2px 6px; border-radius: 2px; margin-left: 8px; }
.overwrite-toggle { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 11px; color: var(--ink2); margin-bottom: 12px; cursor: pointer; }
.overwrite-toggle input { accent-color: var(--teal); }
```

---

### B9 — Sync script: delete detection

In `sync/sync.js`, add a `--delete` flag to the push command.

When `process.argv.includes('--delete')` is true, after the regular push loop:

```javascript
// Find remote files that no longer exist locally
for (const [remotePath, { sha }] of Object.entries(remoteTree)) {
  if (!remotePath.startsWith(config.remoteDir)) continue

  // Parse type and filename from remote path
  const rel = remotePath.replace(config.remoteDir + '/', '')
  const parts = rel.split('/')
  const type = parts[0]
  const file = parts[1]
  if (!type || !file || !config.contentTypes.includes(type)) continue

  const localPath = join(config.localDir, type, file)
  if (!existsSync(localPath)) {
    process.stdout.write(chalk.red(`  ✕ ${rel} existiert lokal nicht mehr — löschen? (j/n) `))
    // Read from stdin for confirmation
    const answer = await readline()
    if (answer.trim().toLowerCase() === 'j') {
      await ghDelete(config, remotePath, sha)
      console.log(chalk.green('gelöscht'))
      deleted++
    } else {
      console.log(chalk.dim('übersprungen'))
    }
  }
}
```

Add to `sync/README.md`:
```markdown
### Dateien löschen

Wenn Sie eine Datei lokal löschen und aus GitHub entfernen möchten:

```
node sync.js --delete
```

Das Skript zeigt alle remote Dateien, die lokal fehlen, und fragt für jede einzeln nach.
```

---

## Implementation order

Work through this exact sequence:

1. **Site:** A1 (RSS — 1 line in hugo.yaml)
2. **Site:** A3 (robots.txt — new static file)
3. **Site:** A2 (Open Graph meta tags in baseof.html)
4. **Site:** A4 (Reading time in posts/single.html + CSS)
5. **Site:** A5 (Tag templates + linked tags + CSS)
6. **Site:** A6 (Publications filter + CSS + JS)
7. **Site:** A7 (Teaching layout + CSS)
8. **CMS css:** Add all CSS from B1, B3, B5, B6, B7, B8 to cms.css in one pass
9. **CMS:** B1 (Unsaved changes warning in Editor.jsx)
10. **CMS:** B2 (Auto-save to localStorage in Editor.jsx)
11. **CMS:** B3 (Keyboard shortcuts in Editor.jsx)
12. **CMS:** B4 (Alt text warning in Editor.jsx)
13. **CMS lib:** Create src/lib/reltime.js
14. **CMS:** B5 (Search in ContentList.jsx)
15. **CMS:** B6 (Relative timestamps in ContentList.jsx)
16. **CMS:** B8 (BibTeX deduplication in BibTeXImport.jsx)
17. **Worker:** Add /api/build-status endpoint + document new secrets
18. **CMS:** B7 (BuildStatus component + wire into Layout.jsx)
19. **Sync:** B9 (--delete flag in sync.js + README)

---

## Verification checklist

**Site:**
- [ ] `/index.xml` and `/posts/index.xml` exist and contain valid RSS
- [ ] `<meta property="og:title">` present in page source
- [ ] Sharing a post URL on LinkedIn/Telegram shows preview card
- [ ] `/robots.txt` is accessible and contains sitemap URL
- [ ] Reading time appears on blog post pages
- [ ] Tags on posts are clickable links
- [ ] `/tags/` shows all tags with counts
- [ ] `/tags/exil/` shows filtered post list
- [ ] Publications page: year/type dropdowns filter the list correctly
- [ ] Dropdowns reset correctly via Zurücksetzen button
- [ ] Teaching page renders course list with semester column

**CMS:**
- [ ] Navigating away from an unsaved post triggers browser warning
- [ ] Clicking browser back with unsaved changes: confirm dialog appears
- [ ] Amber dot appears in topbar title when content is dirty
- [ ] After 30s of editing, check localStorage for autosave entry
- [ ] Reload page → autosave restore prompt appears
- [ ] After successful save → autosave entry removed from localStorage
- [ ] Cmd+S saves with current draft state, no page reload
- [ ] Cmd+Shift+Enter publishes (sets draft: false)
- [ ] Cmd+K opens link modal
- [ ] Image with empty alt text on save → warning dialog with option to proceed
- [ ] Search input filters content list in real time
- [ ] Date column shows relative time ("vor 2 Jahren") below the formatted date
- [ ] BibTeX import: duplicate entries show "bereits vorhanden" badge
- [ ] BibTeX import without overwrite: duplicates are skipped
- [ ] BibTeX import with overwrite: duplicates are updated
- [ ] Build status pill visible in sidebar footer (requires CF secrets configured)
- [ ] Build status updates every minute
- [ ] Sync --delete: prompts for each orphaned remote file before deleting
