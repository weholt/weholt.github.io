type Props = {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onValidate?: () => void;
  extra?: React.ReactNode;
};

export function SaveBar({ dirty, saving, onSave, onValidate, extra }: Props) {
  return (
    <div className="toolbar">
      <button className="btn btn-primary" disabled={saving} onClick={onSave}>
        {saving ? "Saving…" : "Save"}
      </button>
      {onValidate && (
        <button className="btn" onClick={onValidate}>
          Validate
        </button>
      )}
      {extra}
      {dirty && <span className="unsaved-hint">Unsaved changes</span>}
    </div>
  );
}
