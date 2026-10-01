# AGENTS.md — Architecture Guide for AI Agents

This file provides guidance to all AI coding assistants (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Project Overview

Next.js 16.2.9 App Router project using TypeScript (`strict`). Data layer: Prisma 7 + MySQL 8. Styled with Tailwind CSS v4. React Compiler is enabled — components are auto-memoized, do not use `useMemo`, `useCallback`, or `memo`.

## Commands

```bash
npm run dev        # Dev server (Turbopack, port 3000)
npm run build      # Production build (Turbopack)
npm run start      # Production server
npm run lint       # ESLint flat config (next/core-web-vitals)
npm run typecheck  # tsc --noEmit

npm run db:migrate # prisma migrate dev  (buat & terapkan migrasi dari schema.prisma)
npm run db:deploy  # prisma migrate deploy (production)
npm run db:seed    # data awal (butuh SEED_ADMIN_EMAIL & SEED_ADMIN_PASSWORD di .env)
npm run db:studio  # Prisma Studio
npm run db:reset   # drop + migrate + seed ulang (HANYA dev)
```

No test framework is installed yet.

## Project Structure

```
src/
  app/                  # Routes (App Router)
    layout.tsx           # Root layout (required: <html> + <body>)
    page.tsx             # Home route
    globals.css         # Tailwind v4 + theme tokens
    (group)/            # Route groups — organize without affecting URL
    api/                # Route Handlers (only when Server Actions won't work)
  components/
    ui/                 # Reusable UI primitives (Button, Input, Card)
    layouts/            # Layout pieces (Header, Footer, Sidebar)
  lib/
    db/client.ts        # `db` — PrismaClient singleton (server-only)
    db/create-client.ts # Pembuat client + driver adapter MySQL (dipakai app & seed)
  generated/prisma/     # Prisma Client hasil generate (gitignored, dibuat saat postinstall)
  hooks/                # Custom React hooks (client-side only)
prisma/
  schema.prisma         # Sumber kebenaran skema database
  migrations/           # Riwayat migrasi (COMMIT ke git)
  seed.ts               # Data awal
prisma.config.ts        # Konfigurasi Prisma CLI (datasource URL, seed)
docs/PRD.md             # Product Requirements Document
public/                 # Static assets (images, fonts)
```

Conventions:
- Colocate components close to the routes that use them. Move to `src/components/` only when shared across routes.
- Use route groups `(group)` to organize routes without affecting URLs.
- Path alias: `@/*` maps to `./src/*`.

## Database (Prisma 7 + MySQL)

Skema lengkap ada di `prisma/schema.prisma` (30 tabel, sesuai `docs/PRD.md` §6). Tabel/kolom snake_case lewat `@@map`/`@map`; model & field di kode camelCase.

- **Setup lokal:** salin `.env.example` → `.env`, isi `DATABASE_URL`, lalu `npm run db:migrate` dan `npm run db:seed`.
- **Mengubah skema:** edit `schema.prisma` → `npm run db:migrate -- --name <nama>` → commit folder `prisma/migrations/`. Jangan edit migrasi yang sudah diterapkan.
- **Prisma 7:** URL database ada di `prisma.config.ts`, bukan di `schema.prisma`. Koneksi runtime memakai driver adapter (`@prisma/adapter-mariadb`) di `src/lib/db/create-client.ts`. Client di-generate ke `src/generated/prisma` (impor dari `.../client`, bukan `@prisma/client`).
- **Pakai `db` hanya di server** (Server Component, Server Action, Route Handler). `lib/db/client.ts` mengimpor `server-only` sehingga build gagal bila terbawa ke Client Component.
- **Serialisasi ke Client Component:** `Decimal` (kolom `lat`/`lng`) dan `Date` tidak aman dilempar sebagai props; ubah ke `number`/string ISO dulu. ID memakai `Int` (bukan `BigInt`) agar bisa diserialisasi.
- **Cache:** bungkus query baca dengan `'use cache'` + `cacheTag('<entitas>')`, dan panggil `updateTag('<entitas>')` di Server Action yang menulis.
- **Soft publish:** entitas editorial punya `status` (`draft`/`published`); halaman publik selalu filter `status: 'published'`.
- Seed berisi data **contoh** dari desain Figma (dosen, nomor SK, dll.) dan aman dijalankan ulang.

## Server vs Client Components

This is the most important architectural rule in this project.

**Default: everything is a Server Component.** Do not add `'use client'` unless you absolutely need it.

**Add `'use client'` ONLY when you need:**
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- React hooks (`useState`, `useEffect`, `useRef`, `useReducer`)
- Browser APIs (`window`, `document`, `localStorage`)
- Third-party libraries that use client-side features

**Push the `'use client'` boundary DOWN as far as possible:**
```jsx
// ❌ Bad — wraps entire page in client bundle
'use client'
export default function Dashboard({ data }) {
  return (
    <div>
      <h1>Dashboard</h1>       {/* static — doesn't need client */}
      <DataTable data={data} /> {/* interactive — needs client */}
    </div>
  )
}

// ✅ Good — only the interactive part is a client component
import { DataTable } from './data-table'  // has 'use client'

export default async function Dashboard() {
  const data = await fetchDashboardData()  // runs on server
  return (
    <div>
      <h1>Dashboard</h1>
      <DataTable data={data} />
    </div>
  )
}
```

**Pass Server Components as children/props to Client Components** — they stay server-rendered:
```jsx
// ClientWrapper is 'use client', but children stay on the server
<ClientWrapper>
  <ServerComponent />
</ClientWrapper>
```

## Caching Strategy (Next.js 16 Cache Components)

`cacheComponents: true` is enabled in `next.config.mjs`. This activates Partial Prerendering (PPR) and the `use cache` directive system.

### Core Rules

- `'use cache'` at component/function/file level for in-memory caching
- `cacheLife()` controls duration: `seconds`, `minutes`, `hours`, `days`, `weeks`, `max`
- `cacheTag()` tags cached data for on-demand invalidation
- `fetch()` is **NOT cached by default** in v16 — use `'use cache'` explicitly

### Caching Patterns

```jsx
// Component-level cache
'use cache'
async function ProductList() {
  const products = await fetchProducts()
  return <div>{/* ... */}</div>
}

// Function-level cache with cacheLife
async function getProducts() {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return await db.product.findMany()
}

// On-demand invalidation in Server Actions
'use server'
async function addProduct(data) {
  await db.product.create({ data })
  updateTag('products')  // instant read-your-own-writes
}
```

### Cache Duration Guide

| Data Type | cacheLife | Example |
|-----------|-----------|---------|
| Real-time | Don't cache | Chat messages, live scores |
| Frequent changes | `seconds` | User notifications |
| Periodic updates | `minutes` | Dashboard metrics |
| Stable content | `hours` | Blog posts, product listings |
| Rarely changes | `days` / `weeks` | About page, documentation |
| Static | `max` | Marketing pages |

### Dynamic Content in Cached Pages

Wrap dynamic sections in `<Suspense>` — the page shell is static, dynamic parts stream in:
```jsx
async function Page() {
  return (
    <div>
      <StaticHeader />           {/* prerendered */}
      <Suspense fallback={<Skeleton />}>
        <DynamicUserContent />   {/* streams in */}
      </Suspense>
    </div>
  )
}
```

## Data Fetching

**Fetch data directly in Server Components:**
```jsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()
  return <Display data={json} />
}
```

**Parallel fetching — use `Promise.all()` when requests are independent:**
```jsx
export default async function Page() {
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ])
  return <div>{/* ... */}</div>
}
```

**Deduplicate within a request — use `React.cache()`:**
```jsx
import { cache } from 'react'
const getUser = cache(async (id) => await db.user.findUnique({ where: { id } }))
```

**Client Components — receive data as props or use `use()` with Promises:**
```jsx
// In Server Component — pass data down
export default async function Page() {
  const data = await fetchData()
  return <ClientView data={data} />
}

// Or pass a Promise and unwrap with use()
export default async function Page() {
  const dataPromise = fetchData()
  return <ClientView dataPromise={dataPromise} />
}

// In Client Component
'use client'
import { use } from 'react'
export function ClientView({ dataPromise }) {
  const data = use(dataPromise)
  return <div>{data.name}</div>
}
```

## Mutations (Server Actions)

Always use Server Actions for data mutations. Only use Route Handlers (`api/`) for external API integrations or webhooks.

```jsx
// In a dedicated file or inline
'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  const title = formData.get('title')

  // 1. Validate
  if (!title) throw new Error('Title required')

  // 2. Authenticate (ALWAYS — Server Actions are reachable via direct POST)
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  // 3. Mutate
  await db.post.create({ data: { title, authorId: session.userId } })

  // 4. Invalidate cache + refresh
  updateTag('posts')         // instant read-your-own-writes
  revalidateTag('posts', 'hours')  // stale-while-revalidate
  redirect('/posts')         // navigate
}
```

**Use in forms:**
```jsx
import { createPost } from './actions'

export function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## Proxy (Renamed from Middleware)

Next.js 16 renamed `middleware` to `proxy`. File: `src/proxy.ts`.

```js
// src/proxy.ts
import { NextResponse } from 'next/server'

export function proxy(request) {
  // Auth check, redirects, headers, etc.
  if (!request.cookies.get('session')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

- Runs on **Node.js only** (edge runtime not supported in proxy)
- Execution order: headers → redirects → proxy → filesystem → fallback

## Styling (Tailwind CSS v4)

- Uses `@import "tailwindcss"` (v4 syntax, not `@tailwind` directives)
- Theme tokens defined in `globals.css` via `@theme inline` with CSS custom properties
- Light/dark mode via `prefers-color-scheme` media query
- Use Tailwind utility classes directly in JSX

## File Conventions

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared UI for a segment, persists across navigation |
| `page.tsx` | Unique UI for a route, makes the route accessible |
| `loading.tsx` | Loading UI (Suspense fallback for the segment) |
| `error.tsx` | Error UI (must be `'use client'`) |
| `not-found.tsx` | 404 UI |
| `template.tsx` | Like layout but re-renders on navigation |
| `default.tsx` | Fallback for parallel routes (required in v16) |
| `proxy.ts` | Request interception (renamed from middleware) |
| `route.ts` | API endpoint (Route Handler) |

Component hierarchy per segment: `layout > template > error > loading > not-found > page`

## Next.js 16 Breaking Changes (Must Know)

1. **Async request APIs** — `cookies()`, `headers()`, `params`, `searchParams` all return Promises. Always `await` them.
2. **`middleware` → `proxy`** — file and export renamed. Edge runtime removed from proxy.
3. **`revalidateTag` signature** — requires second argument: `revalidateTag('tag', 'hours')`
4. **Parallel routes** — all slots require explicit `default.tsx` files
5. **`next lint` removed** — use `npm run lint` (ESLint directly)
6. **Turbopack is default** — custom webpack configs need `--webpack` flag to build
7. **`fetch` not cached by default** — use `'use cache'` explicitly
8. **AMP removed** — `next/amp`, `useAmp`, `config.amp` no longer exist
9. **`serverRuntimeConfig` / `publicRuntimeConfig` removed** — use env vars with `NEXT_PUBLIC_` prefix

## React 19 Features Available

- **View Transitions** — `<ViewTransition>` for navigation animations (requires `experimental.viewTransition: true`)
- **`<Activity>`** — render background content with `display: none` while preserving state
- **`useEffectEvent`** — extract non-reactive logic from Effects
- **`use()`** — unwrap Promises in Client Components

## Environment Variables

- Public vars: prefix with `NEXT_PUBLIC_` (accessible in Client Components)
- Server-only vars: no prefix (only accessible in Server Components, Server Actions, Route Handlers)
- Never commit `.env` files — they are gitignored

## Before Writing Any Code

This is Next.js 16 — it has breaking changes from v14/v15. If unsure about an API, check `node_modules/next/dist/docs/` for the current convention.
