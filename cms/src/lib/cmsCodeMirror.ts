import { EditorView } from "@codemirror/view";
import { type RefObject, useEffect, useState } from "react";

export const MIN_EDITOR_HEIGHT_PX = 160;
export const VIEWPORT_PADDING_PX = 20;

export const cmsEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--bg)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      overflow: "hidden"
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      fontSize: "0.8125rem",
      lineHeight: "1.6"
    },
    ".cm-content": {
      caretColor: "var(--text)",
      padding: "0.35rem 0"
    },
    ".cm-gutters": {
      backgroundColor: "var(--surface-2)",
      color: "var(--muted)",
      border: "none",
      borderRight: "1px solid var(--border)"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(91, 159, 212, 0.12)"
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(91, 159, 212, 0.08)"
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "var(--accent)"
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "rgba(91, 159, 212, 0.28) !important"
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--surface-2)",
      color: "var(--muted)",
      border: "none"
    }
  },
  { dark: true }
);

export function useViewportEditorHeight(
  shellRef: RefObject<HTMLElement | null>,
  enabled = true
): number {
  const [heightPx, setHeightPx] = useState(384);

  useEffect(() => {
    if (!enabled) return;

    const shell = shellRef.current;
    if (!shell) return;

    let frame = 0;

    const syncHeight = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = shell.getBoundingClientRect().top;
        const viewport = window.visualViewport?.height ?? window.innerHeight;
        const next = Math.max(MIN_EDITOR_HEIGHT_PX, Math.floor(viewport - top - VIEWPORT_PADDING_PX));
        setHeightPx(next);
      });
    };

    syncHeight();

    const scrollRoot = shell.closest(".main");
    window.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("resize", syncHeight);
    window.visualViewport?.addEventListener("scroll", syncHeight);
    scrollRoot?.addEventListener("scroll", syncHeight, { passive: true });

    const observer = new ResizeObserver(syncHeight);
    observer.observe(shell);
    if (shell.parentElement) observer.observe(shell.parentElement);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("resize", syncHeight);
      window.visualViewport?.removeEventListener("scroll", syncHeight);
      scrollRoot?.removeEventListener("scroll", syncHeight);
      observer.disconnect();
    };
  }, [enabled, shellRef]);

  return heightPx;
}
