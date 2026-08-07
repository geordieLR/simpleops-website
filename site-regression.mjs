import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = 4174;
const origin = `http://127.0.0.1:${port}`;

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(origin)).ok) return;
    } catch {
      await new Promise(resolveDelay => setTimeout(resolveDelay, 50));
    }
  }
  throw new Error("Local preview did not start");
}

function requireText(source, values, file) {
  for (const value of values) {
    assert(source.includes(value), `${file} is missing: ${value}`);
  }
}

const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const routes = [...new Set([
  ...sitemapRoutes,
  "/thanks.html",
  "/services/initial-review.html",
  "/robots.txt",
  "/sitemap.xml"
])];

const preview = spawn(process.execPath, [join(root, "local-preview.mjs")], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore"
});

try {
  await waitForServer();
  for (const route of routes) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, `${route} returned ${response.status}`);
    assert((await response.arrayBuffer()).byteLength > 0, `${route} was empty`);
  }

  const pages = await htmlFiles(root);
  let internalReferences = 0;
  for (const file of pages) {
    const source = await readFile(file, "utf8");
    const label = relative(root, file);
    requireText(source, ["<title>", "name=\"viewport\"", "lang=\"en-NZ\"", "src=\"/analytics.js\""], label);
    assert.equal(source.match(/src="\/analytics\.js"/g)?.length, 1, `${label} must load analytics exactly once`);
    assert(!source.includes("AI Embedment"), `${label} still shows the former public offer name`);
    assert(!source.includes("Agent Workflow"), `${label} still shows the former public offer name`);

    for (const match of source.matchAll(/(?:href|src)=\"([^\"]+)\"/g)) {
      const value = match[1];
      if (!value.startsWith("/") || value.startsWith("//")) continue;
      const pathname = new URL(value, origin).pathname;
      const target = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
      await access(target);
      internalReferences += 1;
    }
  }

  const home = await readFile(join(root, "index.html"), "utf8");
  const services = await readFile(join(root, "services.html"), "utf8");
  const foundations = await readFile(join(root, "services/ai-embedment.html"), "utf8");
  const workflow = await readFile(join(root, "services/agent-workflow.html"), "utf8");
  const contact = await readFile(join(root, "contact.html"), "utf8");
  const privacy = await readFile(join(root, "privacy.html"), "utf8");
  const analytics = await readFile(join(root, "analytics.js"), "utf8");
  const clientScript = await readFile(join(root, "script.js"), "utf8");

  requireText(home, ["AI Foundations", "Workflow", "Custom Application"], "index.html");
  requireText(services, ["safe, consistent AI use", "human approvals", "Custom Application"], "services.html");
  requireText(foundations, ["AI Foundations", "Shared business context", "human approval rules", "That belongs in Workflow"], "services/ai-embedment.html");
  requireText(workflow, ["Workflow in practice", "The trigger", "human approvals", "exception paths", "version control"], "services/agent-workflow.html");
  requireText(contact, ["value=\"ai-embedment\">AI Foundations", "value=\"agent-workflow\">Workflow"], "contact.html");
  requireText(contact, ["data-clarity-mask=\"true\""], "contact.html");
  requireText(privacy, ["We do not sell, rent or trade", "treated as strictly confidential", "GitHub, Google, Microsoft, Apple, HubSpot, Cloudflare and OpenAI", "all contact form content is masked", "7 August 2026"], "privacy.html");
  requireText(analytics, ["https://www.clarity.ms/tag/", "xydhx37ufu", "https://www.googletagmanager.com/gtag/js?id=", "G-SYN6WEP298", "ad_storage: \"denied\"", "ad_personalization: \"denied\""], "analytics.js");
  requireText(clientScript, ["cta_select", "faq_open", "contact_start", "contact_submit", "enquiry_complete", "generate_lead"], "script.js");

  console.log(`Verified ${routes.length} local routes and ${internalReferences} internal references.`);
} finally {
  preview.kill("SIGTERM");
}
