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
