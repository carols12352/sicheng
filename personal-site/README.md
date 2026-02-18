# Personal Site

Personal portfolio site built with Next.js (App Router), focused on clean UX, practical SEO, and playful easter eggs.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- MDX (`next-mdx-remote`)

## Pages

- `/` Home
- `/projects`
- `/writing`
- `/writing/[slug]`
- `/resume`
- `/about`
- `/terminal` interactive terminal easter egg
- custom `404` page with embedded Dino game

## Features

- Project cards with minimal `repo` links and optional `demo` links
- Writing article breadcrumb navigation
- Desktop article TOC (`On This Page`) with active-section highlight
- Hidden Vim-style keyboard UX:
  - `j` / `k` for smooth scroll
  - `?` for shortcuts panel
  - `/` for search (enabled on `/writing`, `/projects`, `/writing/[slug]`)
- Responsive navigation:
  - desktop: inline nav
  - mobile: minimal hamburger menu
- Search behavior by page:
  - `/writing`: filters posts and shows title + content snippet matches
  - `/projects`: filters project cards and shows matched snippets
  - `/writing/[slug]`: in-article text search with live highlight + match count
- Accessibility / motion controls:
  - global `Motion: Full / Reduced` toggle in header
  - persisted in localStorage and merged with system `prefers-reduced-motion`
- MDX enhancements:
  - custom paragraph spacing
  - `Sidenote` support
  - fluid image zoom for article images
- Resume page UX:
  - compatibility note for dark-mode PDF/rendering plugins
  - embedded PDF preview with image fallback support
  - optional fallback image path: `public/resume-preview.jpg`
- Footer terminal hint upgrades:
  - animated green status dot
  - clickable build version (`build <sha>`) linking to GitHub commit page

## Getting Started

Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## SEO

- Global metadata in `app/layout.tsx`
- Dynamic article metadata in `app/writing/[slug]/page.tsx`
- `robots.txt` via `app/robots.ts`
- `sitemap.xml` via `app/sitemap.ts`
- IndexNow key files served from `public/*.txt`

## Terminal Easter Egg

In `/terminal`, try:

- `help`
- `ls`
- `tree`
- `cat about.txt`
- `open home`
- `rm`
- `rm -rf`
- `rm -rf /` (random crash animation)

## Deploy

Deploy on Vercel. Set production env vars:

```bash
NEXT_PUBLIC_SITE_URL=your-url
```

Build SHA in footer is mapped automatically in `next.config.ts`:

```ts
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? ""
```
