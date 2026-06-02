type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export function StringListInput({ label, values, onChange }: Props) {
  return (
    <div className="field">
      <label>{label} (one per line)</label>
      <textarea
        value={values.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          )
        }
      />
    </div>
  );
}
