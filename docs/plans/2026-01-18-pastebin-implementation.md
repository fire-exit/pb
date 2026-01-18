# Pastebin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimal team pastebin with syntax highlighting, configurable expiration, and fork support.

**Architecture:** Next.js 16 frontend with Convex backend. Single `pastes` table stores content and metadata. CodeMirror 6 for editing and viewing. Minimal single-line UI with full-height editor.

**Tech Stack:** Next.js 16, React 19, Convex, CodeMirror 6, Tailwind CSS, TypeScript, nanoid

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Step 1: Initialize Next.js project with Convex**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

Expected: Project scaffolded with Next.js 16, Tailwind, TypeScript

**Step 2: Install Convex**

Run:
```bash
npm install convex
npx convex dev --once
```

Expected: `convex/` directory created with `_generated/` folder

**Step 3: Install CodeMirror and nanoid**

Run:
```bash
npm install @uiw/react-codemirror @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-html @codemirror/lang-css @codemirror/lang-json @codemirror/lang-markdown @codemirror/lang-sql @codemirror/lang-xml @codemirror/lang-yaml nanoid
```

Expected: Dependencies installed

**Step 4: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with Convex, CodeMirror, Tailwind"
```

---

## Task 2: Convex Schema and Functions

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/pastes.ts`
- Create: `convex/crons.ts`

**Step 1: Define the pastes schema**

Create `convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pastes: defineTable({
    shortId: v.string(),
    content: v.string(),
    language: v.string(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_shortId", ["shortId"])
    .index("by_expiresAt", ["expiresAt"]),
});
```

**Step 2: Create paste mutations and queries**

Create `convex/pastes.ts`:
```typescript
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    shortId: v.string(),
    content: v.string(),
    language: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pastes", {
      shortId: args.shortId,
      content: args.content,
      language: args.language,
      expiresAt: args.expiresAt,
    });
    return id;
  },
});

export const getByShortId = query({
  args: { shortId: v.string() },
  handler: async (ctx, args) => {
    const paste = await ctx.db
      .query("pastes")
      .withIndex("by_shortId", (q) => q.eq("shortId", args.shortId))
      .first();
    return paste;
  },
});
```

**Step 3: Create cleanup cron job**

Create `convex/crons.ts`:
```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "cleanup expired pastes",
  { minuteUTC: 0 },
  internal.pastes.cleanupExpired
);

export default crons;
```

**Step 4: Add internal cleanup mutation**

Add to `convex/pastes.ts`:
```typescript
import { mutation, query, internalMutation } from "./_generated/server";

// ... existing code ...

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("pastes")
      .withIndex("by_expiresAt")
      .filter((q) =>
        q.and(
          q.neq(q.field("expiresAt"), undefined),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .collect();

    for (const paste of expired) {
      await ctx.db.delete(paste._id);
    }

    return { deleted: expired.length };
  },
});
```

**Step 5: Push schema to Convex**

Run:
```bash
npx convex dev --once
```

Expected: Schema deployed successfully

**Step 6: Commit**

```bash
git add convex/
git commit -m "feat: add Convex schema and paste functions"
```

---

## Task 3: Convex Provider Setup

**Files:**
- Create: `components/ConvexClientProvider.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create Convex provider component**

Create `components/ConvexClientProvider.tsx`:
```typescript
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

**Step 2: Update layout to use provider**

Modify `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastebin",
  description: "Team pastebin for sharing code snippets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Step 3: Verify app loads without errors**

Run:
```bash
npm run dev
```

Expected: App loads at http://localhost:3000 without errors

**Step 4: Commit**

```bash
git add components/ app/layout.tsx
git commit -m "feat: add Convex client provider"
```

---

## Task 4: Language Configuration

**Files:**
- Create: `lib/languages.ts`

**Step 1: Create language configuration**

Create `lib/languages.ts`:
```typescript
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { Extension } from "@codemirror/state";

export interface Language {
  id: string;
  label: string;
  extension: () => Extension;
  fileExtension: string;
}

export const languages: Language[] = [
  { id: "plaintext", label: "Plain Text", extension: () => [], fileExtension: "txt" },
  { id: "javascript", label: "JavaScript", extension: () => javascript(), fileExtension: "js" },
  { id: "typescript", label: "TypeScript", extension: () => javascript({ typescript: true }), fileExtension: "ts" },
  { id: "jsx", label: "JSX", extension: () => javascript({ jsx: true }), fileExtension: "jsx" },
  { id: "tsx", label: "TSX", extension: () => javascript({ typescript: true, jsx: true }), fileExtension: "tsx" },
  { id: "python", label: "Python", extension: () => python(), fileExtension: "py" },
  { id: "html", label: "HTML", extension: () => html(), fileExtension: "html" },
  { id: "css", label: "CSS", extension: () => css(), fileExtension: "css" },
  { id: "json", label: "JSON", extension: () => json(), fileExtension: "json" },
  { id: "markdown", label: "Markdown", extension: () => markdown(), fileExtension: "md" },
  { id: "sql", label: "SQL", extension: () => sql(), fileExtension: "sql" },
  { id: "xml", label: "XML", extension: () => xml(), fileExtension: "xml" },
  { id: "yaml", label: "YAML", extension: () => yaml(), fileExtension: "yaml" },
];

export function getLanguage(id: string): Language {
  return languages.find((l) => l.id === id) ?? languages[0];
}

export function getFileExtension(languageId: string): string {
  return getLanguage(languageId).fileExtension;
}
```

**Step 2: Commit**

```bash
git add lib/
git commit -m "feat: add language configuration for CodeMirror"
```

---

## Task 5: Short ID Utility

**Files:**
- Create: `lib/shortId.ts`

**Step 1: Create short ID generator**

Create `lib/shortId.ts`:
```typescript
import { nanoid } from "nanoid";

export function generateShortId(): string {
  return nanoid(6);
}
```

**Step 2: Commit**

```bash
git add lib/shortId.ts
git commit -m "feat: add short ID generator"
```

---

## Task 6: CodeMirror Editor Component

**Files:**
- Create: `components/PasteEditor.tsx`

**Step 1: Create the editor component**

Create `components/PasteEditor.tsx`:
```typescript
"use client";

import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { getLanguage } from "@/lib/languages";

interface PasteEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function PasteEditor({
  value,
  language,
  onChange,
  readOnly = false,
}: PasteEditorProps) {
  const lang = getLanguage(language);

  const extensions = [
    lang.extension(),
    EditorView.lineWrapping,
    ...(readOnly ? [EditorView.editable.of(false)] : []),
  ];

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={vscodeDark}
      className="h-full text-sm"
      height="100%"
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: !readOnly,
        highlightActiveLine: !readOnly,
        foldGutter: true,
      }}
    />
  );
}
```

**Step 2: Install VS Code theme**

Run:
```bash
npm install @uiw/codemirror-theme-vscode
```

**Step 3: Commit**

```bash
git add components/PasteEditor.tsx package.json package-lock.json
git commit -m "feat: add CodeMirror editor component"
```

---

## Task 7: Top Bar Component

**Files:**
- Create: `components/TopBar.tsx`

**Step 1: Create the top bar component**

Create `components/TopBar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { languages } from "@/lib/languages";

export type ExpirationOption = "1h" | "1d" | "1w" | "1m" | "never";

interface TopBarProps {
  mode: "create" | "view";
  language: string;
  onLanguageChange?: (language: string) => void;
  expiration?: ExpirationOption;
  onExpirationChange?: (expiration: ExpirationOption) => void;
  expiresAt?: number | null;
  onCopy?: () => void;
  onRaw?: () => void;
  onDownload?: () => void;
  onFork?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const expirationOptions: { value: ExpirationOption; label: string }[] = [
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "1m", label: "1 month" },
  { value: "never", label: "Never" },
];

function formatExpiresIn(expiresAt: number | null | undefined): string {
  if (!expiresAt) return "Never expires";
  const diff = expiresAt - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `Expires in ${days}d`;
  if (hours > 0) return `Expires in ${hours}h`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `Expires in ${minutes}m`;
}

export function TopBar({
  mode,
  language,
  onLanguageChange,
  expiration,
  onExpirationChange,
  expiresAt,
  onCopy,
  onRaw,
  onDownload,
  onFork,
  onSave,
  isSaving,
}: TopBarProps) {
  const isCreate = mode === "create";

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
      {/* Logo */}
      <Link href="/" className="font-bold text-lg text-white hover:text-gray-300">
        Pastebin
      </Link>

      {/* Language Selector */}
      {isCreate ? (
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          className="bg-gray-700 text-gray-100 px-2 py-1 rounded border border-gray-600 text-sm"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-gray-400 text-sm">
          {languages.find((l) => l.id === language)?.label ?? language}
        </span>
      )}

      {/* Expiration */}
      {isCreate ? (
        <select
          value={expiration}
          onChange={(e) => onExpirationChange?.(e.target.value as ExpirationOption)}
          className="bg-gray-700 text-gray-100 px-2 py-1 rounded border border-gray-600 text-sm"
        >
          {expirationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-gray-400 text-sm">{formatExpiresIn(expiresAt)}</span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          disabled={isCreate}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Copy
        </button>
        <button
          onClick={onRaw}
          disabled={isCreate}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Raw
        </button>
        <button
          onClick={onDownload}
          disabled={isCreate}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ↓
        </button>
        <button
          onClick={onFork}
          disabled={isCreate}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Fork
        </button>
      </div>

      {/* Save Button */}
      {isCreate && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          {isSaving ? "Creating..." : "Create"}
        </button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/TopBar.tsx
git commit -m "feat: add TopBar component"
```

---

## Task 8: Create Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Implement the create page**

Replace `app/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TopBar, ExpirationOption } from "@/components/TopBar";
import { PasteEditor } from "@/components/PasteEditor";
import { generateShortId } from "@/lib/shortId";

function getExpiresAt(expiration: ExpirationOption): number | undefined {
  const now = Date.now();
  switch (expiration) {
    case "1h":
      return now + 60 * 60 * 1000;
    case "1d":
      return now + 24 * 60 * 60 * 1000;
    case "1w":
      return now + 7 * 24 * 60 * 60 * 1000;
    case "1m":
      return now + 30 * 24 * 60 * 60 * 1000;
    case "never":
      return undefined;
  }
}

export default function CreatePage() {
  const router = useRouter();
  const createPaste = useMutation(api.pastes.create);

  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiration, setExpiration] = useState<ExpirationOption>("1d");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const shortId = generateShortId();
      await createPaste({
        shortId,
        content,
        language,
        expiresAt: getExpiresAt(expiration),
      });
      router.push(`/${shortId}`);
    } catch (error) {
      console.error("Failed to create paste:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar
        mode="create"
        language={language}
        onLanguageChange={setLanguage}
        expiration={expiration}
        onExpirationChange={setExpiration}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <div className="flex-1 overflow-hidden">
        <PasteEditor
          value={content}
          language={language}
          onChange={setContent}
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify create page loads**

Run:
```bash
npm run dev
```

Expected: Create page loads with editor at http://localhost:3000

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: implement create page"
```

---

## Task 9: View Page

**Files:**
- Create: `app/[shortId]/page.tsx`

**Step 1: Create the view page**

Create `app/[shortId]/page.tsx`:
```typescript
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/TopBar";
import { PasteEditor } from "@/components/PasteEditor";
import { getFileExtension } from "@/lib/languages";

export default function ViewPage() {
  const params = useParams();
  const router = useRouter();
  const shortId = params.shortId as string;

  const paste = useQuery(api.pastes.getByShortId, { shortId });

  const handleCopy = async () => {
    if (paste) {
      await navigator.clipboard.writeText(paste.content);
    }
  };

  const handleRaw = () => {
    router.push(`/${shortId}/raw`);
  };

  const handleDownload = () => {
    if (!paste) return;
    const ext = getFileExtension(paste.language);
    const filename = `paste-${shortId}.${ext}`;
    const blob = new Blob([paste.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFork = () => {
    if (paste) {
      sessionStorage.setItem("fork_content", paste.content);
      sessionStorage.setItem("fork_language", paste.language);
      router.push("/");
    }
  };

  if (paste === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        Loading...
      </div>
    );
  }

  if (paste === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        Paste not found
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <TopBar
        mode="view"
        language={paste.language}
        expiresAt={paste.expiresAt}
        onCopy={handleCopy}
        onRaw={handleRaw}
        onDownload={handleDownload}
        onFork={handleFork}
      />
      <div className="flex-1 overflow-hidden">
        <PasteEditor
          value={paste.content}
          language={paste.language}
          readOnly
        />
      </div>
    </div>
  );
}
```

**Step 2: Update create page to handle fork data**

Add to `app/page.tsx` in the `CreatePage` component, after the useState declarations:
```typescript
import { useEffect } from "react";

// Inside CreatePage component, after useState declarations:
useEffect(() => {
  const forkContent = sessionStorage.getItem("fork_content");
  const forkLanguage = sessionStorage.getItem("fork_language");
  if (forkContent) {
    setContent(forkContent);
    sessionStorage.removeItem("fork_content");
  }
  if (forkLanguage) {
    setLanguage(forkLanguage);
    sessionStorage.removeItem("fork_language");
  }
}, []);
```

**Step 3: Commit**

```bash
git add app/[shortId]/ app/page.tsx
git commit -m "feat: implement view page with fork support"
```

---

## Task 10: Raw Route

**Files:**
- Create: `app/[shortId]/raw/route.ts`

**Step 1: Create the raw route**

Create `app/[shortId]/raw/route.ts`:
```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const paste = await convex.query(api.pastes.getByShortId, { shortId });

  if (!paste) {
    return new NextResponse("Paste not found", { status: 404 });
  }

  return new NextResponse(paste.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
```

**Step 2: Commit**

```bash
git add app/[shortId]/raw/
git commit -m "feat: add raw text route"
```

---

## Task 11: Download Route

**Files:**
- Create: `app/[shortId]/download/route.ts`

**Step 1: Create the download route**

Create `app/[shortId]/download/route.ts`:
```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextRequest, NextResponse } from "next/server";
import { getFileExtension } from "@/lib/languages";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const paste = await convex.query(api.pastes.getByShortId, { shortId });

  if (!paste) {
    return new NextResponse("Paste not found", { status: 404 });
  }

  const ext = getFileExtension(paste.language);
  const filename = `paste-${shortId}.${ext}`;

  return new NextResponse(paste.content, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
```

**Step 2: Commit**

```bash
git add app/[shortId]/download/
git commit -m "feat: add download route"
```

---

## Task 12: Final Polish

**Files:**
- Modify: `app/globals.css`

**Step 1: Update global styles for full-height editor**

Update `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Ensure CodeMirror fills container */
.cm-editor {
  height: 100% !important;
}

.cm-scroller {
  overflow: auto !important;
}
```

**Step 2: Test full flow**

1. Open http://localhost:3000
2. Type some code
3. Select a language
4. Select an expiration
5. Click Create
6. Verify redirected to view page
7. Test Copy, Raw, Download, Fork buttons

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: polish styles for full-height editor"
```

---

## Task 13: Environment Setup Documentation

**Files:**
- Create: `.env.local.example`

**Step 1: Create environment example file**

Create `.env.local.example`:
```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

**Step 2: Update .gitignore**

Add to `.gitignore`:
```
# Environment
.env.local
.env*.local

# Convex
.convex-sync-state
```

**Step 3: Commit**

```bash
git add .env.local.example .gitignore
git commit -m "docs: add environment setup example"
```

---

## Summary

After completing all tasks, you will have:

1. **Project scaffolding** with Next.js 16, Convex, CodeMirror, Tailwind
2. **Convex backend** with pastes schema, mutations, queries, and cleanup cron
3. **Shared components**: PasteEditor (CodeMirror wrapper), TopBar
4. **Create page** at `/` with full editor
5. **View page** at `/{shortId}` with read-only editor
6. **Raw route** at `/{shortId}/raw` returning plain text
7. **Download route** at `/{shortId}/download` for file download
8. **Fork support** via sessionStorage

Total commits: 13
