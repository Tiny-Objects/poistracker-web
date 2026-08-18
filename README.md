# tinyobjects.studio

This repo **is** the live website. GitHub Pages serves it from the repository root
on branch `main`. There is no build step in CI — whatever is committed at the root
is what the public sees, immediately.

```
https://tinyobjects.studio            →  /index.html          (studio home)
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
  --exclude 'pois-tracker/' --exclude 'CNAME' --exclude '.nojekyll' \
  --exclude '_source/' --exclude '.git/' --exclude 'robots.txt' --exclude 'sitemap.xml' \
  _source/studio/out/ ./

git add -A && git commit -m "studio: <what changed>" && git push
```

Verify afterwards (all must pass):

```bash
curl -sI https://tinyobjects.studio/ | head -1                       # 200
curl -sI https://tinyobjects.studio/pois-tracker/ | head -1          # 200  ← must not break
curl -s https://tinyobjects.studio/ | grep -c pois                   # 0    ← no POIS on home
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
If the designer still has the original `globals.css`, replace this file with it
and rename to `globals.css`. Otherwise, tidy this one as you work.

`app/layout.tsx` imports `./globals.css` — rename the recovered file (or update
the import) before the first build.

### Adding an app to the home list

In `_source/studio/app/page.tsx`, add to the `apps` array. Add a `url` to make a
row clickable; omit it for an unreleased app:

```ts
{ name: "Relay", icon: "/app-icons/relay.png", url: "https://example.com" },
```

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
