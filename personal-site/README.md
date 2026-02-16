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

Deploy on Vercel. Set production env var:

```bash
NEXT_PUBLIC_SITE_URL=your-url
```
