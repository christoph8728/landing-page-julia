# Self-hosted migration path

This is a contingency document. The current stack (GitHub + Cloudflare) is
free and requires zero server administration. Migrate only if free-tier terms
change in ways that affect this project.

## Target stack

- **Hetzner CX22** — €3.79/month, 2 vCPU, 4 GB RAM, 40 GB NVMe (Falkenstein, Germany)
- **Caddy** — web server + automatic HTTPS + reverse proxy
- **PocketBase** — single Go binary: auth, REST API, SQLite content store, file storage
- **Syncthing** — bidirectional folder sync, replaces GitHub sync script
- **Hugo** — static site generator (unchanged)

## What changes

| Current | Migrated |
|---------|----------|
| GitHub repo | PocketBase SQLite + file storage |
| Cloudflare Worker API | PocketBase auto-generated REST |
| Cloudflare Pages (site) | Caddy serving Hugo output |
| Cloudflare Pages (CMS) | Caddy serving CMS build |
| sync.js (GitHub API) | Syncthing bidirectional sync |

## What stays the same

- All content as plain `.md` files with YAML frontmatter
- Hugo static site generator and theme
- CMS frontend (React/Vite) — moderate changes to API calls
- Milkdown editor — unchanged

## Migration is a file copy

Because all content is plain markdown, migration is:
1. Export all `.md` files from GitHub
2. Import into PocketBase or copy to VPS content directory
3. No data transformation required
