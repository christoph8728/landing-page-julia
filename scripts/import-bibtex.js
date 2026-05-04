#!/usr/bin/env node
/*
 * import-bibtex.js
 *
 * Bulk-import a .bib file into the publications collection.
 *
 * Writes one .md file per entry into site/content/publications/, with
 * frontmatter shaped to match the existing publications schema (see
 * site/content/publications/2022-friendship-ex-libris.md as the canonical
 * example). Existing files are skipped unless --overwrite is passed.
 *
 * The tool writes to disk only — it does not commit. After running, review
 * with `git diff` and commit the new files yourself. This keeps imports
 * auditable and avoids needing a GitHub token in the repo.
 *
 * Usage:
 *   node import-bibtex.js <file.bib>
 *   node import-bibtex.js <file.bib> --dry-run
 *   node import-bibtex.js <file.bib> --overwrite
 *   node import-bibtex.js <file.bib> --out=site/content/publications
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseBibFile } from 'bibtex-parse'

// ── CLI argument parsing ────────────────────────────────────────────────────
const args = process.argv.slice(2)
const flags = new Set(args.filter(a => a.startsWith('--') && !a.includes('=')))
const opts = Object.fromEntries(
  args.filter(a => a.startsWith('--') && a.includes('=')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v]
  })
)
const positional = args.filter(a => !a.startsWith('--'))
const bibPath = positional[0]

if (!bibPath) {
  console.error('Usage: node import-bibtex.js <file.bib> [--dry-run] [--overwrite] [--out=path]')
  process.exit(1)
}

const dryRun = flags.has('--dry-run')
const overwrite = flags.has('--overwrite')

// Default output: site/content/publications relative to repo root (one level up)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const outDir = path.resolve(repoRoot, opts.out || 'site/content/publications')

// ── Type mapping (BibTeX entry type → publication_type + bibtex_type) ──────
//
// Two outputs because Hugo templates filter on publication_type for display
// (the German labels in pub-type-label.html), while bibtex_type is preserved
// verbatim for the BibTeX export partial.
const TYPE_MAP = {
  article:        { publication_type: 'article',       bibtex_type: 'article' },
  inproceedings:  { publication_type: 'article',       bibtex_type: 'inproceedings' },
  incollection:   { publication_type: 'book_chapter',  bibtex_type: 'incollection' },
  inbook:         { publication_type: 'book_chapter',  bibtex_type: 'inbook' },
  book:           { publication_type: 'monograph',     bibtex_type: 'book' },
  phdthesis:      { publication_type: 'monograph',     bibtex_type: 'phdthesis' },
  mastersthesis:  { publication_type: 'monograph',     bibtex_type: 'mastersthesis' },
  unpublished:    { publication_type: 'article',       bibtex_type: 'unpublished' },
  techreport:     { publication_type: 'article',       bibtex_type: 'techreport' },
  misc:           { publication_type: 'article',       bibtex_type: 'misc' },
}

// ── Slug + frontmatter helpers ──────────────────────────────────────────────

// Mirrors cms/src/lib/frontmatter.js — German umlauts → ASCII, rest → kebab.
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// BibTeX author format: "Last1, First1 and Last2, First2"
function parseAuthors(authorString) {
  return String(authorString || '')
    .split(' and ')
    .map(a => a.trim())
    .filter(Boolean)
    .map(a => {
      // Convert "Last, First" to "First Last" for the authors list, since
      // existing publications store full display names in author order.
      const parts = a.split(',').map(s => s.trim())
      if (parts.length === 2) return `${parts[1]} ${parts[0]}`
      return a
    })
}

// YAML serializer for our (small, predictable) frontmatter shape. Avoids
// pulling in js-yaml just to write strings, lists, and one nested list.
function yamlValue(v) {
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return String(v)
  return `"${String(v).replace(/"/g, '\\"')}"`
}

function buildFrontmatter(fields) {
  const lines = ['---']
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      lines.push(`${k}:`)
      for (const item of v) lines.push(`  - ${yamlValue(item)}`)
    } else {
      lines.push(`${k}: ${yamlValue(v)}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

// ── Main ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(bibPath)) {
  console.error(`File not found: ${bibPath}`)
  process.exit(1)
}

if (!fs.existsSync(outDir)) {
  console.error(`Output directory not found: ${outDir}`)
  process.exit(1)
}

const raw = fs.readFileSync(bibPath, 'utf8')
const parsed = parseBibFile(raw)
const entries = parsed.entries || []

if (!entries.length) {
  console.error('No BibTeX entries found.')
  process.exit(1)
}

console.log(`Parsed ${entries.length} entry/entries from ${bibPath}`)
console.log(`Output: ${outDir}${dryRun ? ' (dry run)' : ''}`)
console.log('')

let written = 0
let skipped = 0
let overwritten = 0

for (const entry of entries) {
  const props = entry.properties || {}
  const bibType = (entry.type || '').toLowerCase()
  const types = TYPE_MAP[bibType] || { publication_type: 'article', bibtex_type: bibType || 'misc' }

  const title = props.title?.value || 'Untitled'
  const authors = props.author?.value ? parseAuthors(props.author.value) : []
  const yearRaw = props.year?.value || new Date().getFullYear()
  const year = parseInt(String(yearRaw), 10)

  // Slug: {year}-{firstAuthorLastname}-{firstTitleWord}
  const firstAuthorLast = authors[0]?.split(' ').pop() || 'unknown'
  const firstWord = title.split(/\s+/)[0] || 'publication'
  const slug = `${year}-${slugify(firstAuthorLast)}-${slugify(firstWord)}`

  // Date: use Jan 1 of the year if no full date available; year-only papers
  // sort at the start of their year, matching existing convention.
  const date = `${year}-01-01`

  const frontmatter = buildFrontmatter({
    title,
    authors,
    year,
    date,
    publication_type: types.publication_type,
    bibtex_type: types.bibtex_type,
    venue: props.journal?.value || props.booktitle?.value || props.publisher?.value || '',
    volume: props.volume?.value,
    number: props.number?.value,
    pages: props.pages?.value,
    doi: props.doi?.value,
    external_url: props.url?.value,
    language: props.language?.value,
    draft: false,
  })

  const filePath = path.join(outDir, `${slug}.md`)
  const exists = fs.existsSync(filePath)

  if (exists && !overwrite) {
    console.log(`  skip   ${slug}.md (exists, use --overwrite to replace)`)
    skipped++
    continue
  }

  if (dryRun) {
    console.log(`  would ${exists ? 'overwrite' : 'write'}  ${slug}.md`)
  } else {
    fs.writeFileSync(filePath, frontmatter, 'utf8')
    console.log(`  ${exists ? 'overwrite' : 'wrote'}    ${slug}.md`)
    if (exists) overwritten++
    else written++
  }
}

console.log('')
console.log(
  dryRun
    ? `Dry run complete. ${entries.length} entry/entries, ${skipped} would be skipped.`
    : `Done. Wrote ${written}, overwrote ${overwritten}, skipped ${skipped}.`
)
console.log('Review with `git diff` before committing.')
