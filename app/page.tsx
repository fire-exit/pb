"use client";

import { useState, useEffect } from "react";
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

  // Handle fork data from sessionStorage
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
