# Agent Instructions

## Project

Pastebin - minimal team code snippet sharing app. No auth (private hosting).

## Stack

- Bun (runtime & package manager)
- Next.js 16 (App Router, Turbopack)
- Convex (backend, database)
- CodeMirror 6 (editor)
- Tailwind CSS
- TypeScript

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 3000)
bun run build        # Production build
bunx convex dev      # Start Convex (interactive auth required)
```

## Structure

```
app/                 # Next.js pages and routes
├── page.tsx         # Create paste (/)
├── [shortId]/       # Dynamic paste routes
    ├── page.tsx     # View paste (/{id})
    ├── raw/         # Raw text API
    └── download/    # Download API
components/          # React components
convex/              # Backend (schema, mutations, queries, crons)
lib/                 # Utilities (languages config, shortId generator)
```

## Conventions

- Client components use `"use client"` directive
- Convex queries/mutations in `convex/pastes.ts`
- Languages defined in `lib/languages.ts`
- Dark theme: `bg-gray-900 text-gray-100`
- Commits: conventional commits (`feat:`, `fix:`, `docs:`)

## Key Files

- `convex/schema.ts` - Database schema (pastes table)
- `convex/pastes.ts` - Backend functions
- `components/PasteEditor.tsx` - CodeMirror wrapper
- `components/TopBar.tsx` - Navigation/actions bar
- `lib/languages.ts` - Supported languages config
