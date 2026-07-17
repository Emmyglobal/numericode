# NumeriCode — Deployment Guide

> Step-by-step guide to deploying NumeriCode to production on Vercel.
> Total time: approximately 15 minutes.

---

## Prerequisites

| Requirement | Check |
|---|---|
| Node.js 18+ installed locally | `node --version` |
| GitHub account | github.com |
| Vercel account (free) | vercel.com — sign up with GitHub |
| Project pushed to a GitHub repository | See Step 1 |

---

## Step 1 — Push to GitHub

If the project is not already on GitHub:

```bash
cd numericode

# Initialise git (if not done already)
git init
git add .
git commit -m "feat: NumeriCode Phase 8 — production-ready build"

# Create a new repo on github.com named "numericode"
# then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/numericode.git
git branch -M main
git push -u origin main
```

### What to add to .gitignore

Make sure your `.gitignore` includes:

```
node_modules/
dist/
coverage/
.env
*.local
```

`.env.example` should be committed (it contains no secrets).

---

## Step 2 — Configure Environment Variables

Create a `.env` file locally (this is never committed):

```bash
# .env
VITE_API_BASE_URL=/api
VITE_APP_NAME=NumeriCode
VITE_APP_ENV=production
```

For the MVP, `VITE_API_BASE_URL=/api` keeps all requests relative — MSW handles them in development and the production build excludes MSW entirely via the alias stub. When you add a real backend in Phase 10, change this to `https://api.numericode.com`.

---

## Step 3 — Verify the Production Build Locally

Always verify the build passes before deploying:

```bash
npm run build
```

Expected output:
```
✓ built in ~15s
dist/assets/vendor-react-[hash].js       192 kB  │ gzip: 60 kB
dist/assets/vendor-motion-[hash].js      124 kB  │ gzip: 40 kB
dist/assets/vendor-misc-[hash].js          1 kB  │ gzip:  1 kB   ← MSW excluded ✓
```

Then preview it locally:

```bash
npm run preview   # → http://localhost:4173
```

Test all three demo logins and verify the portal redirects work correctly.

---

## Step 4 — Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy? → Y
# ? Which scope? → your account
# ? Link to existing project? → N
# ? Project name → numericode
# ? Directory → ./
# ? Override build settings? → N

# First deploy creates a preview URL.
# To deploy to production:
vercel --prod
```

### Option B — Vercel Dashboard (no CLI needed)

1. Go to **vercel.com** → Log in → **Add New Project**
2. Click **Import Git Repository** → select your `numericode` repo
3. Vercel auto-detects Vite. Confirm settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**
5. Wait ~60 seconds. Vercel provides a live URL.

---

## Step 5 — Add Environment Variables on Vercel

1. In the Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add the following:

| Name | Value | Environment |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Production, Preview, Development |
| `VITE_APP_NAME` | `NumeriCode` | Production, Preview, Development |
| `VITE_APP_ENV` | `production` | Production only |

3. After adding variables, go to **Deployments** → click the three dots on the latest → **Redeploy**.

---

## Step 6 — Configure Vercel for SPA Routing

React Router uses client-side routing. Without server configuration, refreshing any page other than `/` returns a 404.

Create a `vercel.json` file in the project root:

```json
{
  "rewrites": [
    { "source": "/((?!assets|favicon).*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Commit and push this file:

```bash
git add vercel.json
git commit -m "config: add Vercel SPA routing and cache headers"
git push
```

Vercel automatically redeploys on push.

**What this does:**
- `rewrites` — all routes (except static assets) serve `index.html` so React Router handles them
- `/assets/*` cache header — content-hashed JS/CSS files are cached for 1 year
- Security headers — basic hardening for all responses

---

## Step 7 — Add a Custom Domain (Optional)

1. Vercel Dashboard → your project → **Settings** → **Domains**
2. Add your domain (e.g. `numericode.com`)
3. Vercel provides DNS records — add them at your domain registrar:
   - **A record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com` (for `www.numericode.com`)
4. Wait for DNS propagation (5 minutes to 48 hours)
5. Vercel automatically provisions an SSL certificate via Let's Encrypt

---

## Step 8 — Post-Deployment Verification

Run through this checklist after every production deployment:

### Routing
- [ ] Visit `/` — Landing page loads correctly
- [ ] Visit `/courses` — Course list loads
- [ ] Visit `/login` — Login page loads
- [ ] Hard refresh on `/courses` — does NOT return 404 (vercel.json SPA rewrite working)
- [ ] Visit a non-existent URL `/xyz` — 404 Not Found page shows

### Authentication & Role Routing
- [ ] Log in as student (`kolade@gmail.com`) → redirects to `/dashboard`
- [ ] Log in as trainer (`trainer@numericode.com`) → redirects to `/trainer`
- [ ] Log in as admin (`emmanuel@numericode.com`) → redirects to `/admin`
- [ ] Open `/trainer` while logged in as student → redirects to `/dashboard`
- [ ] Open `/dashboard` while not logged in → redirects to `/login`

### Performance
- [ ] Open Chrome DevTools → Network tab → check no `msw` or `@mswjs` chunks in production
- [ ] Confirm `vendor-misc` chunk is < 2 kB
- [ ] Run Lighthouse audit (DevTools → Lighthouse → Analyse page load):
  - Performance ≥ 95
  - Accessibility ≥ 98
  - Best Practices ≥ 95
  - SEO ≥ 90

### Dark Mode
- [ ] Enable dark mode → hard refresh → dark mode is preserved (no flash of light mode)

### Console
- [ ] Open browser console → zero errors in production build

---

## Continuous Deployment (Automatic)

Once connected to GitHub, Vercel automatically deploys:

| Event | Deployment |
|---|---|
| Push to `main` | Production deployment |
| Push to any other branch | Preview deployment (unique URL) |
| Pull Request opened | Preview deployment (URL posted as PR comment) |

This means every `git push origin main` deploys to production automatically.

---

## Setting Up CI with GitHub Actions (Optional but Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
```

This runs on every push and pull request:
- Type-checks the TypeScript
- Runs all 227 tests
- Verifies the production build succeeds

If any step fails, Vercel's deployment is blocked (configure this in Vercel → Settings → Git → Deployment Protection).

---

## Troubleshooting

### Build fails on Vercel

```
Error: Cannot find module '@/...'
```

**Fix:** Vercel must use Node.js 18+. In Vercel Dashboard → Settings → General → Node.js Version → set to `18.x`.

---

### Page returns 404 on refresh

```
404 — The requested path ... was not found
```

**Fix:** The `vercel.json` file is missing or not committed. See Step 6.

---

### Dark mode flashes on hard reload

**Fix:** The inline script in `index.html` must be present. Check that the `<script>` block reading `localStorage` appears before the main bundle script tag.

---

### Environment variable not working

Variables prefixed with `VITE_` are embedded at build time. They are NOT available at runtime — they must be set before the build runs.

**Fix:** Add the variable in Vercel Dashboard → Environment Variables → then **Redeploy** (not just restart).

---

### MSW appearing in the production network tab

**Fix:** Check that `NODE_ENV` is set to `production` in Vercel's environment variables. The `vite.config.ts` alias only activates the MSW stub when `process.env.NODE_ENV === 'production'`.

---

## What Comes Next — Connecting the Real Backend (Phase 10, Complete)

The Phase 10 backend (Node.js + Express + TypeScript + PostgreSQL) is built, tested (55 tests against a real database), and deployment-ready — see the `numericode-api` repository's own `DEPLOYMENT.md` for deploying it to Railway or Render.

Once the backend is live:

1. Deploy `numericode-api` first (see its `DEPLOYMENT.md`) and note its public URL
2. In this frontend's Vercel project → Settings → Environment Variables, set:
   ```
   VITE_API_BASE_URL=https://your-api.up.railway.app/api
   ```
3. Redeploy the frontend (Vite embeds env vars at build time — a redeploy is required, not just a restart)
4. On the backend, set `CLIENT_URL` to this frontend's deployed Vercel URL, so CORS allows the request

No frontend code changes are needed — every service function, Axios instance, and TypeScript type was already written against the documented API contract.

