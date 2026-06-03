import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import CodeMirror from "@uiw/react-codemirror";
import { tags } from "@lezer/highlight";
import { marked } from "marked";
import { useEffect, useMemo, useRef, useState } from "react";
import { cmsEditorTheme, useViewportEditorHeight } from "../lib/cmsCodeMirror";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fillViewport?: boolean;
};

const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: "700", color: "#6ea8fe", fontSize: "1.2em" },
  { tag: tags.heading2, fontWeight: "700", color: "#6ea8fe", fontSize: "1.1em" },
  { tag: tags.heading3, fontWeight: "600", color: "#7eb6ff" },
  { tag: tags.heading4, fontWeight: "600", color: "#7eb6ff" },
  { tag: tags.heading5, fontWeight: "600", color: "#9aa4b8" },
  { tag: tags.heading6, fontWeight: "600", color: "#9aa4b8" },
  { tag: tags.strong, fontWeight: "700", color: "#f3f4f6" },
  { tag: tags.emphasis, fontStyle: "italic", color: "#c4b5fd" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: "#9aa4b8" },
  { tag: tags.link, color: "#4ade80", textDecoration: "underline" },
  { tag: tags.url, color: "#4ade80" },
  { tag: tags.monospace, color: "#fbbf24", fontFamily: 'Consolas, "Courier New", monospace' },
  { tag: tags.processingInstruction, color: "#f472b6" },
  { tag: tags.quote, color: "#9aa4b8", fontStyle: "italic" },
  { tag: tags.list, color: "#a5b4fc" },
  { tag: tags.meta, color: "#6b7280" },
  { tag: tags.comment, color: "#6b7280", fontStyle: "italic" },
  { tag: tags.punctuation, color: "#9aa4b8" },
  { tag: tags.contentSeparator, color: "#6b7280" }
]);

marked.setOptions({ gfm: true, breaks: true });

export function MarkdownEditor({ value, onChange, label = "Markdown", fillViewport = true }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(value);
  const [showPreview, setShowPreview] = useState(true);
  const lastExternalRef = useRef(value);
  const heightPx = useViewportEditorHeight(shellRef, fillViewport);

  useEffect(() => {
    if (value !== lastExternalRef.current) {
      lastExternalRef.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (import.meta.env.VITE_SKIP_VALIDATION !== "1") return;
    const api = {
      set: (next: string) => {
        setText(next);
        onChange(next);
        lastExternalRef.current = next;
      },
      get: () => text
    };
    (window as Window & { __cmsMarkdownEditor?: typeof api }).__cmsMarkdownEditor = api;
    return () => {
      delete (window as Window & { __cmsMarkdownEditor?: typeof api }).__cmsMarkdownEditor;
    };
  });

  const previewHtml = useMemo(() => {
    try {
      return marked.parse(text) as string;
    } catch {
      return "<p><em>Preview unavailable — check markdown syntax.</em></p>";
    }
  }, [text]);

  function handleChange(next: string) {
    setText(next);
    onChange(next);
    lastExternalRef.current = next;
  }

  const editorHeight = fillViewport ? `${heightPx}px` : "28rem";

  return (
    <div ref={shellRef} className="markdown-editor-field">
      <div className="markdown-editor-header">
        <label>{label}</label>
        <label className="markdown-preview-toggle">
          <input type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
          Live preview
        </label>
      </div>
      <div className={`markdown-editor-layout${showPreview ? "" : " markdown-editor-layout--solo"}`}>
        <div data-testid="markdown-editor" className="markdown-editor-cm">
          <CodeMirror
            value={text}
            height={editorHeight}
            theme={cmsEditorTheme}
            extensions={[markdown(), syntaxHighlighting(markdownHighlight)]}
            onChange={handleChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              bracketMatching: true,
              autocompletion: false
            }}
          />
        </div>
        {showPreview && (
          <div
            className="markdown-preview panel"
            style={{ maxHeight: editorHeight, overflow: "auto" }}
            aria-label="Markdown preview"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </div>
    </div>
  );
}
