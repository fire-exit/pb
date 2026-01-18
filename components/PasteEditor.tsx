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
