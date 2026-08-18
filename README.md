# tinyobjects.studio

This repo **is** the live website. GitHub Pages serves it from the repository root
on branch `main`. There is no build step in CI — whatever is committed at the root
is what the public sees, immediately.

```
https://tinyobjects.studio            →  /index.html          (studio home)
https://tinyobjects.studio/arcana/             →  /arcana/             (Arcana Desk landing)
https://tinyobjects.studio/relay/              →  /relay/              (RELAY landing)
https://tinyobjects.studio/arcana/privacy/     →  /arcana/privacy/     (Arcana Desk privacy)
https://tinyobjects.studio/arcana/terms/       →  /arcana/terms/       (Arcana Desk terms)
https://tinyobjects.studio/pois-tracker/       →  /pois-tracker/       (POIS Tracker landing)
https://tinyobjects.studio/pois-tracker/guide/ →  /pois-tracker/guide/ (POIS Tracker guide)
```

---

## 🚨 Two rules that must never be broken

### 1. Never touch, move, rename or delete `/pois-tracker/`

That folder is the **marketing landing page for a shipping iOS app**. Its URL is
registered as the **Marketing URL on the App Store product page**, and it is the
link used in every community/launch post. Breaking it means a dead link on a live
App Store listing.

- ✅ Safe: anything at the repo root (the studio home).
- ❌ Never: edit, move or delete anything inside `pois-tracker/`.
- ❌ Never: add a link to POIS Tracker from the studio home. Keeping the studio
  brand and the POIS app visually unconnected is a **deliberate decision by the
  owner**. That includes meta descriptions, OG images and sitemaps — not just
  visible links.

### 2. Never delete `CNAME` or `.nojekyll`

| File | Why it exists | If removed |
|---|---|---|
| `CNAME` | Binds the custom domain to Pages | Site falls back to `tiny-objects.github.io`; **the custom domain breaks** |
| `.nojekyll` | Stops Jekyll from ignoring `_next/` | All CSS/JS 404s → **unstyled, broken site** (folders starting with `_` are hidden by Jekyll) |

---

## Editing the studio home

The published home page is a **static export of a Next.js app**. The source lives
in [`_source/studio/`](_source/studio/) — it is *not* served (Pages serves the
built output at the root).

**Never hand-edit the root `index.html`.** It is generated and minified; your
change would be lost on the next build. Edit the source and rebuild.

```bash
cd _source/studio
npm install
npm run build          # → produces _source/studio/out/

# copy the build to the repo root, preserving what must survive:
cd ../..
rsync -a --delete \
  --exclude 'pois-tracker/' --exclude 'arcana/' --exclude 'relay/' \
  --exclude 'CNAME' --exclude '.nojekyll' --exclude 'README.md' \
  --exclude '_source/' --exclude '.git/' --exclude 'robots.txt' --exclude 'sitemap.xml' \
  _source/studio/out/ ./

# ALWAYS dry-run first and read the *deleting lines — --delete wipes anything
# at the root that the build does not itself produce:
#   rsync -a --delete --dry-run --itemize-changes <same excludes> _source/studio/out/ ./

git add -A && git commit -m "studio: <what changed>" && git push
```

**Why each exclude is there.** `rsync --delete` makes the root a mirror of
`out/`, so every excluded path is something the Next build does not produce and
would therefore be destroyed:

| Exclude | What it protects |
|---|---|
| `pois-tracker/` | Hand-written landing + guide. **Rule 1** — never touch |
| `arcana/` | Hand-written landing, privacy and terms for Arcana Desk. Not part of the Next export, but live, linked from the home and listed in the sitemap |
| `relay/` | Hand-written landing for RELAY, plus its own favicons and OG image. Same deal as `arcana/` |
| `CNAME`, `.nojekyll` | **Rule 2** — the domain and the CSS |
| `robots.txt`, `sitemap.xml` | Hand-maintained; the studio sitemap must stay POIS-free |
| `README.md` | This file |
| `_source/`, `.git/` | The source and the repo itself |

Anything else at the root that the build does not emit **will be deleted** — that
is intentional, it clears stale hashed chunks from previous builds. Read the
dry-run output before trusting it.

Verify afterwards (all must pass):

```bash
curl -sI https://tinyobjects.studio/ | head -1                       # 200
curl -sI https://tinyobjects.studio/pois-tracker/ | head -1          # 200  ← must not break
curl -sI https://tinyobjects.studio/arcana/ | head -1                # 200  ← must not break
curl -sI https://tinyobjects.studio/relay/ | head -1                 # 200  ← must not break
curl -s https://tinyobjects.studio/ | grep -c pois                   # 0    ← no POIS on home
curl -s https://tinyobjects.studio/sitemap.xml | grep -c pois        # 0    ← nor in the sitemap
curl -s https://tinyobjects.studio/ | grep -c 'href="/arcana"'       # 1    ← Arcana row still links
```

### Why the source is patched (do not "fix" these)

The design came from a Next.js template that targeted Cloudflare Workers. Two
changes make it exportable to static hosting; both are load-bearing:

1. **`output: "export"` + `images: { unoptimized: true }`** in `next.config.ts`.
2. **`app/layout.tsx` hardcodes the origin.** The template used `headers()` to
   detect the host — a dynamic function that makes static export fail. If you
   reintroduce `headers()`, `cookies()`, route handlers, or `next/image`
   optimization, the export breaks.

The Cloudflare-specific parts of the template (worker, D1 database, drizzle,
`chatgpt-auth.ts`, examples) were unused boilerplate and were removed.

### ⚠️ About `app/globals.css` (recovered)

The original `globals.css` was lost. This file is the **compiled CSS recovered
from the published build** — it contains the full design (all the `.nav`,
`.wordmark`, `.acid-object`, `.app-row` rules) but minified. It is functional.
If the designer still has the original `globals.css`, replace this file with it.
Otherwise, tidy this one as you work.

The recovery also scraped ~3.7 KB of **next/font build output** into the top of
the file: thirteen `@font-face` blocks whose `src` pointed at
`url(../media/<hash>.woff2)`. Those files only exist inside a compiled bundle, so
Turbopack could not resolve them and `next build` failed with 11 errors. They were
removed — `next/font/google` in `app/layout.tsx` regenerates the Geist faces at
build time. **Do not paste published CSS back into this file**; the same breakage
returns.

### Adding an app to the home list

In `_source/studio/app/page.tsx`, add to the `apps` array. Add a `url` to make a
row clickable; omit it for an unreleased app:

```ts
{ name: "Relay",       icon: "/app-icons/relay.png", url: "https://example.com" },  // new tab
{ name: "Arcana Desk", icon: "/app-icons/arcana-desk.png", url: "/arcana" },        // same tab
```

A `url` starting with `/` is treated as a page on this site and opens in the same
tab; a full `https://` address opens in a new tab.

**The `apps` array is the only source of truth for these links.** The published
`index.html` was once hand-edited to point Arcana Desk at `/arcana` while
`page.tsx` still had no `url` — so the next rebuild would have silently dropped
the link. Never patch a link into the built HTML; put it here and rebuild.

Icons live in `_source/studio/public/app-icons/` (64×64 display, PNG).

---

## Domain & hosting

| | |
|---|---|
| Registrar | **Namecheap** — `tinyobjects.studio`, expires **7 Jul 2027**, auto-renew ON (~€35/yr) |
| Hosting | **GitHub Pages**, `Tiny-Objects/poistracker-web`, branch `main`, root |
| HTTPS | Enforced. Certificate auto-managed by GitHub (Let's Encrypt) |
| Studio email | `hello@tinyobjects.studio` → forwards to the owner's Gmail (Namecheap free forwarding) |

DNS (Namecheap → Advanced DNS) — **do not change**:

```
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
CNAME  www    tiny-objects.github.io.
```

### If HTTPS ever breaks ("Not Secure" / cert stuck)

This happened once: DNS was correct but GitHub's certificate request got stuck
for days. The fix is to force a re-request by clearing and re-setting the custom
domain:

```bash
gh api -X PUT repos/Tiny-Objects/poistracker-web/pages -f cname=""
sleep 20
gh api -X PUT repos/Tiny-Objects/poistracker-web/pages -f cname=tinyobjects.studio
sleep 25
gh api repos/Tiny-Objects/poistracker-web/pages --jq '.https_certificate.state'   # → approved
gh api -X PUT repos/Tiny-Objects/poistracker-web/pages -F https_enforced=true
```

Check DNS first (`dig +short tinyobjects.studio A`) — if the A records are wrong,
fix those instead; and confirm no CAA record blocks Let's Encrypt.

---

## SEO

Currently minimal and intentionally split, so the studio and the POIS app are not
linked to each other:

- `/robots.txt` and `/sitemap.xml` (root) — **studio pages only**.
- `/pois-tracker/sitemap.xml` — the POIS pages have their own sitemap.

Keep them separate. Do not list `pois-tracker` URLs in the root sitemap.
