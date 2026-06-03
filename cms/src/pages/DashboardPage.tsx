import { useState } from "react";
import { api, type CommandResult } from "../api";

export function DashboardPage() {
  const [validation, setValidation] = useState<CommandResult | null>(null);
  const [generation, setGeneration] = useState<CommandResult | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: "validate" | "generate") {
    setBusy(action);
    try {
      const result = action === "validate" ? await api.validate() : await api.generate();
      if (action === "validate") setValidation(result);
      else setGeneration(result);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2>Dashboard</h2>
        <p className="page-lead">
          Local content manager for Weholt.org. Edits write directly to <code>src/content/</code> and{" "}
          <code>public/images/</code>.
        </p>
      </header>
      <div className="toolbar">
        <button className="btn btn-primary" disabled={busy !== null} onClick={() => void run("validate")}>
          {busy === "validate" ? "Validating…" : "Validate content"}
        </button>
        <button className="btn" disabled={busy !== null} onClick={() => void run("generate")}>
          {busy === "generate" ? "Generating…" : "Generate site"}
        </button>
      </div>
      {validation && (
        <div className={`status ${validation.ok ? "ok" : "error"}`}>
          <strong>Validation</strong>
          {"\n"}
          {validation.stdout}
          {validation.stderr}
        </div>
      )}
      {generation && (
        <div className={`status ${generation.ok ? "ok" : "error"}`}>
          <strong>Generate</strong>
          {"\n"}
          {generation.stdout}
          {generation.stderr}
        </div>
      )}
    </div>
  );
}
