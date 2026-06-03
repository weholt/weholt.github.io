import { json } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import CodeMirror from "@uiw/react-codemirror";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cmsEditorTheme, MIN_EDITOR_HEIGHT_PX, useViewportEditorHeight } from "../lib/cmsCodeMirror";

export type JsonEditorHandle = {
  getText: () => string;
};

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
  onTextChange?: (text: string) => void;
  /** Grow to use viewport space below the editor (default: true). */
  fillViewport?: boolean;
};

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function tryFormat(text: string): { ok: true; formatted: string } | { ok: false; error: string } {
  try {
    return { ok: true, formatted: stringify(JSON.parse(text)) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

const jsonHighlight = HighlightStyle.define([
  { tag: tags.propertyName, color: "#6ea8fe" },
  { tag: tags.string, color: "#4ade80" },
  { tag: tags.number, color: "#fbbf24" },
  { tag: tags.bool, color: "#f472b6" },
  { tag: tags.null, color: "#9aa4b8" },
  { tag: tags.keyword, color: "#c4b5fd" },
  { tag: tags.brace, color: "#e8ecf4" },
  { tag: tags.squareBracket, color: "#e8ecf4" },
  { tag: tags.punctuation, color: "#9aa4b8" },
  { tag: tags.separator, color: "#9aa4b8" },
  { tag: tags.comment, color: "#6b7280", fontStyle: "italic" },
  { tag: tags.invalid, color: "#f87171", textDecoration: "underline" }
]);

export const JsonEditor = forwardRef<JsonEditorHandle, Props>(function JsonEditor(
  { value, onChange, onTextChange, fillViewport = true },
  ref
) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(() => stringify(value));
  const [error, setError] = useState<string | null>(null);
  const heightPx = useViewportEditorHeight(shellRef, fillViewport);
  const lastExternalRef = useRef(stringify(value));

  useImperativeHandle(ref, () => ({
    getText: () => text
  }));

  useEffect(() => {
    const next = stringify(value);
    if (next !== lastExternalRef.current) {
      lastExternalRef.current = next;
      setText(next);
      setError(null);
    }
  }, [value]);

  function handleChange(next: string) {
    setText(next);
    onTextChange?.(next);
    setError(null);
  }

  useEffect(() => {
    if (import.meta.env.VITE_SKIP_VALIDATION !== "1") return;
    const api = {
      set: (next: string) => handleChange(next),
      get: () => text
    };
    (window as Window & { __cmsJsonEditor?: typeof api }).__cmsJsonEditor = api;
    return () => {
      delete (window as Window & { __cmsJsonEditor?: typeof api }).__cmsJsonEditor;
    };
  });

  function formatDocument() {
    const result = tryFormat(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText(result.formatted);
    onTextChange?.(result.formatted);
    setError(null);
    try {
      onChange(JSON.parse(result.formatted));
      lastExternalRef.current = result.formatted;
    } catch {
      // ignore — formatted JSON should parse
    }
  }

  function commit() {
    const result = tryFormat(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText(result.formatted);
    onTextChange?.(result.formatted);
    try {
      const parsed = JSON.parse(result.formatted);
      onChange(parsed);
      lastExternalRef.current = result.formatted;
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }

  const editorHeight = fillViewport ? `${heightPx}px` : `${MIN_EDITOR_HEIGHT_PX * 1.5}px`;

  return (
    <div ref={shellRef} className="field json-editor-field">
      <div className="json-editor-header">
        <label>JSON editor</label>
        <button type="button" className="btn json-editor-format" onClick={formatDocument}>
          Format
        </button>
      </div>
      <div data-testid="json-editor" className="json-editor-cm">
        <CodeMirror
          value={text}
          height={editorHeight}
          theme={cmsEditorTheme}
          extensions={[json(), syntaxHighlighting(jsonHighlight)]}
          onChange={handleChange}
          onBlur={commit}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            indentOnInput: true
          }}
        />
      </div>
      {error && <div className="status error">{error}</div>}
    </div>
  );
});
