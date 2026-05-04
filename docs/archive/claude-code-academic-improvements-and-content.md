# Task: Academic Site Improvements + Content Population

## Context

This is a custom-built academic personal website for Dr. Julia Schneidawind, a historian at LMU Munich (Lehrstuhl für Jüdische Geschichte und Kultur). See `CLAUDE.md` for the full project architecture. The site uses Hugo for static generation, a Cloudflare Worker as a CMS API, and Cloudflare Pages for hosting. Content is plain markdown with YAML frontmatter.

This task has two parts:
1. Academic-specific site improvements (features her audience expects)
2. Content population from her existing university profile

---

## PART 1: Academic Site Improvements

---

### 1. Citation Export on Publication Pages

#### Why this matters
Researchers visiting a publication page want to grab the BibTeX entry for their own paper. This is the single most expected feature on an academic site. Without it, they have to manually type the reference.

#### Implementation

**Create `site/layouts/partials/bibtex-entry.html`:**

A Hugo partial that generates a BibTeX string from publication frontmatter.

```html
{{ $type := .Params.bibtex_type | default "article" }}
{{ $key := .File.ContentBaseName }}
@{{ $type }}{ {{ $key }},
  author = { {{ delimit .Params.authors " and " }} },
  title = { {{ .Title }} },
  {{ with .Params.venue }}journal = { {{ . }} },{{ end }}
  {{ with .Params.booktitle }}booktitle = { {{ . }} },{{ end }}
  {{ with .Params.publisher }}publisher = { {{ . }} },{{ end }}
  year = { {{ .Params.year }} },
  {{ with .Params.volume }}volume = { {{ . }} },{{ end }}
  {{ with .Params.number }}number = { {{ . }} },{{ end }}
  {{ with .Params.pages }}pages = { {{ . }} },{{ end }}
  {{ with .Params.doi }}doi = { {{ . }} },{{ end }}
  {{ with .Params.url }}url = { {{ . }} },{{ end }}
}
```

**Add to the publication single template (`site/layouts/publications/single.html`):**

```html
<details class="citation-block">
  <summary>Zitieren / Cite (BibTeX)</summary>
  <pre class="bibtex-code" id="bibtex-{{ .File.ContentBaseName }}"><code>{{ partial "bibtex-entry.html" . }}</code></pre>
  <button class="copy-bibtex" data-target="bibtex-{{ .File.ContentBaseName }}">
    Kopieren
  </button>
  <a class="download-bibtex" href="#" data-target="bibtex-{{ .File.ContentBaseName }}" download="{{ .File.ContentBaseName }}.bib">
    .bib herunterladen
  </a>
</details>
```

**Create `site/static/js/citation.js`:**

```javascript
(function() {
  // Copy to clipboard
  document.querySelectorAll('.copy-bibtex').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pre = document.getElementById(this.dataset.target);
      navigator.clipboard.writeText(pre.textContent).then(function() {
        btn.textContent = 'Kopiert!';
        setTimeout(function() { btn.textContent = 'Kopieren'; }, 2000);
      });
    });
  });

  // Download as .bib file
  document.querySelectorAll('.download-bibtex').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var pre = document.getElementById(this.dataset.target);
      var blob = new Blob([pre.textContent], { type: 'application/x-bibtex' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = this.getAttribute('download');
      a.click();
      URL.revokeObjectURL(url);
    });
  });
})();
```

**CSS for citation block:**

```css
.citation-block {
  margin: 24px 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.citation-block summary {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background: #f8f8f8;
}

.bibtex-code {
  padding: 16px;
  background: #f5f5f5;
  font-size: 13px;
  overflow-x: auto;
  margin: 0;
}

.copy-bibtex, .download-bibtex {
  display: inline-block;
  padding: 6px 14px;
  margin: 8px 8px 12px 16px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  text-decoration: none;
}

.copy-bibtex:hover, .download-bibtex:hover {
  background: #f0f0f0;
}
```

---

### 2. Google Scholar Meta Tags

#### Why this matters
Without these, Google Scholar's crawler cannot index her publications. They will be invisible to the most important academic search engine. This is non-negotiable.

#### Implementation

In `site/layouts/partials/head.html`, add for publication pages:

```html
{{ if eq .Section "publications" }}
  <meta name="citation_title" content="{{ .Title }}" />
  {{ range .Params.authors }}
  <meta name="citation_author" content="{{ . }}" />
  {{ end }}
  {{ with .Params.year }}<meta name="citation_publication_date" content="{{ . }}" />{{ end }}
  {{ with .Params.venue }}<meta name="citation_journal_title" content="{{ . }}" />{{ end }}
  {{ with .Params.booktitle }}<meta name="citation_conference_title" content="{{ . }}" />{{ end }}
  {{ with .Params.publisher }}<meta name="citation_publisher" content="{{ . }}" />{{ end }}
  {{ with .Params.doi }}<meta name="citation_doi" content="{{ . }}" />{{ end }}
  {{ with .Params.pdf }}<meta name="citation_pdf_url" content="{{ $.Site.BaseURL }}{{ . }}" />{{ end }}
  {{ with .Params.isbn }}<meta name="citation_isbn" content="{{ . }}" />{{ end }}
{{ end }}
```

**Important:** Google Scholar requires at minimum `citation_title`, `citation_author`, and `citation_publication_date`. The rest are strongly recommended.

---

### 3. ORCID Integration

Add `orcid` field to `site/_data/profile.yaml` (see Part 2 for the full profile content). If Julia doesn't have an ORCID yet, leave the field empty — but include it in the schema so it's ready.

In the site's profile/about section, render the ORCID with the official icon:

```html
{{ with .Site.Data.profile.orcid }}
<a href="https://orcid.org/{{ . }}" target="_blank" rel="noopener" class="orcid-link">
  <img src="/images/orcid-icon.svg" alt="ORCID" width="16" height="16" />
  {{ . }}
</a>
{{ end }}
```

Download the official ORCID icon SVG from https://info.orcid.org/brand-guidelines/ and save to `site/static/images/orcid-icon.svg`.

Also add ORCID to the structured data (in the Person schema on the homepage):

```json
"sameAs": ["https://orcid.org/{{ .Site.Data.profile.orcid }}"]
```

---

### 4. Email Obfuscation

#### The problem
The LMU page openly displays her email address. Academic sites are prime targets for email scrapers. Don't reproduce that mistake.

#### Implementation

**Do not put the email in profile.yaml as plain text.**

Instead, store it encoded. In `site/_data/profile.yaml`:

```yaml
email_user: "julia.schneidawind"
email_domain: "lrz.uni-muenchen.de"
```

In the template, construct the email client-side:

```html
<span class="email-protected" data-u="{{ .Site.Data.profile.email_user }}" data-d="{{ .Site.Data.profile.email_domain }}">
  [E-Mail-Adresse wird im Browser angezeigt]
</span>
```

**JavaScript (`site/static/js/email.js`):**

```javascript
(function() {
  document.querySelectorAll('.email-protected').forEach(function(el) {
    var u = el.dataset.u;
    var d = el.dataset.d;
    var addr = u + '@' + d;
    var link = document.createElement('a');
    link.href = 'mailto:' + addr;
    link.textContent = addr;
    el.replaceWith(link);
  });
})();
```

This is invisible to scrapers (they see the placeholder text in raw HTML) but renders the full mailto link for real visitors.

---

### 5. Print Stylesheet

Academics print pages. Make it not look broken.

**Create `site/static/css/print.css` or add to existing stylesheet:**

```css
@media print {
  /* Hide non-content elements */
  nav, footer, .lightbox-overlay, .reading-progress,
  .copy-bibtex, .download-bibtex, .email-protected,
  button, .nav-toggle { display: none !important; }

  /* Clean typography */
  body {
    font-size: 11pt;
    line-height: 1.5;
    color: #000;
    background: #fff;
    max-width: 100%;
    margin: 0;
    padding: 20mm;
  }

  /* Show URLs for links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 9pt;
    color: #666;
  }

  /* Keep citation blocks visible and open */
  .citation-block { border: 1px solid #ccc; }
  .citation-block[open] summary { border-bottom: 1px solid #ccc; }

  /* Avoid page breaks inside entries */
  .publication-entry, article { page-break-inside: avoid; }

  /* Header info */
  h1 { font-size: 18pt; margin-bottom: 4pt; }
  h2 { font-size: 14pt; }
}
```

Include in head:

```html
<link rel="stylesheet" href="/css/print.css" media="print" />
```

---

### 6. Publication Type Filtering

#### Current state
Publications render as a flat list grouped by type (monographs, edited volumes, articles). This works now but won't scale.

#### Future-proofing

Ensure the frontmatter schema includes a `type` field for all publications:

```yaml
type: "monograph" | "edited_volume" | "article" | "book_chapter" | "newspaper" | "review"
```

For now, Hugo can group by type using `{{ range .Pages.GroupByParam "type" }}`. No JS filtering needed yet — the Hugo template handles it. But having the `type` field in every publication frontmatter now means filtering can be added later without re-editing every file.

---

### 7. Media/Press Section

Julia has significant media coverage (Deutschlandfunk, FAZ, ZEIT, SZ, taz, BR). This deserves its own section, separate from publications. Create a `news` content type for this — the architecture already supports it.

See Part 2 for the actual content items to create.

---

## PART 2: Content Population

Create the following files from the scraped university profile. All content is derived from her public LMU page.

---

### Profile Data

**Create `site/_data/profile.yaml`:**

```yaml
name: "Dr. Julia Schneidawind"
title: "Historikerin"
position: "Akademische Rätin auf Zeit"
institution: "Ludwig-Maximilians-Universität München"
department: "Lehrstuhl für Jüdische Geschichte und Kultur"
address: |
  Historisches Seminar der LMU
  Jüdische Geschichte und Kultur
  Geschwister-Scholl-Platz 1
  80539 München
email_user: "julia.schneidawind"
email_domain: "lrz.uni-muenchen.de"
phone: "+49 (0) 89 / 2180-6769"
orcid: ""  # Add when available
bio: |
  Dr. Julia Schneidawind ist seit Oktober 2022 Wissenschaftliche Assistentin und Akademische Rätin a.Z. am Lehrstuhl für Jüdische Geschichte und Kultur der Ludwig-Maximilians-Universität München. Zuvor war sie als Wissenschaftliche Mitarbeiterin an der Bayerischen Akademie der Wissenschaften im Forschungsprojekt Judentum in Bayern tätig. Ihre Dissertation erschien im Oktober 2023 unter dem Titel Schicksale und ihre Bücher. Deutsch-jüdische Privatbibliotheken zwischen Jerusalem, Tunis und Los Angeles (Vandenhoeck & Ruprecht) und wurde mit dem Eduard-Dukesz-Preis 2023 ausgezeichnet. Sie forscht schwerpunktmäßig zur Migrations- und Kulturgeschichte des 19. und 20. Jahrhunderts, zu Material Culture Studies, Holocaustforschung und Frauengeschichte.
research_interests:
  - "Migrations- und Kulturgeschichte des 19. und 20. Jahrhunderts"
  - "Material Culture Studies"
  - "Holocaustforschung"
  - "Frauengeschichte"
  - "Deutsch-jüdische Geschichte"
photo: "/images/profile/schneidawind.jpg"
cv_de: "/files/julia-schneidawind-de.pdf"
cv_en: "/files/julia-schneidawind-en.pdf"
links:
  lmu: "https://www.jgk.geschichte.uni-muenchen.de/jgk_neuzeit/personen/mitarbeiter/schneidawind/index.html"
```

**Note:** Download her profile photo from the LMU page and save to `site/static/images/profile/schneidawind.jpg`. Also download both CV PDFs and save to `site/static/files/`.

---

### Publications

**Create one markdown file per publication in `site/content/publications/`:**

**`site/content/publications/2023-schicksale-und-ihre-buecher.md`:**

```yaml
---
title: "Schicksale und ihre Bücher. Deutsch-jüdische Privatbibliotheken zwischen Jerusalem, Tunis und Los Angeles"
authors: ["Julia Schneidawind"]
year: 2023
type: "monograph"
publisher: "Vandenhoeck & Ruprecht"
highlight: true
bibtex_type: "book"
awards: ["Eduard-Dukesz-Preis 2023"]
url: "https://www.vandenhoeck-ruprecht-verlage.com/themen-entdecken/theologie-und-religion/religionswissenschaft/58588/schicksale-und-ihre-buecher"
date: 2023-10-01
---
```

**`site/content/publications/2023-dialog-mit-zukunft.md`:**

```yaml
---
title: "Dialog mit Zukunft? Christlich-jüdische Begegnung und die 'Woche der Brüderlichkeit'"
authors: ["Torsten Lattki", "Julia Schneidawind"]
year: 2023
type: "edited_volume"
venue: "Münchner Beiträge zur Jüdischen Geschichte und Kultur"
volume: "1/2023"
bibtex_type: "book"
date: 2023-01-01
---
```

**`site/content/publications/2019-buecherspuren.md`:**

```yaml
---
title: "Bücherspuren. Karl Wolfskehls Deutsch-Jüdische Bibliothek"
authors: ["Caroline Jessen", "Julia Schneidawind"]
year: 2019
type: "edited_volume"
venue: "Münchner Beiträge zur Jüdischen Geschichte und Kultur"
volume: "2/2019"
bibtex_type: "book"
date: 2019-01-01
---
```

**`site/content/publications/2025-von-altona-nach-melbourne.md`:**

```yaml
---
title: "Von Altona nach Melbourne. Deutschsprachige Jüdinnen und Juden in Australien"
authors: ["Julia Schneidawind"]
year: 2025
type: "article"
venue: "Geschichte[n] der deutsch-jüdischen Diaspora"
url: "https://diaspora.juedische-geschichte-online.net/beitrag/gjd:article-9"
bibtex_type: "article"
date: 2025-05-08
---
```

**`site/content/publications/2024-tor-zur-schoa.md`:**

```yaml
---
title: "Das Tor zur Schoa"
authors: ["Julia Schneidawind", "Kristina Milz"]
year: 2024
type: "newspaper"
venue: "Frankfurter Allgemeine Zeitung"
date: 2024-11-25
bibtex_type: "article"
---
```

**`site/content/publications/2024-meine-klasse.md`:**

```yaml
---
title: "Meine Klasse. Wer hat überlebt???"
authors: ["Julia Schneidawind", "Kristina Milz"]
year: 2024
type: "newspaper"
venue: "DIE ZEIT"
pages: "14-15"
url: "https://www.zeit.de/2024/22/juedische-kinder-lebenswege-nationalsozialismus-historiker"
date: 2024-05-16
bibtex_type: "article"
---
```

**`site/content/publications/2024-autobiographische-zeugnisse.md`:**

```yaml
---
title: "Autobiographische Zeugnisse"
authors: ["Julia Schneidawind"]
year: 2024
type: "book_chapter"
booktitle: "Provenienz. Materialgeschichte(n) in der Literatur"
publisher: "Göttingen"
editors: ["Sarah Gaber", "Stefan Höppner", "Stefanie Hundehege"]
bibtex_type: "incollection"
date: 2024-01-01
---
```

**`site/content/publications/2022-friendship-ex-libris.md`:**

```yaml
---
title: "A friendship ex libris — Salman Schocken, Karl Wolfskehl and their libraries"
authors: ["Julia Schneidawind"]
year: 2022
type: "article"
venue: "The Leo Baeck Institute Year Book"
volume: "67"
number: "1"
pages: "174-194"
doi: "10.1093/leobaeck/ybac013"
language: "en"
bibtex_type: "article"
date: 2022-01-01
---
```

**`site/content/publications/2021-diaspora-of-books.md`:**

```yaml
---
title: "Diaspora of Books. Franz Rosenzweig's Library in Tunis"
authors: ["Julia Schneidawind"]
year: 2021
type: "article"
venue: "Jewish Culture and History"
volume: "22"
number: "2"
pages: "140-153"
language: "en"
bibtex_type: "article"
date: 2021-01-01
---
```

**`site/content/publications/2021-auf-abwegen.md`:**

```yaml
---
title: "Auf Abwegen. Franz Rosenzweigs Bibliothek"
authors: ["Julia Schneidawind", "Norbert Waszek"]
year: 2021
type: "article"
venue: "Jüdische Geschichte und Kultur. Magazin des Dubnow-Instituts"
number: "5"
pages: "12-13"
bibtex_type: "article"
date: 2021-01-01
---
```

**`site/content/publications/2020-blockbuecher-aufhaeuser.md`:**

```yaml
---
title: "Zwei wertvolle Blockbücher aus dem Besitz der Münchner Familie Aufhäuser. Eine Spurensuche"
authors: ["Julia Schneidawind"]
year: 2020
type: "article"
venue: "Aus dem Antiquariat"
number: "4/2020"
pages: "158-164"
bibtex_type: "article"
date: 2020-01-01
---
```

**`site/content/publications/2015-tuerkentaufen.md`:**

```yaml
---
title: "Türkentaufen"
authors: ["Julia Schneidawind"]
year: 2015
type: "book_chapter"
booktitle: "Pfarrmatrikeln im Erzbistum München und Freising. Geschichte — Archivierung — Auswertung"
publisher: "Regensburg"
volume: "19"
editors: ["Peter Pfister"]
bibtex_type: "incollection"
date: 2015-01-01
---
```

---

### Projects

**Create project files in `site/content/projects/`:**

**`site/content/projects/habilitation.md`:**

```yaml
---
title: "Gewalt, Geschlecht und Marginalisierung"
subtitle: "Strukturen und Praktiken geschlechtsspezifischer Gewalt gegen Frauen im Nachkriegsdeutschland (1945–1955)"
type: "Habilitationsprojekt"
status: "laufend"
featured: true
date: 2024-01-01
---

Habilitationsprojekt zur Alltagsgeschichte der Gewalt gegen Frauen im langen 20. Jahrhundert.
```

**`site/content/projects/rosenzweig-bibliothek.md`:**

```yaml
---
title: "Die Bibliothek Franz Rosenzweigs"
subtitle: "Inventarisierung des Inhalts der Bibliothek Franz Rosenzweig in der Nationalbibliothek von Tunesien"
status: "laufend"
featured: true
date: 2023-01-01
---

Inhaltliche Erschließung der Bibliothek Franz Rosenzweigs, die heute in der Nationalbibliothek von Tunesien aufbewahrt wird.
```

**`site/content/projects/klassenfoto.md`:**

```yaml
---
title: "Das Klassenfoto"
subtitle: "Das Schicksal einer jüdischen Schulklasse"
collaborators: ["Dr. Kristina Milz"]
status: "laufend"
featured: true
url: "https://www.jgk.geschichte.uni-muenchen.de/jgk_neuzeit/forschungsprojekte/laufende_forschungsprojekte/das-klassenfoto/index.html"
date: 2023-01-01
---

Gemeinsames Forschungsprojekt mit Dr. Kristina Milz zur Rekonstruktion der Lebensgeschichten einer jüdischen Schulklasse.
```

**`site/content/projects/israelbilder.md`:**

```yaml
---
title: "Israel-Bilder und Antisemitismus in der deutschen Gesellschaft"
collaborators: ["Dr. Ghilad H. Shenhav"]
status: "laufend"
featured: true
url: "https://www.jgk.geschichte.uni-muenchen.de/jgk_neuzeit/forschungsprojekte/laufende_forschungsprojekte/israelbilder/index.html"
date: 2023-01-01
---

Forschungsprojekt zu Israel-Bildern und Antisemitismus in der deutschen Gesellschaft (gemeinsam mit Dr. Ghilad H. Shenhav).
```

---

### News / Media Coverage

**Create news items in `site/content/news/`:**

**`site/content/news/2025-08-br-radiowissen.md`:**

```yaml
---
title: "BR Radiowissen: Schrittweise frei — Die jüdische Bevölkerung Bayerns im 19. Jahrhundert"
date: 2025-08-12
type: "interview"
outlet: "Bayern 2 / Radiowissen"
url: "https://www.br.de/mediathek/podcast/radiowissen/schrittweise-frei-die-juedische-bevoelkerung-bayerns-im-19-jahrhundert/2109460"
---
```

**`site/content/news/2025-05-br-eins-zu-eins.md`:**

```yaml
---
title: "Bayern 2: Eins zu Eins — Der Talk"
date: 2025-05-06
type: "interview"
outlet: "Bayern 2"
url: "https://www.br.de/mediathek/podcast/eins-zu-eins-der-talk/julia-schneidawind-historikerin-fand-in-tunis-eine-verloren-geglaubte-bibliothek/2106117"
---
```

**`site/content/news/2025-04-taz-bibliothek.md`:**

```yaml
---
title: "Die verloren geglaubte Bibliothek"
date: 2025-04-05
type: "press"
outlet: "taz"
author: "Klaus Hillenbrand"
url: "https://taz.de/Juedische-Bibliothek-in-Tunesien/!6073880/"
---
```

**`site/content/news/2024-11-sz-klassenfoto.md`:**

```yaml
---
title: "Auf den Spuren von 999 jüdischen Kindern, Frauen und Männern"
date: 2024-11-30
type: "press"
outlet: "Süddeutsche Zeitung"
author: "Katharina Haase"
url: "https://www.sueddeutsche.de/projekte/artikel/muenchen/muenchen-nationalsozialismus-juedische-kinder-kaunas-litauen-mord-e287421/"
---
```

**`site/content/news/2024-06-dlf-interview.md`:**

```yaml
---
title: "Deutschlandfunk: Schicksale und ihre Bücher"
date: 2024-06-06
type: "interview"
outlet: "Deutschlandfunk"
interviewer: "Carsten Hueck"
url: "https://www.deutschlandfunk.de/julia-schneidawind-zu-schicksale-und-ihre-buecher-dlf-40fc673a-100.html"
---
```

**`site/content/news/2024-02-faz-rezension.md`:**

```yaml
---
title: "FAZ-Rezension: Exilierte Bücher"
date: 2024-02-08
type: "review"
outlet: "Frankfurter Allgemeine Zeitung"
author: "Wolfgang Matz"
url: "https://www.faz.net/aktuell/feuilleton/buecher/julia-schneidawinds-schicksale-und-ihre-buecher-19506192.html"
---
```

**`site/content/news/2024-02-lmu-news.md`:**

```yaml
---
title: "LMU News: Verlorene Bücher, geraubte Heimat"
date: 2024-02-05
type: "press"
outlet: "LMU München Newsroom"
url: "https://www.lmu.de/de/newsroom/newsuebersicht/news/verlorene-buecher-geraubte-heimat.html"
---
```

**`site/content/news/2023-08-juedische-allgemeine.md`:**

```yaml
---
title: "Exil der Bücher"
date: 2023-08-30
type: "press"
outlet: "Jüdische Allgemeine"
author: "Nora Niemann"
---
```

---

## PART 3: Testing Checklist

After implementation, verify each feature:

### Content population
- [ ] Homepage renders with name, title, bio from `profile.yaml`
- [ ] Publications page shows all 11 publications, grouped by type (monographs, edited volumes, articles, newspaper, book chapters)
- [ ] Publications are sorted by year, newest first within each group
- [ ] All 4 projects render on the projects page/section
- [ ] All 7 news items render, sorted by date, newest first
- [ ] Profile photo displays correctly
- [ ] CV download links work (both DE and EN)

### Citation export
- [ ] Each publication page has a "Zitieren / Cite (BibTeX)" expandable section
- [ ] Clicking "Kopieren" copies the BibTeX entry to clipboard
- [ ] Clicking ".bib herunterladen" downloads a `.bib` file
- [ ] The BibTeX output is valid (paste into a BibTeX validator or import into Zotero)

### Google Scholar meta tags
- [ ] View source on any publication page — verify `citation_title`, `citation_author`, `citation_publication_date` meta tags are present
- [ ] For journal articles, verify `citation_journal_title` is present
- [ ] For entries with DOIs, verify `citation_doi` is present

### Email obfuscation
- [ ] View page source — the raw email address should NOT appear in the HTML
- [ ] In the browser, the email renders as a clickable mailto link
- [ ] Clicking the email link opens the mail client with the correct address

### OG images (from previous task)
- [ ] Share a publication page URL in a private LinkedIn/Slack message — verify the preview card renders with title and branding
- [ ] Check the homepage also has a default OG image

### Sitemap and RSS (from previous task)
- [ ] Visit `/sitemap.xml` — verify it lists all publications, projects, posts, and news
- [ ] Visit `/index.xml` — verify RSS feed contains recent items
- [ ] View source of any page — verify `<link rel="alternate" type="application/rss+xml"` is present

### Print
- [ ] Open any publication page in Chrome, press Ctrl+P / Cmd+P
- [ ] Navigation and footer should be hidden
- [ ] Content should be cleanly formatted with readable fonts
- [ ] Links should show their URLs in parentheses

### Lightbox (from previous task)
- [ ] If any page contains an image, clicking it should open the lightbox overlay
- [ ] Pressing Escape or clicking the backdrop should close it

### Structured data
- [ ] Use Google's Rich Results Test (https://search.google.com/test/rich-results) on a publication page
- [ ] Verify it detects ScholarlyArticle or BlogPosting schema
- [ ] Test the homepage for WebSite schema

### External links
- [ ] Click any external link in a publication or news item — it should open in a new tab
- [ ] View source — external links should have `target="_blank" rel="noopener noreferrer"`

### 404 page
- [ ] Visit a non-existent URL (e.g., `/does-not-exist`) — should show the custom 404 page in German
- [ ] The 404 page should have a link back to the homepage

### Language
- [ ] Verify `<html lang="de">` on all pages
- [ ] For English-language publications (friendship ex libris, diaspora of books), check if `lang="en"` is set on the article element (if implemented)
