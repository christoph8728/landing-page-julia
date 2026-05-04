# Design Implementation Brief

## Source of truth

The canonical design is the file `design-preview-v3.html` (attached separately or in this repo).
Open it in a browser — it has a tab switcher for Public Site and CMS Admin.
Every visual decision in this document derives from that file.
Do not invent anything. When in doubt, copy from the HTML mockup.

---

## Fonts (load via Google Fonts in both site and CMS)

```html
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

| Role | Font | Usage |
|---|---|---|
| Headings, body text, hero | EB Garamond | Public site prose, post titles, publication titles, hero name |
| UI chrome, labels, metadata | Instrument Sans | Nav links, sidebar labels, buttons, tags, dates |
| Monospace / metadata | DM Mono | Section kickers, slugs, dates in lists, code, URL bar feel |

---

## Public site — CSS variables

Copy these exactly into `site/static/css/main.css`. They replace anything currently there.

```css
:root {
  --ink:    #1a1714;
  --ink2:   #3d3730;
  --ink3:   #7a7060;
  --ink4:   #a09080;
  --paper:  #f5f2ec;
  --p2:     #ede8df;
  --p3:     #e2dbd0;
  --acc:    #7a4f2a;   /* warm brown — links, hover */
  --acc2:   #3d9e94;   /* muted teal — active links, DOI links */
  --serif:  'EB Garamond', Georgia, serif;
  --sans:   'Instrument Sans', system-ui, sans-serif;
  --mono:   'DM Mono', monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ink:   #e8e0d4;
    --ink2:  #c0b8ac;
    --ink3:  #8a8070;
    --ink4:  #5a5448;
    --paper: #1e1a14;
    --p2:    #252019;
    --p3:    #2e2820;
    --acc:   #c4845a;
    --acc2:  #6aa898;
  }
}
```

---

## Public site — layout and component specs

### Navigation

```
height: 64px
padding: 0 48px (clamp to viewport on mobile)
border-bottom: 1px solid var(--p3)
background: var(--paper)
position: sticky, top: 0
left: monogram/slug in DM Mono 12px, color var(--ink3)
right: nav links in Instrument Sans 13px 500 weight, color var(--ink3)
active link: color var(--ink)
hover: color var(--acc)
```

### Hero (homepage)

Two-column grid: `1fr 220px`. Right column: portrait photo, `object-fit: cover`, full height of hero.

```
left column padding: 72px 48px 64px
hero-label: DM Mono 11px, letter-spacing .14em, uppercase, color var(--ink4), margin-bottom 16px
hero-name: EB Garamond 44px weight 400, letter-spacing -.02em, line-height 1.15
hero-title: Instrument Sans 15px, color var(--ink-mid), margin-bottom 20px
hero-statement: EB Garamond 16px italic, line-height 1.75, color var(--ink2), max-width 520px
                border-left: 2px solid var(--p3), padding-left: 20px, margin-bottom 28px
hero-links: Instrument Sans 12.5px 600, letter-spacing .04em, uppercase
            color var(--acc2), border-bottom 1.5px solid var(--acc2)
            hover: color var(--acc), border-color var(--acc)
```

Photo panel: `background: var(--p2)`. On mobile (< 640px): hide photo, hero goes single column.

### Homepage — two-column body

```
grid: 1fr 260px, max-width 900px, margin 0 auto
main column: padding 48px 48px, border-right 1px solid var(--p3)
aside column: padding 48px 36px
```

### Section headings (kickers)

```css
.section-title {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--acc);   /* amber/brown */
}
```

Always paired with a `→ All X` link right-aligned, Instrument Sans 12px, color var(--ink4).

### Publication entries (homepage + list page)

```
layout: grid 48px 1fr, gap 16px
year column: DM Mono 11px, color var(--ink4), padding-top 3px
title: EB Garamond 15.5px weight 500, color var(--ink), line-height 1.45
        hover: color var(--acc2)
authors: EB Garamond 13px italic, color var(--ink3)
venue: Instrument Sans 12.5px, color var(--ink4)
DOI/PDF links: Instrument Sans 11.5px 600, color var(--acc2), hover color var(--acc)
tags: DM Mono 10px 500, uppercase, letter-spacing .06em
      background var(--p2), color var(--acc2), padding 3px 8px, border-radius 2px
separator: 1px solid var(--p3) below each entry except last
```

Publications page groups by year with a `DM Mono 11px uppercase` year label + 1px rule.
Book covers: 80px wide, height 108px, object-fit cover, border-radius 2px, box-shadow 2px 3px 8px rgba(0,0,0,.15).

### Blog post cards (homepage) — three card types

**Card A (feature post — full-width image header):**
```
image: width 100%, height 220px, object-fit cover, border-radius 3px, margin-bottom 16px
image caption: DM Mono 9.5px italic, color var(--ink4)
kicker: DM Mono 10px uppercase letter-spacing .14em, color var(--ink4), margin-bottom 6px
title: EB Garamond 18px weight 500, line-height 1.35
summary: Instrument Sans 13px, color var(--ink3), line-height 1.55
read more: Instrument Sans 12px 600, color var(--acc2), display inline-block margin-top 8px
separator below: 1px solid var(--p3), padding-bottom 36px
```

**Card B (secondary — float-left image):**
```
layout: grid 160px 1fr, gap 20px, align-items start
image: 160px × 120px, object-fit cover, border-radius 3px
title: EB Garamond 16px weight 400
```

**Card C (text only — news/short items):**
```
layout: grid 100px 1fr, gap 20px
date: DM Mono 10.5px, color var(--ink4)
title: EB Garamond 16px weight 400
```

### Blog post detail page

**Hero:** full-bleed image, height 360px. Dark gradient overlay bottom-to-top (`rgba(20,15,10,.72) → transparent`). Title and kicker overlaid in warm white (`#f0e8d2`).

**Body:** `max-width 680px, margin 0 auto, padding 52px`

**Prose typography:**
```
p: EB Garamond 17.5px, line-height 1.75, color var(--ink2), margin-bottom 22px
strong: color var(--ink)
em: color var(--ink)
h2: EB Garamond 24px 500, margin 40px 0 16px, color var(--ink)
```

**Inline images — three layouts:**
1. Full-width: `width 100%, margin 32px 0, border-radius 2px`
2. Float right: `float right, margin 4px 0 20px 28px, width 240px`
3. Image pair: `display grid, grid-template-columns 1fr 1fr, gap 12px, margin 32px 0`

All images: `border-radius: 2px`. Captions: DM Mono 10px italic, color var(--ink4), margin-top 8px.

### News items (aside)

```
date: DM Mono 10px, color var(--ink4), margin-bottom 3px
text: Instrument Sans 12.5px, color var(--ink2), line-height 1.5
separator: 1px solid var(--p3) below each item except last
```

News items in the aside may have a photo thumbnail (100% wide, 100px tall, object-fit cover, border-radius 3px, margin-bottom 8px).

### Footer

```
border-top: 1px solid var(--p3)
padding: 32px 48px
display flex, justify-content space-between
font: DM Mono 10.5px, color var(--ink4), letter-spacing .04em
```

---

## CMS admin — CSS variables

The CMS uses a dark theme. Copy these into `cms/src/styles/cms.css`.

```css
:root {
  --s0: #1e1a14;    /* darkest — sidebar background */
  --s1: #252019;    /* main content background */
  --s2: #2e2820;    /* card / input background */
  --s3: #3a3228;    /* hover state */
  --s4: #443c30;    /* active / selected */
  --bd: #3a3228;    /* border color */
  --ink:  #f0ebe3;  /* primary text */
  --ink2: #b8ad9e;  /* secondary text */
  --ink3: #7a6e60;  /* dimmed text */
  --ink4: #42403a;  /* very dim / disabled */
  --teal: #2a7a72;  /* primary action (save, publish) */
  --teal2: #3d9e94; /* teal hover */
  --amber: #8b6f47; /* secondary action (new post) */
  --amber2: #a88050;/* amber hover */
  --red: #8b4a4a;   /* destructive (delete hover) */
}
```

### CMS — Sidebar

```
width: 220px
background: var(--s0)
border-right: 1px solid var(--bd)
padding: 24px 0

Logo block:
  padding: 0 20px 24px
  border-bottom: 1px solid var(--bd)
  name: EB Garamond 15px weight 400, color var(--ink)
  url: DM Mono 11px, color var(--ink4)

Nav section label:
  font: Instrument Sans 10px 600, letter-spacing .12em, uppercase, color var(--ink4)
  padding: 0 8px, margin-bottom 4px

Nav item:
  padding: 9px 8px
  border-radius: 6px
  font: Instrument Sans 13.5px, color var(--ink2)
  pip: 6px circle, color var(--ink4), flex-shrink 0
  active: background var(--s3), color var(--ink)
  hover: background var(--s2), color var(--ink)
  count badge: DM Mono 10px, color var(--ink4), background var(--s2), padding 2px 6px, border-radius 3px

Teal pip color: var(--teal2)
Amber pip color: var(--amber2)

Footer:
  border-top: 1px solid var(--bd)
  padding: 16px 20px 0
  avatar: 28px circle, background var(--teal), color white, font 11px 600
  label: DM Mono 12px, color var(--ink4)
```

### CMS — Topbar

```
height: 56px
border-bottom: 1px solid var(--bd)
padding: 0 28px
page title: Instrument Sans 15px 600, color var(--ink)
actions: flex, gap 8px
```

### CMS — Buttons

```css
/* Base */
.btn {
  border: none; border-radius: 6px;
  font-family: var(--sans); font-size: 13px; font-weight: 600;
  cursor: pointer; letter-spacing: .02em;
  transition: background .15s, transform .1s;
}
.btn:hover { transform: translateY(-1px); }

/* Sizes */
.btn-sm  { padding: 8px 16px; font-size: 12px; border-radius: 5px; }
.btn-xs  { padding: 5px 10px; font-size: 11px; border-radius: 4px; }

/* Variants */
.btn-teal   { background: var(--teal);  color: #fff; }
.btn-amber  { background: var(--amber); color: #fff; }
.btn-ghost  { background: transparent; color: var(--ink2); border: 1px solid var(--bd); }
.btn-ghost:hover { background: var(--s3); transform: none; }
```

### CMS — Dashboard

```
padding: 28px
display grid, grid-template-columns 1fr 1fr, gap 16px

Card:
  background: var(--s2)
  border: 1px solid var(--bd)
  border-radius: 10px
  padding: 20px 24px
  cursor pointer
  hover: border-color var(--s4), transform translateY(-2px)

  count: DM Mono 28px 500, color var(--ink), line-height 1
  label: Instrument Sans 12px, color var(--ink4), font-weight 500
  arrow (→): float right, color var(--ink4), font-size 18px, margin-top -40px
```

### CMS — Post list table

```
th: Instrument Sans 10px 600, letter-spacing .1em, uppercase, color var(--ink4), padding 12px 28px
td: padding 14px 28px, font-size 13.5px, color var(--ink2)
row hover: background var(--s2)
separator: 1px solid var(--bd) below each row

title cell: Instrument Sans 14px 500, color var(--ink)
slug cell: DM Mono 11px, color var(--ink4)
thumbnail: 44px × 32px, border-radius 2px, object-fit cover

Status badges:
  published: background rgba(42,122,114,.15), color var(--teal2), DM Mono 10px uppercase
  draft:     background rgba(139,111,71,.12), color var(--amber2), DM Mono 10px uppercase

Action buttons: border 1px solid var(--bd), border-radius 5px
  hover edit:   background var(--s3), color var(--ink)
  hover delete: border-color var(--red), color var(--red), background rgba(139,74,74,.08)
```

### CMS — Editor

```
layout: grid 1fr 260px, min-height 500px
left panel: border-right 1px solid var(--bd), padding 28px

Markdown upload strip (top of editor):
  background var(--s2), border 1px solid var(--bd), border-radius 6px
  padding 10px 14px, margin-bottom 14px
  Upload label: DM Mono 11px 500, uppercase, color var(--teal)
                border 1px solid var(--teal2), border-radius 4px, padding 4px 10px
  Hint text: Instrument Sans 12px, color var(--ink3)

Title input:
  background transparent, border none
  font: EB Garamond 26px 500, color var(--ink)
  border-bottom: 2px solid var(--bd), padding-bottom 16px, margin-bottom 20px
  focus: border-bottom-color var(--teal)
  placeholder: color var(--ink4)

Toolbar:
  DM Mono 12px 600, color var(--ink4)
  button padding: 6px 10px, border-radius 4px
  hover: background var(--s3), color var(--ink)
  separator: 1px solid var(--bd), margin 4px
  Photo buttons highlighted: background rgba(42,122,114,.1), color var(--teal)
                              border 1px solid rgba(42,122,114,.2)

Milkdown editor area:
  font: EB Garamond 15px, line-height 1.8, color var(--ink2)
  min-height: 300px

Inline image block (inside editor):
  background var(--s2), border 1px solid var(--bd), border-radius 4px, margin 14px 0
  caption input: DM Mono 10px, color var(--ink3), border-top 1px solid var(--bd), padding 7px 12px

Right sidebar:
  padding: 24px
  gap between fields: 20px

  Field label: Instrument Sans 10px 600, letter-spacing .1em, uppercase, color var(--ink4)
  Field input: background var(--s2), border 1px solid var(--bd), border-radius 5px
               DM Mono 12px, color var(--ink), padding 9px 12px
               focus: border-color var(--teal)

  Status toggle:
    two options side by side, border-radius 6px, overflow hidden, border 1px solid var(--bd)
    inactive: background var(--s2), color var(--ink4), DM Mono 11px
    active:   background var(--teal), color white

  Save/Preview buttons at bottom of sidebar, stacked, full width
```

### CMS — Media library

```
Upload drop zone:
  border: 2px dashed var(--bd), border-radius 8px
  padding 32px, text-align center, margin-bottom 16px
  hover: border-color var(--teal2)
  icon: 28px, opacity .4
  text: Instrument Sans 13px, color var(--ink3)
  sub: DM Mono 10px, color var(--ink4)

Grid: 4 columns, gap 8px

Item:
  border: 2px solid transparent, border-radius 4px
  hover: border-color var(--teal)
  selected: border-color var(--teal)
  thumbnail: 100% wide, 72px tall, object-fit cover
  filename: DM Mono 9px, color var(--ink4), padding 5px 6px, background var(--s2)
            white-space nowrap, overflow hidden, text-overflow ellipsis
```

### CMS — BibTeX import

```
Textarea:
  background var(--s2), border 1px solid var(--bd), border-radius 8px
  padding 16px, DM Mono 11px, color var(--ink2)
  height 200px, resize vertical, line-height 1.65
  focus: border-color var(--teal)

Preview box:
  background var(--s2), border 1px solid var(--bd), border-radius 8px, overflow hidden

Preview header:
  padding 10px 16px, border-bottom 1px solid var(--bd)
  DM Mono 9.5px 500, uppercase, color var(--ink3)
  Count badge: background var(--teal), color white, 10px, padding 2px 8px, border-radius 10px

Preview row: padding 12px 16px, grid 1fr auto, gap 12px
  title: Instrument Sans 13px 500, color var(--ink)
  meta: DM Mono 11px, color var(--ink4)
  type badge: background rgba(42,122,114,.12), color var(--teal2), DM Mono 10px, padding 3px 8px, border-radius 3px
```

---

## Login screen (CMS)

```
Full viewport, centered flex
background: var(--s1)

Card: max-width 360px

Wordmark: EB Garamond 22px weight 400, color var(--ink), letter-spacing -.01em
Subline: DM Mono 11px, color var(--ink4), letter-spacing .06em, margin-bottom 40px

Label: Instrument Sans 10px 600, letter-spacing .1em, uppercase, color var(--ink3)
Input: background var(--s2), border 1px solid var(--bd), DM Mono 14px
       padding 12px 16px, border-radius 6px
       focus: border-color var(--teal)
       placeholder: color var(--ink4)

Button: full width, background var(--teal), DM Sans 14px 600, padding 13px 24px, border-radius 6px
```

---

## What to implement

### `site/static/css/main.css`
Replace entirely with the design spec above. Do not keep any existing styles.

### `cms/src/styles/cms.css`
Replace entirely. Every CMS component must use the variables and specs above.

### Hugo layouts
The HTML structure in the layouts should match what the CSS classes expect. The design preview shows the exact component structure — use it as the reference for class names. Every class referenced in the CSS spec above must have a corresponding element in the Hugo templates or React components.

### React CMS components
All screen components must be updated to use the correct class names from the CSS. The visual output must match `design-preview-v3.html` tab by tab.

### What NOT to change
- `worker/src/index.js` — no design changes needed
- `sync/sync.js` — no design changes needed
- YAML frontmatter structure — no changes
- Hugo data files — no changes

---

## Verification

When complete, the following must be true:

1. The public site homepage matches the "Home" tab of `design-preview-v3.html` — hero layout, fonts, colors, section headings, publication entries, blog card types.
2. A blog post detail page matches the "Blog post" tab — full-bleed hero image, prose typography, inline image layouts.
3. The CMS login screen matches the "Login" tab.
4. The CMS dashboard matches the "Dashboard" tab — dark theme, sidebar, four cards.
5. The CMS post list matches the "Post List" tab — table with thumbnails, badges, action buttons.
6. The CMS editor matches the "Editor" tab — markdown upload strip, Garamond title, toolbar, sidebar fields.
7. The BibTeX import screen matches the "BibTeX" tab.
8. All fonts are loading correctly (EB Garamond, Instrument Sans, DM Mono).
9. Dark mode works on the public site (`@media prefers-color-scheme: dark`).
10. The site is mobile-responsive — test at 375px viewport width.
