# Pastebin

A minimal team pastebin for sharing code snippets, designed for private hosting with no authentication required.

## Features

- **Syntax Highlighting** - Support for 13+ languages including TypeScript, JavaScript, Python, HTML, CSS, JSON, SQL, and more
- **Configurable Expiration** - Pastes can expire in 1 hour, 1 day, 1 week, 1 month, or never
- **Fork Support** - Fork existing pastes to create modified versions (pastes are immutable)
- **Raw View** - Access paste content as plain text at `/{id}/raw`
- **Download** - Download pastes as files with appropriate extensions
- **Copy to Clipboard** - One-click copy functionality
- **Dark Theme** - Clean, minimal interface with VS Code-style editor

## Tech Stack

- **Runtime**: Bun
- **Frontend**: Next.js 16 (App Router, Turbopack)
- **Backend**: Convex (reactive database, serverless functions)
- **Editor**: CodeMirror 6
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Convex](https://convex.dev/) account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fire-exit/pb.git
   cd pb
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Initialize Convex (opens browser for authentication):
   ```bash
   bunx convex dev
   ```

4. In a separate terminal, start the development server:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx              # Create paste page
│   └── [shortId]/
│       ├── page.tsx          # View paste page
│       ├── raw/route.ts      # Raw text API
│       └── download/route.ts # Download API
├── components/
│   ├── PasteEditor.tsx       # CodeMirror wrapper
│   └── TopBar.tsx            # Navigation bar
├── convex/
│   ├── schema.ts             # Database schema
│   ├── pastes.ts             # Mutations & queries
│   └── crons.ts              # Cleanup job
└── lib/
    ├── languages.ts          # Language configurations
    └── shortId.ts            # ID generator
```

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

This is automatically set when you run `bunx convex dev`.

## License

Apache 2.0
