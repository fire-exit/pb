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
