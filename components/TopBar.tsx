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
          Download
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
