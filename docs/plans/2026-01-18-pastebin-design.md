# Pastebin App Design

## Overview

A team/internal pastebin for sharing code snippets, hosted privately with no authentication required.

## Tech Stack

- **Frontend**: Next.js 16 LTS (App Router, Turbopack)
- **Backend**: Convex (reactive database, serverless functions)
- **Editor**: CodeMirror 6 (both create and view)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Core Features

- Create and view pastes with syntax highlighting
- Configurable expiration: 1 hour, 1 day, 1 week, 1 month, permanent
- Fork existing pastes (no editing - pastes are immutable)
- Raw text view
- Download as file
- Copy to clipboard
- ~150+ language support via CodeMirror

## Non-Features (Intentionally Excluded)

- No authentication (private hosting)
- No paste editing (fork instead)
- No manual delete (expiration only)
- No title field
- No view tracking/analytics

## Data Model

```typescript
// convex/schema.ts
pastes: defineTable({
  shortId: v.string(),           // URL identifier (e.g., "a7Bx9k")
  content: v.string(),           // The paste content
  language: v.string(),          // Syntax highlighting language
  expiresAt: v.optional(v.number()), // null = permanent
})
.index("by_shortId", ["shortId"])
.index("by_expiresAt", ["expiresAt"])
```

## URL Structure

| Route | Purpose |
|-------|---------|
| `/` | Create new paste |
| `/{shortId}` | View paste |
| `/{shortId}/raw` | Plain text response |
| `/{shortId}/download` | Download as file |

## Convex Functions

**Mutations**
- `create` - Create new paste, returns shortId
- (no delete - pastes expire automatically)

**Queries**
- `get` - Fetch paste by shortId
- `listRecent` - Optional homepage list

**Scheduled Jobs**
- `cleanupExpired` - Hourly cron to delete expired pastes

## UI Design

Minimal single-line interface. Top bar contains all controls, rest is full-height editor.

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] [Language ▼] [Expires ▼]         │ Copy Raw ↓ Fork │ [Save]
├─────────────────────────────────────────────────────────────────┤
│  1 │ const config = {                                           │
│  2 │   debug: true,                                             │
│  3 │   port: 3000                                               │
│  4 │ };                                                         │
│  5 │                                                            │
│    │                    (Full height CodeMirror)                │
└─────────────────────────────────────────────────────────────────┘
```

**Create vs View Mode**

| Element | Create Mode | View Mode |
|---------|-------------|-----------|
| Language | Selectable | Display only |
| Expires | Selectable | Shows "Expires in X" |
| Copy | Disabled | Enabled |
| Raw | Disabled | Enabled |
| Download | Disabled | Enabled |
| Fork | Disabled | Enabled |
| Save | Shows "Create" | Hidden |

## Project Structure

```
pastebin/
├── convex/
│   ├── schema.ts          # Paste table definition
│   ├── pastes.ts          # Mutations & queries
│   └── crons.ts           # Cleanup expired pastes
├── app/
│   ├── layout.tsx         # Convex provider, global styles
│   ├── page.tsx           # Create mode
│   ├── [shortId]/
│   │   ├── page.tsx       # View mode
│   │   ├── raw/route.ts   # Plain text response
│   │   └── download/route.ts
│   └── globals.css        # Tailwind imports
├── components/
│   ├── TopBar.tsx         # Logo, dropdowns, actions
│   └── PasteEditor.tsx    # CodeMirror wrapper
├── lib/
│   ├── languages.ts       # Language config & extensions
│   └── shortId.ts         # nanoid generation
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Dependencies

```json
{
  "dependencies": {
    "next": "^16",
    "react": "^19",
    "convex": "^1",
    "@uiw/react-codemirror": "^4",
    "@codemirror/lang-javascript": "^6",
    "@codemirror/lang-python": "^6",
    "nanoid": "^5"
  },
  "devDependencies": {
    "tailwindcss": "^3",
    "typescript": "^5"
  }
}
```

## Short ID Generation

6-character alphanumeric IDs using nanoid (~57 billion combinations).

```typescript
import { nanoid } from 'nanoid';
const shortId = nanoid(6); // e.g., "a7Bx9k"
```

## Download Filename

Without titles, downloads use: `paste-{shortId}.{extension}`

Example: `paste-a7Bx9k.ts`
