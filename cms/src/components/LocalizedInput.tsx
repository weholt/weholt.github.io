import type { LocalizedString } from "../api";

type Props = {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  multiline?: boolean;
};

export function LocalizedInput({ label, value, onChange, multiline }: Props) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="field">
      <label>{label}</label>
      <div className="localized grid-2">
        <div className="field">
          <label>English</label>
          <Tag
            value={value.en}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
          />
        </div>
        <div className="field">
          <label>Norwegian</label>
          <Tag
            value={value.no}
            onChange={(event) => onChange({ ...value, no: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function emptyLocalized(): LocalizedString {
  return { en: "", no: "" };
}
