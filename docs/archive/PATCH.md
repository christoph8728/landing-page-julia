# PATCH — Targeted Fixes for Site and CMS

Read this document fully before making any changes.
This is based on a complete review of the actual codebase — it lists only what is missing or broken, not what is already working.

---

## What is already working (do not touch)

**CMS:**
- `App.jsx` routing — correct, leave as-is
- `Layout.jsx` sidebar — correct markup and classes
- `cms.css` tokens and base components (buttons, sidebar, topbar, shell, login, table, badges, bibtex, media) — correct
- `Dashboard.jsx`, `ContentList.jsx`, `BibTeXImport.jsx`, `MediaLibrary.jsx`, `ProfileEditor.jsx` — functionally correct
- `lib/api.js`, `lib/frontmatter.js`, `lib/bibtex.js` — leave alone

**Site:**
- `hugo.yaml` — correct
- `layouts/partials/nav.html` — correct
- `layouts/partials/footer.html` — correct
- `layouts/publications/list.html` — correct
- `layouts/posts/single.html` — correct
- `layouts/_default/baseof.html` — correct
- Design tokens and base reset in `main.css` — correct
- Hero, nav, scols, smain, saside, sh, bcard-a/b/c, pub-e, pub-with-cover in `main.css` — correct

---

## SECTION 1 — Site: Missing CSS classes

`main.css` is only 249 lines. Several classes used by the Hugo templates are missing, causing broken layouts. Add these to `site/static/css/main.css`.

### 1.1 Blog post detail (used by `layouts/posts/single.html`)

```css
/* ── BLOG POST DETAIL ───────────────────────────────── */
.bdetail-hero { position: relative; overflow: hidden; height: clamp(240px, 35vw, 360px); }
.bdetail-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
.bdetail-hero-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: clamp(20px, 4vw, 32px) clamp(20px, 5vw, 52px);
  background: linear-gradient(to top, rgba(20,15,10,.72) 0%, transparent 100%);
}
.bdetail-kicker { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: rgba(240,230,210,.7); margin-bottom: 10px; }
.bdetail-title { font-family: var(--serif); font-size: clamp(20px, 4vw, 32px); font-weight: 400; color: #f0e8d2; line-height: 1.2; letter-spacing: -.015em; max-width: 640px; }
.bdetail-cap { font-family: var(--mono); font-size: 9.5px; color: rgba(240,230,210,.5); margin-top: 8px; font-style: italic; }

/* No-hero fallback — used when post has no cover image */
.detail-date { font-family: var(--mono); font-size: 11px; color: var(--ink4); margin-bottom: 12px; letter-spacing: .04em; }
.detail-tags { margin-top: 12px; }

/* Body of post */
.bdetail-body { max-width: 680px; margin: 0 auto; padding: clamp(32px, 5vw, 52px); }
.bdetail-body p { font-family: var(--serif); font-size: 17.5px; line-height: 1.75; color: var(--ink2); margin-bottom: 22px; }
.bdetail-body p strong { color: var(--ink); }
.bdetail-body p em { color: var(--ink); }
.bdetail-body h2 { font-family: var(--serif); font-size: 24px; font-weight: 500; margin: 40px 0 16px; color: var(--ink); }
.bdetail-body h3 { font-family: var(--serif); font-size: 20px; font-weight: 500; margin: 32px 0 12px; color: var(--ink); }
.bdetail-body blockquote { border-left: 2px solid var(--p3); padding-left: 20px; margin: 24px 0; font-style: italic; color: var(--ink3); }
.bdetail-body code { font-family: var(--mono); font-size: 14px; background: var(--p2); padding: 2px 5px; border-radius: 3px; }
.bdetail-body img { max-width: 100%; border-radius: 2px; margin: 24px 0; }

/* Inline image layouts — photo buttons in editor produce these */
.prose-img-full { width: 100%; margin: 32px 0; }
.prose-img-full img { width: 100%; border-radius: 2px; }
.prose-img-right { float: right; margin: 4px 0 20px 28px; width: 240px; }
.prose-img-right img { width: 240px; height: 180px; object-fit: cover; border-radius: 2px; }
.prose-img-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 32px 0; }
.prose-img-pair img { width: 100%; height: 180px; object-fit: cover; border-radius: 2px; }
.prose-img-cap { font-family: var(--mono); font-size: 10px; color: var(--ink4); margin-top: 8px; font-style: italic; line-height: 1.5; }
.clearfix::after { content: ''; display: table; clear: both; }

/* Tags, back link — used in posts/single.html */
.tag-list { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; background: var(--p2); color: var(--acc2); padding: 3px 8px; border-radius: 2px; }
.tag-list--sm .tag--sm { font-size: 9px; }
.keywords-section { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--p3); }
.back-link-wrap { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--p3); }
.back-link { font-family: var(--sans); font-size: 13px; color: var(--ink3); text-decoration: none; }
.back-link:hover { color: var(--acc); }
```

### 1.2 Publications page (used by `layouts/publications/list.html` and `index.html`)

```css
/* ── PUBLICATIONS PAGE ──────────────────────────────── */
.pubpage-header { padding: clamp(32px, 5vw, 56px) clamp(20px, 5vw, 52px) clamp(24px, 4vw, 44px); border-bottom: 1px solid var(--p3); max-width: 960px; margin: 0 auto; }
.pubpage-h { font-family: var(--serif); font-size: clamp(24px, 4vw, 36px); font-weight: 400; color: var(--ink); letter-spacing: -.015em; margin-bottom: 6px; }
.pubpage-sub { font-family: var(--sans); font-size: 13.5px; color: var(--ink3); }
.pubpage-body { max-width: 960px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 52px) 52px; }
.yr-label { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--ink4); margin-bottom: 18px; margin-top: 44px; padding-bottom: 8px; border-bottom: 1px solid var(--p3); }
.pub-authors { font-family: var(--serif); font-size: 14px; font-style: italic; color: var(--ink3); margin-bottom: 3px; }

/* Publication with cover image */
.pub-with-cover { display: grid; grid-template-columns: 80px 1fr; gap: 18px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--p3); align-items: start; }
.pub-with-cover:last-child { border-bottom: none; }
.pub-cover { width: 80px; height: 108px; border-radius: 2px; overflow: hidden; box-shadow: 2px 3px 8px rgba(0,0,0,.15); background: var(--p2); flex-shrink: 0; }
.pub-cover img { width: 100%; height: 100%; object-fit: cover; }
```

### 1.3 Projects grid (used by `index.html`)

```css
/* ── PROJECTS GRID ──────────────────────────────────── */
.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 16px; }
.project-card { background: var(--p2); border-radius: 4px; overflow: hidden; border: 1px solid var(--p3); transition: border-color .12s; }
.project-card:hover { border-color: var(--acc2); }
.project-card-img { height: 140px; overflow: hidden; background: var(--p3); }
.project-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.project-card-body { padding: 16px; }
.project-card-title { font-family: var(--serif); font-size: 16px; font-weight: 500; color: var(--ink); text-decoration: none; display: block; margin-bottom: 6px; }
.project-card-title:hover { color: var(--acc); }
.project-card-sum { font-family: var(--sans); font-size: 12.5px; color: var(--ink3); line-height: 1.5; }
```

### 1.4 News thumbnails in aside (used by `index.html`)

```css
/* ── ASIDE NEWS PHOTOS ──────────────────────────────── */
.anews-photo { width: 100%; height: 100px; border-radius: 3px; overflow: hidden; margin-bottom: 8px; background: var(--p2); }
.anews-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
```

### 1.5 Footer wrapper (used by `index.html` which wraps footer in `.sfooter-wrap`)

```css
/* ── FOOTER ─────────────────────────────────────────── */
.sfooter-wrap { border-top: 1px solid var(--p3); }
.sfooter { padding: 22px clamp(20px, 5vw, 52px); display: flex; align-items: center; justify-content: space-between; font-family: var(--mono); font-size: 10.5px; color: var(--ink4); letter-spacing: .04em; max-width: 960px; margin: 0 auto; }
```

### 1.6 Section "more" link and pub list section-more link

```css
.section-more { font-family: var(--sans); font-size: 12px; font-weight: 500; color: var(--ink3); text-decoration: none; display: inline-block; margin-top: 14px; letter-spacing: .02em; }
.section-more:hover { color: var(--acc2); }
```

### 1.7 Mobile responsive additions

```css
/* ── MOBILE ─────────────────────────────────────────── */
@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; }
  .hero-photo { display: none; }
  .hero-text { padding: 40px 20px; border-right: none; }
  .snav { padding: 0 20px; }
  .snav ul { gap: 16px; }
  .scols { grid-template-columns: 1fr; }
  .smain { padding: 32px 20px; border-right: none; border-bottom: 1px solid var(--p3); }
  .saside { padding: 32px 20px; }
  .bdetail-body { padding: 32px 20px; }
  .sfooter { padding: 22px 20px; }
  .pubpage-header { padding: 32px 20px; }
  .pubpage-body { padding: 0 20px 40px; }
  .section-grid { grid-template-columns: 1fr; }
  .prose-img-right { float: none; width: 100%; margin: 24px 0; }
  .prose-img-right img { width: 100%; height: auto; }
  .prose-img-pair { grid-template-columns: 1fr; }
}
```

---

## SECTION 2 — CMS: Missing CSS for Editor

`cms.css` is only 224 lines and is missing the editor-specific styles. The `EDITOR_FIX.md` document specifies these — they still need to be added to `cms/src/styles/cms.css`.

Add the following block to the end of `cms.css`:

```css
/* ── EDITOR ─────────────────────────────────────────── */

/* Editor page layout */
.ed-page { display: flex; flex-direction: column; height: calc(100vh - 50px); overflow: hidden; }
.cms-ed { display: grid; grid-template-columns: 1fr 220px; flex: 1; overflow: hidden; }
.ed-main { padding: 22px 26px; border-right: 1px solid var(--bd); display: flex; flex-direction: column; overflow-y: auto; }
.ed-side { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }

/* MD upload strip */
.md-strip { display: flex; align-items: center; gap: 10px; background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; padding: 10px 14px; margin-bottom: 14px; }
.md-strip-btn { font-family: var(--mono); font-size: 9.5px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--teal); cursor: pointer; border: 1px solid var(--teal2); border-radius: 3px; padding: 4px 9px; white-space: nowrap; background: none; }
.md-strip-btn:hover { background: rgba(90,138,120,.1); }
.md-strip-hint { font-size: 11.5px; color: var(--ink3); }

/* Title input */
.ed-title-inp { width: 100%; background: transparent; border: none; font-family: var(--serif); font-size: 22px; font-weight: 400; color: var(--ink); outline: none; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--bd); transition: border-color .15s; letter-spacing: -.01em; }
.ed-title-inp:focus { border-bottom-color: var(--teal); }
.ed-title-inp::placeholder { color: var(--ink4); }

/* Toolbar row */
.ed-toolbar-row { display: flex; align-items: center; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--bd); flex-wrap: wrap; gap: 4px; }
.ed-tb { display: flex; gap: 1px; flex-wrap: wrap; flex: 1; }
.tb { background: none; border: none; border-radius: 3px; padding: 5px 7px; font-size: 11px; font-weight: 600; color: var(--ink3); cursor: pointer; font-family: var(--mono); transition: background .1s, color .1s; }
.tb:hover { background: var(--s3); color: var(--ink); }
.tbsep { width: 1px; background: var(--bd); margin: 3px 3px; align-self: stretch; }
.tb-photo { background: rgba(90,138,120,.1); color: var(--teal); border: 1px solid rgba(90,138,120,.2); }
.tb-photo:hover { background: rgba(90,138,120,.2); }

/* Mode toggle */
.mode-toggle { background: var(--s3); border: 1px solid var(--bd); border-radius: 3px; padding: 5px 10px; font-size: 10px; font-family: var(--mono); color: var(--ink2); cursor: pointer; white-space: nowrap; margin-left: auto; }
.mode-toggle:hover { background: var(--s4); color: var(--ink); }
.mode-wysiwyg { color: var(--teal); border-color: var(--teal2); }

/* Milkdown WYSIWYG container */
.ed-milkdown-wrap { flex: 1; min-height: 280px; position: relative; }
.ed-loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: var(--mono); font-size: 11px; color: var(--ink4); }

/* Override Milkdown ProseMirror defaults */
.milkdown-menu { display: none !important; }
.ed-milkdown-wrap .milkdown { background: transparent !important; color: var(--ink2); font-family: var(--serif); font-size: 15.5px; line-height: 1.8; padding: 4px 0; outline: none; min-height: 280px; }
.ed-milkdown-wrap .milkdown .editor { outline: none; }
.ed-milkdown-wrap .milkdown p { margin-bottom: 14px; }
.ed-milkdown-wrap .milkdown h1 { font-family: var(--serif); font-size: 26px; font-weight: 500; color: var(--ink); margin: 28px 0 14px; line-height: 1.2; }
.ed-milkdown-wrap .milkdown h2 { font-family: var(--serif); font-size: 22px; font-weight: 500; color: var(--ink); margin: 24px 0 12px; }
.ed-milkdown-wrap .milkdown h3 { font-family: var(--serif); font-size: 18px; font-weight: 500; color: var(--ink); margin: 20px 0 10px; }
.ed-milkdown-wrap .milkdown strong { color: var(--ink); }
.ed-milkdown-wrap .milkdown em { color: var(--ink); font-style: italic; }
.ed-milkdown-wrap .milkdown blockquote { border-left: 3px solid var(--teal2); padding-left: 16px; color: var(--ink3); margin: 16px 0; font-style: italic; }
.ed-milkdown-wrap .milkdown code { font-family: var(--mono); font-size: 13px; background: var(--s3); padding: 2px 5px; border-radius: 3px; color: var(--teal); }
.ed-milkdown-wrap .milkdown pre { background: var(--s2); border: 1px solid var(--bd); border-radius: 6px; padding: 14px; margin: 16px 0; overflow-x: auto; }
.ed-milkdown-wrap .milkdown pre code { background: none; padding: 0; font-size: 13px; color: var(--ink2); }
.ed-milkdown-wrap .milkdown a { color: var(--teal); }
.ed-milkdown-wrap .milkdown hr { border: none; border-top: 1px solid var(--bd); margin: 24px 0; }
.ed-milkdown-wrap .milkdown ul,
.ed-milkdown-wrap .milkdown ol { padding-left: 20px; margin-bottom: 14px; }
.ed-milkdown-wrap .milkdown li { margin-bottom: 4px; }
.ed-milkdown-wrap .milkdown img { max-width: 100%; border-radius: 2px; margin: 16px 0; }

/* Raw textarea */
.ed-raw-textarea { width: 100%; flex: 1; min-height: 360px; padding: 16px; font-family: var(--mono); font-size: 13px; line-height: 1.7; background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; color: var(--ink2); resize: vertical; outline: none; transition: border-color .15s; }
.ed-raw-textarea:focus { border-color: var(--teal); }

/* Sidebar fields */
.sf { display: flex; flex-direction: column; }
.slabel { display: block; font-size: 9.5px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--ink4); margin-bottom: 6px; }
.sinput { width: 100%; background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; padding: 8px 10px; font-family: var(--mono); font-size: 11px; color: var(--ink); outline: none; transition: border-color .15s; resize: vertical; }
.sinput:focus { border-color: var(--teal); }

/* Status toggle */
.tog { display: flex; border-radius: 4px; overflow: hidden; border: 1px solid var(--bd); }
.topt { flex: 1; padding: 6px 4px; font-size: 10.5px; font-weight: 600; text-align: center; cursor: pointer; color: var(--ink3); background: var(--s2); transition: all .12s; font-family: var(--mono); letter-spacing: .04em; }
.topt.on { background: var(--teal); color: #fff; }

/* Cover thumbnail in sidebar */
.ed-cover-thumb { width: 100%; height: 60px; border-radius: 3px; overflow: hidden; margin-bottom: 6px; background: var(--s3); }
.ed-cover-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* Save actions */
.sacts { display: flex; flex-direction: column; gap: 6px; margin-top: auto; padding-top: 16px; }

/* Status bar */
.cms-status { padding: 8px 22px; font-family: var(--mono); font-size: 11px; color: var(--teal); background: rgba(82,122,110,.08); border-bottom: 1px solid var(--bd); }
.cms-loading { padding: 48px; text-align: center; font-family: var(--mono); font-size: 12px; color: var(--ink4); }
.form-error { color: var(--red); font-size: 12px; margin-bottom: 10px; font-family: var(--mono); }
```

---

## SECTION 3 — Editor.jsx: Specific fixes

Read `EDITOR_FIX.md` for the full specification. The following is the minimal checklist of what must change in `Editor.jsx`:

### 3.1 Remove Nord theme

```bash
npm uninstall @milkdown/theme-nord
```

Remove from `Editor.jsx`:
```js
// DELETE these two lines:
import { nord } from '@milkdown/theme-nord'
import '@milkdown/theme-nord/style.css'
```

Remove from editor creation:
```js
// DELETE this line inside Editor.make():
.use(nord)
```

### 3.2 Fix the reinitialisation bug

In `MilkdownEditorComponent`, the `useEffect` that creates the Milkdown editor has `[rawMode, body]` as its dependency array. This causes the editor to destroy and recreate itself every time the user types.

**Change the dependency array to `[rawMode]` only.**

The `body` passed to `defaultValueCtx` is the initial value — it must not be reactive. Instead, use `initialBody` as a prop (the value at mount time) separate from `body` (the live reactive value).

Full pattern:
```jsx
// Parent passes initialBody (stable) and body (reactive):
// <MilkdownEditorComponent
//   key={editorKey}        ← increment this to force remount when file uploaded
//   initialBody={initialBody}  ← passed to defaultValueCtx, not reactive
//   onBodyChange={setBody}     ← called by listenerCtx on every edit
//   rawMode={rawMode}
//   onToggleRawMode={...}
//   onRawInsert={...}
// />

useEffect(() => {
  if (rawMode || !editorRef.current || isInitializedRef.current) return
  isInitializedRef.current = true

  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, editorRef.current)
      ctx.set(defaultValueCtx, initialBody || '')  // ← initialBody, not body
      ctx.get(listenerCtx).markdownUpdated((_, md) => onBodyChange(md))
    })
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .use(history)
    .create()
    .then(ed => { editorInstanceRef.current = ed })
    .catch(err => { console.error('Milkdown error:', err); isInitializedRef.current = false })

  return () => {
    editorInstanceRef.current?.destroy()
    editorInstanceRef.current = null
    isInitializedRef.current = false
  }
}, [rawMode])  // ← rawMode only — body is NOT in this array
```

### 3.3 Fix toolbar: enable buttons in WYSIWYG mode

The existing toolbar disables all buttons when `rawMode === false`. This is backwards.

**WYSIWYG mode:** buttons call Milkdown commands via the `callCommand` utility.
**Raw mode:** buttons manipulate the textarea string (existing logic is correct, keep it).

```jsx
// Add these imports at the top of Editor.jsx:
import {
  callCommand,
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInHeadingCommand,
  insertHrCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  editorViewCtx,
} from '@milkdown/kit'
// Note: exact import paths depend on @milkdown/kit version.
// Try: from '@milkdown/kit/preset/commonmark' for toggle commands
// Try: from '@milkdown/kit/utils' for callCommand
// Try: from '@milkdown/kit/core' for editorViewCtx
// If a named export doesn't exist, check milkdown docs for v7 API.
```

```jsx
// Inside MilkdownEditorComponent, add:
function issueCommand(command, payload) {
  if (!editorInstanceRef.current) return
  editorInstanceRef.current.action(callCommand(command, payload))
  // Restore focus after command
  editorInstanceRef.current.action((ctx) => ctx.get(editorViewCtx).focus())
}
```

Replace the disabled WYSIWYG toolbar buttons with enabled ones:
```jsx
// WYSIWYG toolbar (shown when rawMode === false):
<button className="tb" onClick={() => issueCommand(toggleStrongCommand.key)}>B</button>
<button className="tb" onClick={() => issueCommand(toggleEmphasisCommand.key)}><em>I</em></button>
<button className="tb" onClick={() => issueCommand(wrapInHeadingCommand.key, 1)}>H1</button>
<button className="tb" onClick={() => issueCommand(wrapInHeadingCommand.key, 2)}>H2</button>
<button className="tb" onClick={() => issueCommand(wrapInHeadingCommand.key, 3)}>H3</button>
<button className="tb" onClick={() => issueCommand(wrapInBulletListCommand.key)}>•</button>
<button className="tb" onClick={() => issueCommand(wrapInOrderedListCommand.key)}>1.</button>
<button className="tb" onClick={() => issueCommand(insertHrCommand.key)}>—</button>
```

Remove the "Formatierungsbuttons funktionieren nur im Raw-Modus" warning — it must not appear.

### 3.4 Fix mode toggle label

The current label shows the *target* mode ("📝 Raw" when in WYSIWYG, "👁 WYSIWYG" when in raw). It should show the *current* mode.

```jsx
// Change to:
<button className={`mode-toggle ${rawMode ? '' : 'mode-wysiwyg'}`} onClick={onToggleRawMode}>
  {rawMode ? '📝 Raw' : '👁 WYSIWYG'}
</button>
// When rawMode is false (WYSIWYG active), label = "👁 WYSIWYG" and class adds teal border
// When rawMode is true (Raw active), label = "📝 Raw" with no special class
```

### 3.5 Add photo buttons

Photo buttons exist in the raw toolbar but are missing functional implementations. Add these three buttons to both toolbars:

**In WYSIWYG mode** — buttons append to document and remount editor:
```jsx
<button className="tb tb-photo" onClick={() => {
  const url = prompt('Bild-URL (oder später aus Mediathek auswählen):') || '/media/foto.jpg'
  const caption = prompt('Bildunterschrift (optional):') || ''
  const md = `\n\n![${caption}](${url})\n*${caption}*\n\n`
  onBodyChange(prev => (prev || '') + md)
  onForceRemount()  // parent increments editorKey
}}>⊞ Foto</button>

<button className="tb tb-photo" onClick={() => {
  const url = prompt('Bild-URL:') || '/media/foto.jpg'
  const caption = prompt('Bildunterschrift (optional):') || ''
  const md = `\n\n<figure style="float:right;margin:0 0 1em 1.5em;width:240px"><img src="${url}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>\n\n`
  onBodyChange(prev => (prev || '') + md)
  onForceRemount()
}}>⊟ Foto rechts</button>

<button className="tb tb-photo" onClick={() => {
  const url1 = prompt('Erstes Bild URL:') || '/media/foto1.jpg'
  const url2 = prompt('Zweites Bild URL:') || '/media/foto2.jpg'
  const cap1 = prompt('Bildunterschrift 1 (optional):') || ''
  const cap2 = prompt('Bildunterschrift 2 (optional):') || ''
  const md = `\n\n<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:2em 0"><figure><img src="${url1}" alt="${cap1}" /><figcaption>${cap1}</figcaption></figure><figure><img src="${url2}" alt="${cap2}" /><figcaption>${cap2}</figcaption></figure></div>\n\n`
  onBodyChange(prev => (prev || '') + md)
  onForceRemount()
}}>⊡ Foto-Paar</button>
```

**`onForceRemount` prop** — add to parent `EditorScreen`:
```jsx
// In EditorScreen state:
const [editorKey, setEditorKey] = useState(0)

// Pass down:
<MilkdownEditorComponent
  key={editorKey}
  initialBody={initialBody}
  onBodyChange={setBody}
  rawMode={rawMode}
  onToggleRawMode={() => setRawMode(r => !r)}
  onRawInsert={handleToolbarInsert}
  onForceRemount={() => setEditorKey(k => k + 1)}
/>
```

**In Raw mode** — the existing raw toolbar photo button inserts the markdown string directly into the textarea. Keep existing logic.

---

## SECTION 4 — Site: Minor Hugo template fixes

### 4.1 `index.html` — profile data path

The template uses `hugo.Data.profile` (correct in Hugo ≥0.122). If the site was built with an older Hugo and profile data isn't rendering, the path is `.Site.Data.profile`. Check which syntax the current Hugo version supports. In `hugo.yaml`, pin:

```yaml
# Already correct if present:
# No change needed if hugo.Data.profile renders correctly
```

### 4.2 `layouts/publications/single.html` — check it exists and has content

Run: `cat layouts/publications/single.html`

If it is empty or just `{{ define "main" }}{{ end }}`, replace it with:

```html
{{ define "main" }}
<div class="pubpage-header">
  <div class="hlabel" style="margin-bottom:14px">{{ .Params.publication_type | default "Publikation" }}</div>
  <h1 class="pubpage-h">{{ .Title }}</h1>
  {{ if .Params.authors }}
  <div class="pub-authors" style="margin-top:8px;font-size:16px">
    {{ delimit .Params.authors ", " }}
  </div>
  {{ end }}
  {{ with .Params.venue }}<div class="pub-in" style="margin-top:4px">{{ . }}</div>{{ end }}
  <div class="pub-m" style="margin-top:8px">
    <span>{{ .Date.Format "2006" }}</span>
    {{ with .Params.doi }}<a class="pub-l" href="https://doi.org/{{ . }}" target="_blank" rel="noopener">DOI</a>{{ end }}
    {{ with .Params.pdf }}<a class="pub-l" href="{{ . }}" target="_blank" rel="noopener">PDF</a>{{ end }}
  </div>
</div>

<div class="bdetail-body">
  {{ with .Params.abstract }}
  <p style="font-style:italic;color:var(--ink3);border-left:2px solid var(--p3);padding-left:20px;margin-bottom:32px">{{ . }}</p>
  {{ end }}
  {{ .Content }}
  <div class="back-link-wrap">
    <a href="/publications/" class="back-link">← Alle Publikationen</a>
  </div>
</div>
{{ end }}
```

---

## SECTION 5 — Verification

After applying all patches, verify the following:

**Site:**
- [ ] Homepage renders: hero, three blog card types, publications section, projects grid, aside with news thumbnails
- [ ] Blog post with cover image: full-bleed hero with gradient overlay and title
- [ ] Blog post without cover image: clean header fallback with title, date, tags
- [ ] Publications page: year-grouped list, cover images where present
- [ ] Single publication page: renders with abstract, DOI/PDF links, back link
- [ ] Footer renders correctly with name and city
- [ ] Mobile (375px): single column, no photo panel in hero

**CMS Editor:**
- [ ] Editor loads without flickering or reinitialising while typing
- [ ] Type `**bold**` → renders bold inline (asterisks disappear)
- [ ] Type `# Heading` → renders H1 (hash disappears)
- [ ] Click H1, H2, B, I toolbar buttons → apply formatting in WYSIWYG mode
- [ ] Click ⊞ Foto → prompts for URL, inserts image, editor remounts with image
- [ ] Click ⊟ Foto rechts → inserts float-right figure
- [ ] Click ⊡ Foto-Paar → inserts two-column grid
- [ ] Mode toggle shows "👁 WYSIWYG" when in WYSIWYG mode, "📝 Raw" when in raw mode
- [ ] Switch to raw mode → see markdown source in textarea, toolbar still works
- [ ] Switch back to WYSIWYG → rendered content, Milkdown toolbar active
- [ ] Upload `.md` file → fields populate, body loads into editor
- [ ] Download → valid `.md` file with frontmatter identical to what would be saved
- [ ] No Nord theme visible (no blue/purple colour scheme)
