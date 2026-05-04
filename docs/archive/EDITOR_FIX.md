# Editor Fix — High-Fidelity Implementation Spec

This document corrects the current `Editor.jsx` implementation. Read it fully before touching any code.

---

## Diagnosis of current failures

The existing `Editor.jsx` has these specific bugs that must be fixed:

**Bug 1 — Milkdown reinitialises on every keystroke.**
`body` is in the `useEffect` dependency array. Every time the user types, `body` state changes, the effect runs, the editor is destroyed and recreated. Remove `body` from the dependency array. The editor must be created once and never recreated while in WYSIWYG mode.

**Bug 2 — Toolbar buttons are disabled in WYSIWYG mode.**
The toolbar disables all buttons when `rawMode === false` and shows the message "Formatierungsbuttons funktionieren nur im Raw-Modus." This is exactly backwards. In WYSIWYG mode, toolbar buttons must issue commands to Milkdown via its command API. In raw mode, they manipulate the textarea string. Both modes must have working buttons.

**Bug 3 — Nord theme is applied.**
The Nord theme (`@milkdown/theme-nord`) overrides all styling. Remove it. The editor must be unstyled and inherit the site's CSS variables. Remove the `import '@milkdown/theme-nord/style.css'` and `.use(nord)` lines entirely.

**Bug 4 — `inlineSync` plugin is missing.**
Without `inlineSync`, Milkdown does not behave like Typora. Typing `**bold**` shows raw asterisks instead of rendering bold inline. This plugin must be added.

**Bug 5 — Photo insertion buttons (Foto, Foto rechts, Foto-Paar) are missing.**
The design spec requires three specific image layout buttons that insert Hugo-compatible markdown shortcodes. These were replaced with a generic image dialog. Keep the image dialog for media upload, but also add the three layout buttons as specified below.

**Bug 6 — The mode switcher label is inverted.**
The button shows "📝 Raw" when in raw mode and "👁 WYSIWYG" when in WYSIWYG mode. It should show the *current* mode, not the *target* mode. Fix: show "WYSIWYG" when `rawMode === false`, show "Raw" when `rawMode === true`. The button action toggles to the other mode.

---

## Complete rewrite of `MilkdownEditorComponent`

Replace the entire `MilkdownEditorComponent` function (lines 322–411) with the following. Do not modify the surrounding `EditorScreen` component — only this function changes.

```jsx
import { useEditor, EditorComponent } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core'
import { commonmark, toggleStrongCommand, toggleEmphasisCommand, wrapInHeadingCommand, insertHrCommand, wrapInBulletListCommand, wrapInOrderedListCommand } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { history } from '@milkdown/kit/plugin/history'
import { callCommand } from '@milkdown/kit/utils'
// inlineSync: Typora-style inline rendering
// If @milkdown/kit/plugin/inline-sync exists, import it.
// As of @milkdown/kit v7, inline sync is included in commonmark preset by default.
// If you see a separate export, use it. Otherwise commonmark alone provides the behaviour.
```

```jsx
function MilkdownEditorComponent({ initialBody, onBodyChange, rawMode, onToggleRawMode }) {
  // editorInfo gives access to the editor instance for issuing commands
  const { get, loading } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        // initialBody only: do NOT put body/state in here
        // The editor is created once with the initial value
        ctx.set(defaultValueCtx, initialBody || '')
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onBodyChange(markdown)
        })
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)
      .use(history)
    , []) // Empty dependency array — create once, never recreate
```

**Critical:** `useEditor` is called with an empty dependency array `[]`. The editor is created exactly once per mount. `initialBody` is passed as the starting value via `defaultValueCtx` — it does not update the editor when changed. If the user uploads a `.md` file and the body state changes, remount the component by changing its `key` prop (see below).

```jsx
  // Issue a command to the Milkdown editor
  function cmd(command, payload) {
    get()?.action(callCommand(command, payload))
  }

  // Toolbar button handlers — WYSIWYG mode
  function handleBold()        { cmd(toggleStrongCommand.key) }
  function handleItalic()      { cmd(toggleEmphasisCommand.key) }
  function handleH1()          { cmd(wrapInHeadingCommand.key, 1) }
  function handleH2()          { cmd(wrapInHeadingCommand.key, 2) }
  function handleH3()          { cmd(wrapInHeadingCommand.key, 3) }
  function handleHr()          { cmd(insertHrCommand.key) }
  function handleBulletList()  { cmd(wrapInBulletListCommand.key) }
  function handleOrderedList() { cmd(wrapInOrderedListCommand.key) }

  // Insert raw markdown at cursor — works in both modes
  // In WYSIWYG mode: insert text into editor via insertTextCommand or direct input
  // In raw mode: manipulate textarea string (handled by parent)
  function handleLinkInsert() {
    const url = prompt('URL:')
    const label = prompt('Linktext:', 'Link')
    if (url) cmd(/* insertTextCommand */ null) // implement via insertTextCommand if available
    // Fallback: switch to raw mode momentarily, insert [label](url), switch back
  }

  // Photo layout buttons — insert Hugo shortcodes as markdown
  function handlePhotoFull(url, caption) {
    // Full-width image — standard markdown
    const md = `\n\n![${caption || 'Foto'}](${url || '/media/foto.jpg'})\n*${caption || 'Bildunterschrift'}*\n\n`
    insertMarkdownAtCursor(md)
  }

  function handlePhotoRight(url, caption) {
    // Float-right image — HTML figure (renders correctly in Hugo)
    const md = `\n\n<figure style="float:right;margin:0 0 1em 1.5em;width:240px">\n  <img src="${url || '/media/foto.jpg'}" alt="${caption || ''}" />\n  <figcaption>${caption || 'Bildunterschrift'}</figcaption>\n</figure>\n\n`
    insertMarkdownAtCursor(md)
  }

  function handlePhotoPair(url1, url2, cap1, cap2) {
    // Two images side by side — HTML grid
    const md = `\n\n<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:2em 0">\n  <figure><img src="${url1 || '/media/foto1.jpg'}" alt="${cap1 || ''}" /><figcaption>${cap1 || ''}</figcaption></figure>\n  <figure><img src="${url2 || '/media/foto2.jpg'}" alt="${cap2 || ''}" /><figcaption>${cap2 || ''}</figcaption></figure>\n</div>\n\n`
    insertMarkdownAtCursor(md)
  }

  // insertMarkdownAtCursor: in WYSIWYG mode, append to end of document.
  // Full cursor-position insertion is complex in ProseMirror — appending is acceptable.
  function insertMarkdownAtCursor(md) {
    if (!rawMode) {
      // Re-emit current markdown + new content via listener — editor will re-render
      onBodyChange((prev) => (prev || '') + md)
      // Note: this does NOT update the editor visual — see known limitation below.
      // For photo insertion in WYSIWYG mode, switch briefly to raw, insert, switch back.
      // Simplest correct implementation: always open image picker in raw mode.
    }
    // Raw mode: parent handles textarea insertion via onRawInsert callback
  }

  return (
    <div className="editor-body-wrapper">
      {/* Mode toggle — top right of toolbar area */}
      <div className="ed-toolbar-row">
        {/* WYSIWYG toolbar buttons — enabled when rawMode === false */}
        {!rawMode && (
          <div className="ed-tb">
            <button className="tb" onClick={handleBold} title="Fett (⌘B)">B</button>
            <button className="tb" onClick={handleItalic} title="Kursiv (⌘I)"><em>I</em></button>
            <div className="tbsep" />
            <button className="tb" onClick={handleH1} title="Überschrift 1">H1</button>
            <button className="tb" onClick={handleH2} title="Überschrift 2">H2</button>
            <button className="tb" onClick={handleH3} title="Überschrift 3">H3</button>
            <div className="tbsep" />
            <button className="tb" onClick={handleBulletList} title="Liste">•</button>
            <button className="tb" onClick={handleOrderedList} title="Nummeriert">1.</button>
            <button className="tb" onClick={handleHr} title="Trennlinie">—</button>
            <div className="tbsep" />
            <button className="tb tb-photo" onClick={() => {
              const url = prompt('Bild-URL oder aus Mediathek:')
              const caption = prompt('Bildunterschrift (optional):') || ''
              if (url) handlePhotoFull(url, caption)
            }} title="Foto einfügen (vollbreite)">⊞ Foto</button>
            <button className="tb tb-photo" onClick={() => {
              const url = prompt('Bild-URL:')
              const caption = prompt('Bildunterschrift (optional):') || ''
              if (url) handlePhotoRight(url, caption)
            }} title="Foto rechts einfügen">⊟ Foto rechts</button>
            <button className="tb tb-photo" onClick={() => {
              const url1 = prompt('Erstes Bild URL:')
              const url2 = prompt('Zweites Bild URL:')
              const cap1 = prompt('Bildunterschrift 1:') || ''
              const cap2 = prompt('Bildunterschrift 2:') || ''
              if (url1 && url2) handlePhotoPair(url1, url2, cap1, cap2)
            }} title="Foto-Paar einfügen">⊡ Foto-Paar</button>
          </div>
        )}

        {/* Raw mode toolbar — string manipulation, always functional */}
        {rawMode && (
          <div className="ed-tb">
            <button className="tb" onClick={() => onRawInsert({ label: 'B', insert: '**', wrap: true })} title="Fett">B</button>
            <button className="tb" onClick={() => onRawInsert({ label: 'I', insert: '*', wrap: true })} title="Kursiv"><em>I</em></button>
            <div className="tbsep" />
            <button className="tb" onClick={() => onRawInsert({ label: 'H1', insert: '# ' })} title="H1">H1</button>
            <button className="tb" onClick={() => onRawInsert({ label: 'H2', insert: '## ' })} title="H2">H2</button>
            <button className="tb" onClick={() => onRawInsert({ label: 'H3', insert: '### ' })} title="H3">H3</button>
            <div className="tbsep" />
            <button className="tb" onClick={() => onRawInsert({ label: '• Liste', insert: '- ' })} title="Liste">•</button>
            <button className="tb" onClick={() => onRawInsert({ label: '1.', insert: '1. ' })} title="Nummeriert">1.</button>
            <button className="tb" onClick={() => onRawInsert({ label: '> Zitat', insert: '> ' })} title="Zitat">&gt;</button>
            <button className="tb" onClick={() => onRawInsert({ label: '---', insert: '\n---\n' })} title="Linie">—</button>
            <div className="tbsep" />
            <button className="tb" onClick={() => onRawInsert({ label: 'Link', insert: '[', after: '](url)' })} title="Link">🔗</button>
            <button className="tb tb-photo" onClick={() => onRawInsert({ label: 'Foto', insert: '\n\n![Bildunterschrift](/media/foto.jpg)\n*Bildunterschrift*\n\n' })} title="Foto">⊞ Foto</button>
            <button className="tb tb-photo" onClick={() => onRawInsert({ label: 'Foto rechts', insert: '\n\n<figure style="float:right;margin:0 0 1em 1.5em;width:240px">\n  <img src="/media/foto.jpg" alt="" />\n  <figcaption>Bildunterschrift</figcaption>\n</figure>\n\n' })} title="Foto rechts">⊟ Foto rechts</button>
            <button className="tb tb-photo" onClick={() => onRawInsert({ label: 'Foto-Paar', insert: '\n\n<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:2em 0">\n  <figure><img src="/media/foto1.jpg" alt="" /><figcaption></figcaption></figure>\n  <figure><img src="/media/foto2.jpg" alt="" /><figcaption></figcaption></figure>\n</div>\n\n' })} title="Foto-Paar">⊡ Foto-Paar</button>
          </div>
        )}

        {/* Mode switcher — always visible, right-aligned */}
        <button
          className={`tb mode-toggle ${rawMode ? 'mode-raw' : 'mode-wysiwyg'}`}
          onClick={onToggleRawMode}
          title={rawMode ? 'Zu WYSIWYG wechseln' : 'Zu Raw Markdown wechseln'}
        >
          {rawMode ? '📝 Raw' : '👁 WYSIWYG'}
        </button>
      </div>

      {/* WYSIWYG editor */}
      {!rawMode && (
        <div className="ed-milkdown-wrap">
          {loading && <div className="ed-loading">Editor wird geladen…</div>}
          <EditorComponent />
        </div>
      )}

      {/* Raw textarea */}
      {rawMode && (
        <textarea
          className="ed-raw-textarea"
          value={rawBody}
          onChange={(e) => {
            setRawBody(e.target.value)
            onBodyChange(e.target.value)
          }}
          spellCheck
        />
      )}
    </div>
  )
}
```

---

## Updated `EditorScreen` — key changes

The parent `EditorScreen` must be updated to support the new `MilkdownEditorComponent` contract:

### 1. Add `editorKey` state for controlled remounting

```jsx
const [editorKey, setEditorKey] = useState(0)
const [initialBody, setInitialBody] = useState('')
```

When the user uploads a `.md` file, update `initialBody` and increment `editorKey` to force Milkdown to remount with the new content:

```jsx
function handleUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const { data, content: bodyContent } = matter(event.target.result)
    if (data.title) setTitle(data.title)
    if (data.date) setDate(new Date(data.date).toISOString().slice(0, 10))
    if (data.tags) setTags(Array.isArray(data.tags) ? data.tags.join(', ') : data.tags)
    const newBody = bodyContent.trim()
    setBody(newBody)
    setInitialBody(newBody)
    setEditorKey(k => k + 1) // Force Milkdown remount with new content
  }
  reader.readAsText(file)
}
```

On initial load from API, also set `initialBody`:

```jsx
// Inside loadContent():
const newBody = bodyContent.trim()
setBody(newBody)
setInitialBody(newBody)
// (editorKey stays at 0 — editor hasn't mounted yet)
```

### 2. Pass `onRawInsert` to the component

The raw-mode toolbar buttons need a handler in `EditorScreen` (where the textarea ref lives):

```jsx
function handleRawInsert(button) {
  const textarea = document.querySelector('.ed-raw-textarea')
  if (!textarea) return
  // ... existing handleToolbarInsert logic, unchanged ...
}
```

### 3. Render with `key` prop

```jsx
<MilkdownEditorComponent
  key={editorKey}           // Forces remount when file is uploaded
  initialBody={initialBody} // Starting content — not reactive
  onBodyChange={setBody}    // Called on every edit
  rawMode={rawMode}
  onToggleRawMode={() => setRawMode(r => !r)}
  onRawInsert={handleRawInsert}
/>
```

---

## CSS additions for editor

Add to `cms/src/styles/cms.css`:

```css
/* Editor layout */
.editor-body-wrapper { display: flex; flex-direction: column; flex: 1; }
.ed-toolbar-row { display: flex; align-items: center; gap: 0; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid var(--bd); flex-wrap: wrap; }
.ed-tb { display: flex; gap: 1px; flex-wrap: wrap; flex: 1; }
.mode-toggle { margin-left: auto; background: var(--s3); border: 1px solid var(--bd); border-radius: 3px; padding: 5px 10px; font-size: 10px; font-family: var(--mono); color: var(--ink2); cursor: pointer; white-space: nowrap; }
.mode-toggle:hover { background: var(--s4); color: var(--ink); }
.mode-wysiwyg { color: var(--teal); border-color: var(--teal2); }

/* Milkdown WYSIWYG area */
.ed-milkdown-wrap { flex: 1; min-height: 300px; position: relative; }
.ed-loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-family: var(--mono); font-size: 11px; color: var(--ink4); }

/* Override Milkdown's ProseMirror default styles to match design */
.ed-milkdown-wrap .milkdown { background: transparent; color: var(--ink2); font-family: var(--serif); font-size: 15.5px; line-height: 1.8; padding: 4px 0; outline: none; }
.ed-milkdown-wrap .milkdown p { margin-bottom: 14px; }
.ed-milkdown-wrap .milkdown h1 { font-family: var(--serif); font-size: 26px; font-weight: 500; color: var(--ink); margin: 28px 0 14px; }
.ed-milkdown-wrap .milkdown h2 { font-family: var(--serif); font-size: 22px; font-weight: 500; color: var(--ink); margin: 24px 0 12px; }
.ed-milkdown-wrap .milkdown h3 { font-family: var(--serif); font-size: 18px; font-weight: 500; color: var(--ink); margin: 20px 0 10px; }
.ed-milkdown-wrap .milkdown strong { color: var(--ink); }
.ed-milkdown-wrap .milkdown em { color: var(--ink); }
.ed-milkdown-wrap .milkdown blockquote { border-left: 3px solid var(--teal2); padding-left: 16px; color: var(--ink3); margin: 16px 0; }
.ed-milkdown-wrap .milkdown code { font-family: var(--mono); font-size: 13px; background: var(--s3); padding: 2px 5px; border-radius: 3px; color: var(--teal); }
.ed-milkdown-wrap .milkdown pre { background: var(--s2); border: 1px solid var(--bd); border-radius: 6px; padding: 14px; margin: 16px 0; }
.ed-milkdown-wrap .milkdown pre code { background: none; padding: 0; }
.ed-milkdown-wrap .milkdown a { color: var(--teal); }
.ed-milkdown-wrap .milkdown hr { border: none; border-top: 1px solid var(--bd); margin: 24px 0; }
.ed-milkdown-wrap .milkdown ul { padding-left: 20px; margin-bottom: 14px; }
.ed-milkdown-wrap .milkdown ol { padding-left: 20px; margin-bottom: 14px; }
.ed-milkdown-wrap .milkdown li { margin-bottom: 4px; }

/* Remove Nord theme overrides — if any Nord CSS is still loading, neutralise it */
.milkdown-menu { display: none !important; } /* Nord adds a floating menu — hide it */

/* Raw textarea */
.ed-raw-textarea { width: 100%; flex: 1; min-height: 360px; padding: 16px; font-family: var(--mono); font-size: 13px; line-height: 1.7; background: var(--s2); border: 1px solid var(--bd); border-radius: 4px; color: var(--ink2); resize: vertical; outline: none; transition: border-color .15s; }
.ed-raw-textarea:focus { border-color: var(--teal); }
```

---

## Package.json changes

Remove `@milkdown/theme-nord` — it is no longer used and its CSS overrides break the design:

```bash
npm uninstall @milkdown/theme-nord
```

Verify these remain:
```json
"@milkdown/kit": "^7.0.0",
"@milkdown/react": "^7.0.0"
```

No other packages need to change.

---

## Known limitations and how to handle them

**Toolbar commands in WYSIWYG mode may fail silently** if the editor does not have focus. After any toolbar button click, call `get()?.ctx.get(editorViewCtx).focus()` to ensure focus. Import `editorViewCtx` from `@milkdown/kit/core`.

**Photo insertion in WYSIWYG mode** cannot position content at cursor using standard Milkdown v7 commands — the `insertTextCommand` does not exist as a named export. Use this pattern instead: append to the current markdown body via `onBodyChange`, then call `setEditorKey(k => k + 1)` to remount the editor with the appended content. This is a visible flash but functionally correct. Document this as "photo insertion remounts editor" in a comment.

**The `useEditor` hook** from `@milkdown/react` manages the editor lifecycle. Do not call `Editor.make()` directly — use `useEditor`. The `get()` function returns the editor instance for issuing commands. If `get()` returns `undefined`, the editor is not yet ready — guard with `get()?.action(...)`.

**Inline sync (Typora behaviour)** is provided by the `commonmark` preset in Milkdown v7 via input rules. Typing `**bold**` will render bold inline. If it does not work, check that no plugin is disabling input rules. The Nord theme does not affect this — it is a CSS-only package.

**The `history` plugin** provides Cmd+Z/Ctrl+Z undo support. Include it.

---

## Verification checklist

Before considering the editor complete, verify each item:

- [ ] Open editor, type `**hello**` — asterisks disappear, "hello" renders bold inline
- [ ] Type `# Heading` — renders as H1, `#` disappears
- [ ] Click H1 toolbar button — selected text or current line becomes H1
- [ ] Click H2 toolbar button — renders H2
- [ ] Click B toolbar button — toggles bold on selection
- [ ] Click I toolbar button — toggles italic on selection
- [ ] Click ⊞ Foto button — prompts for URL and caption, inserts image markdown
- [ ] Click ⊟ Foto rechts button — inserts float-right figure HTML
- [ ] Click ⊡ Foto-Paar button — inserts two-column grid HTML
- [ ] Click 👁 WYSIWYG → switches to raw textarea showing markdown source
- [ ] Click 📝 Raw → switches back to WYSIWYG with rendered content
- [ ] In raw mode, click B button — wraps selection in `**`
- [ ] Upload a `.md` file → title, date, tags populate, body loads into editor
- [ ] Download → file is valid markdown, identical to what would be saved to GitHub
- [ ] Save — content round-trips correctly (WYSIWYG → markdown → frontmatter → GitHub)
- [ ] Undo (Cmd+Z) works inside WYSIWYG editor
- [ ] Editor does not flicker or reinitialise while typing
