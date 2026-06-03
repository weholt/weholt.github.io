/**
 * CMS E2E tests — playwright-cli run-code --filename
 * Runs in Node with a `page` argument (do not use process.env here).
 */
async (page) => {
  const base = "http://localhost:5185";
  const uploadFile = "e2e/fixtures/test.jpg";
  const results = [];

  function record(name, ok, detail = "") {
    results.push({ name, ok, detail });
    if (!ok) console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }

  async function goto(path) {
    await page.goto(`${base}${path}`);
    await page.waitForLoadState("domcontentloaded");
  }

  async function clickNav(label) {
    await page.getByRole("link", { name: label, exact: true }).click();
    await page.waitForLoadState("domcontentloaded");
  }

  async function openPage(href, heading) {
    await goto(href);
    await page.getByRole("heading", { name: heading }).waitFor({ timeout: 10000 });
  }

  async function jsonEditorText(scope) {
    await scope.getByTestId("json-editor").locator(".cm-content").waitFor({ timeout: 10000 });
    return page.evaluate(() => window.__cmsJsonEditor?.get() ?? "");
  }

  async function fillMarkdownEditor(text) {
    await page.evaluate((value) => {
      if (!window.__cmsMarkdownEditor) throw new Error("Markdown editor test hook missing");
      window.__cmsMarkdownEditor.set(value);
    }, text);
    await page.waitForTimeout(200);
  }

  async function fillJsonEditor(scope, text) {
    await page.evaluate((value) => {
      if (!window.__cmsJsonEditor) throw new Error("JSON editor test hook missing");
      window.__cmsJsonEditor.set(value);
    }, text);
    await page.waitForTimeout(200);
  }

  async function waitForStatus(scope, _text, timeout = 10000) {
    const status = scope.locator(".status").first();
    await status.waitFor({ timeout });
    return status.textContent();
  }

  await goto("/");
  record("dashboard: heading", (await page.locator("h2").textContent()) === "Dashboard");

  await page.getByRole("button", { name: "Validate content" }).click();
  await page.waitForTimeout(500);
  record("dashboard: validate shows result", (await page.locator(".status").count()) >= 1);

  await clickNav("Profile");
  const main = page.locator(".main");
  await main.getByTestId("json-editor").waitFor({ timeout: 10000 });
  record("profile: loads JSON editor", (await main.getByTestId("json-editor").count()) >= 1);
  const profileJson = await jsonEditorText(main);
  record("profile: has test user", profileJson.includes("Test User"));

  const profileEdited = profileJson.replace("Test User", "Test User Edited");
  await fillJsonEditor(main, profileEdited);
  record("profile: fill applied", (await jsonEditorText(main)).includes("Test User Edited"));
  await main.getByRole("button", { name: "Save" }).click();
  const profileSaveStatus = await waitForStatus(main, "Saved");
  record("profile: save message", profileSaveStatus?.includes("Saved"), profileSaveStatus ?? "");

  await clickNav("Profile");
  const profileAfter = await jsonEditorText(main);
  record("profile: persists edit", profileAfter.includes("Test User Edited"));

  await clickNav("Career");
  await page.getByRole("heading", { name: "Career" }).waitFor();
  const careerItem = page.locator(".item-list button").filter({ hasText: "test-job" });
  await careerItem.first().waitFor({ timeout: 10000 });
  record("career: list item visible", (await careerItem.count()) >= 1);

  await careerItem.first().click();
  await page.waitForTimeout(200);
  const careerJson = await jsonEditorText(main);
  record("career: loads item JSON", careerJson.includes("test-job"));

  const careerEdited = careerJson.replace("Test Co", "Test Co Updated");
  await fillJsonEditor(main, careerEdited);
  await main.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(300);
  record("career: save works", (await page.locator(".status.ok").count()) >= 1);

  await page.getByPlaceholder("new-id").fill("e2e-career-item");
  await page.getByRole("button", { name: "Add" }).click();
  await page.waitForTimeout(400);
  record("career: create item", (await page.getByRole("button", { name: /e2e-career-item/i }).count()) >= 1);

  await clickNav("Articles");
  await page.getByRole("link", { name: "Test Article" }).waitFor({ timeout: 10000 });
  record("articles: list link", (await page.getByRole("link", { name: "Test Article" }).count()) >= 1);

  await page.getByRole("link", { name: "Test Article" }).click();
  await page.getByRole("button", { name: "Metadata" }).waitFor({ timeout: 10000 });
  record("article editor: metadata tab", (await page.getByRole("button", { name: "Metadata" }).count()) >= 1);

  await page.getByRole("button", { name: "Body (EN)" }).click();
  await page.getByTestId("markdown-editor").waitFor({ timeout: 10000 });
  await fillMarkdownEditor("# E2E edited body\n");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(300);
  record("article: save body", (await page.locator(".status.ok").count()) >= 1);

  await clickNav("Photo categories");
  await page.locator(".item-list button").filter({ hasText: "travel" }).first().waitFor({ timeout: 10000 });
  record("categories: item in list", (await page.getByRole("button", { name: /travel/i }).count()) >= 1);

  await page.getByRole("button", { name: /travel/i }).first().click();
  const catJson = await jsonEditorText(main);
  record("categories: JSON loads", catJson.includes("travel"));

  await openPage("/photography/photos", "Photos");
  const photoItem = page.locator(".item-list button").filter({ hasText: "test-gallery-001" });
  await photoItem.first().waitFor();
  record("photos: list item", (await photoItem.count()) >= 1);

  await photoItem.first().click();
  record("photos: preview image", (await page.locator(".panel img").count()) >= 1);

  await openPage("/photography/galleries", "Galleries");
  const galleryItem = page.locator(".item-list button").filter({ hasText: "test-gallery" });
  await galleryItem.first().waitFor({ timeout: 10000 });
  record("galleries: list item", (await galleryItem.count()) >= 1);
  record("galleries: upload for selected", (await page.getByText(/Upload images to/i).count()) >= 1);

  await openPage("/media-library", "Media library");
  await page.getByRole("heading", { name: "Media library" }).waitFor();
  await page.getByRole("button", { name: /Open folder photography/i }).waitFor({ timeout: 10000 });
  record("media: folder visible", (await page.getByRole("button", { name: /Open folder photography/i }).count()) >= 1);

  await page.locator("details.media-upload-panel summary").click();
  await page.getByPlaceholder("medium/my-gallery").fill("e2e-upload");
  await page.locator('input[type="file"]').setInputFiles(uploadFile);
  await page.waitForTimeout(600);
  record("media: upload success message", (await page.locator(".status.ok").textContent())?.includes("Uploaded"));

  const apiCheck = await page.evaluate(async () => {
    const res = await fetch("/api/content/career");
    const list = await res.json();
    return Array.isArray(list) && list.some((item) => item.id === "test-job");
  });
  record("api: career list", apiCheck);

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- CMS E2E Results ---");
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}: ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);

  if (failed.length > 0) {
    throw new Error(`${failed.length} test(s) failed: ${failed.map((f) => f.name).join(", ")}`);
  }
}
