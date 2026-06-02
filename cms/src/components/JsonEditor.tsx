import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type JsonEditorHandle = {
  getText: () => string;
};

type Props = {
  value: unknown;
  onChange: (value: unknown) => void;
  onTextChange?: (text: string) => void;
};

export const JsonEditor = forwardRef<JsonEditorHandle, Props>(function JsonEditor(
  { value, onChange, onTextChange },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    getText: () => textareaRef.current?.value ?? ""
  }));

  useEffect(() => {
    const next = JSON.stringify(value, null, 2);
    if (textareaRef.current) textareaRef.current.value = next;
    setError(null);
  }, [value]);

  function handleInput() {
    const next = textareaRef.current?.value ?? "";
    onTextChange?.(next);
    setError(null);
  }

  function commit() {
    const next = textareaRef.current?.value ?? "";
    try {
      onChange(JSON.parse(next));
      setError(null);
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="field">
      <label>JSON editor</label>
      <textarea
        ref={textareaRef}
        data-testid="json-editor"
        defaultValue={JSON.stringify(value, null, 2)}
        onInput={handleInput}
        onChange={handleInput}
        onBlur={commit}
        style={{ minHeight: "24rem", fontFamily: "Consolas, monospace", fontSize: "0.85rem" }}
      />
      {error && <div className="status error">{error}</div>}
    </div>
  );
});
