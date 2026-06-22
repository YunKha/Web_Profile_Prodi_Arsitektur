# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 App Router project using JavaScript (not TypeScript). Styled with Tailwind CSS v4. React Compiler is enabled via `babel-plugin-react-compiler`.

## Commands

```bash
npm run dev        # Dev server on port 3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint (flat config, next/core-web-vitals)
```

No test framework is installed yet.

## Architecture

- **App Router**: All routes live in `src/app/`. Uses `layout.js` (root layout with Geist fonts) and `page.js` (home route).
- **Path alias**: `@/*` maps to `./src/*` (defined in `jsconfig.json`).
- **Styling**: Tailwind CSS v4 via `@import "tailwindcss"` in `globals.css`. Theme tokens defined using `@theme inline` with CSS custom properties for light/dark mode.
- **React Compiler**: Enabled in `next.config.mjs` — components are auto-memoized. Avoid manual `useMemo`/`useCallback`/`memo`.

## Next.js 16 Breaking Changes

This is NOT Next.js 14/15. Before writing code, check `node_modules/next/dist/docs/` for current API conventions. Heed deprecation notices.
