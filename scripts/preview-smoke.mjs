#!/usr/bin/env node
/**
 * Headless smoke test for Cloudflare Pages preview.
 * Usage: node scripts/preview-smoke.mjs <origin>
 */
import { chromium } from "playwright";

const origin = process.argv[2];
if (!origin) {
  console.error("Usage: node scripts/preview-smoke.mjs <origin>");
  process.exit(1);
}

const routes = [
  { name: "home", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "blog post", path: "/blog/what-is-cx-linux" },
  { name: "checkout", path: "/pricing/checkout?plan=pro&billing=monthly" },
];

const failedResponses = [];
const consoleErrors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on("response", (res) => {
  const url = res.url();
  if (!url.startsWith(origin)) return;
  if (res.status() === 404) {
    failedResponses.push(`${res.status()} ${url}`);
  }
});

page.on("console", (msg) => {
  if (msg.type() === "error") {
    consoleErrors.push(msg.text());
  }
});

for (const route of routes) {
  const url = `${origin}${route.path}`;
  console.log(`\n--- ${route.name}: ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  const title = await page.title();
  console.log(`title: ${title}`);
}

await browser.close();

console.log("\n=== Network 404s on origin ===");
if (failedResponses.length === 0) {
  console.log("(none)");
} else {
  failedResponses.forEach((line) => console.log(line));
}

console.log("\n=== Console errors ===");
if (consoleErrors.length === 0) {
  console.log("(none)");
} else {
  consoleErrors.forEach((line) => console.log(line));
}

if (failedResponses.length > 0 || consoleErrors.length > 0) {
  process.exit(1);
}
