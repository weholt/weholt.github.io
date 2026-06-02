import { execSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const cmsDir = dirname(fileURLToPath(import.meta.url));
const root = join(cmsDir, "..");
const fixtureSource = join(root, "test-fixture");
const fixture = mkdtempSync(join(tmpdir(), "weholt-cms-fixture-"));
cpSync(fixtureSource, fixture, { recursive: true });
const apiPort = process.env.CMS_PORT || "3467";
const uiPort = process.env.CMS_UI_PORT || "5185";

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const lines = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" }).split("\n");
      const pids = new Set(
        lines
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && /^\d+$/.test(pid))
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        } catch {
          // ignore
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
    }
  } catch {
    // port not in use
  }
}
const baseUrl = `http://localhost:${uiPort}`;

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    let output = "";
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
      stdio: ["inherit", "pipe", "pipe"]
    });
    for (const stream of [child.stdout, child.stderr]) {
      stream?.on("data", (chunk) => {
        output += chunk.toString();
        process.stderr.write(chunk);
      });
    }
    child.on("exit", (code) => {
      if (code !== 0 || /\n### Error\n/.test(output) || /\nFAIL: /.test(output)) {
        reject(new Error(output.trim() || `${command} exited ${code}`));
        return;
      }
      resolve();
    });
    child.on("error", reject);
  });
}

function start(command, args, env) {
  return spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
    stdio: "pipe"
  });
}

async function waitFor(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  killPort(apiPort);
  killPort(uiPort);
  console.log("Starting CMS E2E (isolated fixture)…");
  console.log(`Fixture: ${fixture}`);

  const serverEnv = {
    CMS_SITE_ROOT: fixture,
    CMS_TEST_MODE: "1",
    CMS_PORT: apiPort
  };

  const server = start("npx", ["tsx", "server/index.ts"], serverEnv);
  const client = start("npx", ["vite", "--port", uiPort, "--strictPort"], {
    VITE_SKIP_VALIDATION: "1",
    CMS_PORT: apiPort,
    CMS_UI_PORT: uiPort
  });

  let exitCode = 1;
  try {
    await waitFor(`http://localhost:${apiPort}/api/health`);
    await waitFor(baseUrl);
    await new Promise((r) => setTimeout(r, 1500));
    console.log(`API: http://localhost:${apiPort}  UI: ${baseUrl}`);

    if (!process.env.CMS_E2E_SKIP_BROWSER_INSTALL) {
      await run("npx", ["@playwright/cli", "install-browser", "chromium"], {});
    }
    await run(
      "npx",
      [
        "@playwright/cli",
        "-s=cms-e2e",
        "open",
        baseUrl
      ],
      { CMS_BASE_URL: baseUrl }
    );

    await run(
      "npx",
      ["@playwright/cli", "-s=cms-e2e", "run-code", "--filename=e2e/tests.cjs"],
      { CMS_BASE_URL: baseUrl, CMS_UI_PORT: uiPort, CMS_PORT: apiPort }
    );

    await run("npx", ["@playwright/cli", "-s=cms-e2e", "close"], {});
    exitCode = 0;
  } catch (error) {
    console.error(error.message || error);
    exitCode = 1;
    try {
      await run("npx", ["@playwright/cli", "-s=cms-e2e", "close"], {});
    } catch {
      // ignore
    }
  } finally {
    server.kill("SIGTERM");
    client.kill("SIGTERM");
    try {
      rmSync(fixture, { recursive: true, force: true });
    } catch {
      // ignore
    }
    process.exit(exitCode);
  }
}

main();
