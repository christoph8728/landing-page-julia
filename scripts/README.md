# scripts/

Maintenance CLIs for the academic site.

## import-bibtex.js

Bulk-import a `.bib` file into `site/content/publications/`.

```bash
cd scripts
npm install                               # one time
node import-bibtex.js path/to/papers.bib  # writes files locally
```

Then review with `git diff` from the repo root and commit when satisfied.

### Flags

- `--dry-run` — print what would be written without writing
- `--overwrite` — replace existing files (default: skip them)
- `--out=<dir>` — alternate output directory (default: `site/content/publications`)

### What it produces

One `.md` file per BibTeX entry, named `{year}-{first-author-lastname}-{first-title-word}.md`, with frontmatter matching the publications schema:

```yaml
---
title: "..."
authors:
  - "First Last"
year: 2024
date: "2024-01-01"
publication_type: "article"   # mapped from BibTeX entry type
bibtex_type: "article"        # preserved verbatim for citation export
venue: "..."
doi: "..."
draft: false
---
```

### BibTeX type mapping

| BibTeX `@type` | `publication_type` | `bibtex_type` |
|---|---|---|
| `article` | `article` | `article` |
| `inproceedings` | `article` | `inproceedings` |
| `incollection` | `book_chapter` | `incollection` |
| `inbook` | `book_chapter` | `inbook` |
| `book` | `monograph` | `book` |
| `phdthesis` / `mastersthesis` | `monograph` | `phdthesis` / `mastersthesis` |
| anything else | `article` | preserved as-is |

Edit the file's frontmatter after import to tweak fields the parser couldn't infer (e.g. `cover_image`, `language`, abstract body).
