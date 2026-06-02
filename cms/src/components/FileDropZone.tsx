import { useRef, useState } from "react";

type Props = {
  label?: string;
  onFiles: (files: File[]) => void | Promise<void>;
  accept?: string;
};

export function FileDropZone({ label = "Drop files here or click to browse", onFiles, accept = "image/*" }: Props) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    await onFiles(Array.from(fileList));
  }

  return (
    <div
      className={`dropzone ${active ? "active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        void handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <span className="dropzone-text">{label}</span>
    </div>
  );
}
