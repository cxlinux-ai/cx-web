#!/usr/bin/env node
/**
 * E2E checkout proof: pricing → checkout form → license.cxlinux.com session → Stripe hosted page.
 * Stops on checkout.stripe.com (no card entry).
 * Usage: node scripts/checkout-stripe-proof.mjs <pages-origin>
 */
import { chromium } from "playwright";

const origin = process.argv[2] || "https://cursor-fix-spa-routing-prici.cx-web.pages.dev";
const ts = Date.now();
const testEmail = `playwright-e2e+${ts}@cxlinux.test`;
const testName = "Playwright E2E";

const CHECKOUT_API_HOST = "license.cxlinux.com";
const CHECKOUT_API_PATH = "/api/v1/stripe/checkout-session";

const plans = [
  { tier: "Core+ (pro)", pricingCta: "Start with Core+", planParam: "pro" },
  { tier: "Team", pricingCta: "Start Team Plan", planParam: "team" },
];

const results = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

for (const plan of plans) {
  const sessionEvents = [];
  console.log(`\n========== ${plan.tier} ==========`);

  page.removeAllListeners("request");
  page.removeAllListeners("response");

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes(CHECKOUT_API_HOST) && url.includes("checkout-session")) {
      sessionEvents.push({ type: "request", method: req.method(), url });
    }
  });

  page.on("response", (res) => {
    const url = res.url();
    if (url.includes(CHECKOUT_API_HOST) && url.includes("checkout-session")) {
      sessionEvents.push({
        type: "response",
        status: res.status(),
        ok: res.ok(),
      });
    }
  });

  await page.goto(`${origin}/pricing`, { waitUntil: "networkidle", timeout: 90000 });

  const cta = page.getByRole("link", { name: plan.pricingCta }).first();
  await cta.click();
  await page.waitForURL(/\/pricing\/checkout/, { timeout: 30000 });
  console.log(`checkout page: ${page.url()}`);

  await page.getByLabel(/Full Name/i).fill(testName);
  await page.getByLabel(/^Email/i).fill(testEmail);

  const sessionResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes(CHECKOUT_API_HOST) &&
      res.url().includes("checkout-session") &&
      res.request().method() === "POST",
    { timeout: 60000 },
  );

  await page.getByRole("button", { name: "Subscribe Now" }).click();

  let sessionStatus;
  let sessionOk;
  let sessionHasStripeUrl = false;
  try {
    const sessionRes = await sessionResponsePromise;
    sessionStatus = sessionRes.status();
    sessionOk = sessionRes.ok();
    const json = await sessionRes.json();
    sessionHasStripeUrl = Boolean(json.url?.includes("checkout.stripe.com"));
  } catch (e) {
    sessionStatus = `error: ${e.message}`;
    sessionOk = false;
  }

  try {
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60000 });
  } catch (e) {
    const errText = await page.locator("text=Checkout Error").count();
    results.push({ plan: plan.tier, success: false, error: String(e), checkoutErrorUi: errText > 0 });
    console.log("FAILED to reach Stripe:", e.message);
    continue;
  }

  const finalUrl = page.url();
  const stripeHost = new URL(finalUrl).host;
  const apiCall = sessionEvents.find((e) => e.type === "request");

  results.push({
    plan: plan.tier,
    success: stripeHost === "checkout.stripe.com",
    checkoutApiUrl: apiCall?.url ?? `https://${CHECKOUT_API_HOST}${CHECKOUT_API_PATH}`,
    checkoutApiMethod: apiCall?.method ?? "POST",
    checkoutApiStatus: sessionStatus,
    checkoutApiOk: sessionOk,
    checkoutApiReturnedStripeUrl: sessionHasStripeUrl,
    stripeUrl: finalUrl.split("?")[0].replace(/cs_live_[^/]+/, "cs_live_[REDACTED]"),
  });

  console.log(`checkout API request: ${apiCall?.method ?? "POST"} ${apiCall?.url ?? `https://${CHECKOUT_API_HOST}${CHECKOUT_API_PATH}`}`);
  console.log(`checkout API response: HTTP ${sessionStatus} ok=${sessionOk} json.url→stripe=${sessionHasStripeUrl}`);
  console.log(`Stripe URL host: ${stripeHost}`);
  console.log(`Stripe URL (redacted): ${results.at(-1).stripeUrl}`);

  await page.goto(`${origin}/pricing`, { waitUntil: "domcontentloaded" });
}

await browser.close();

console.log("\n========== SUMMARY ==========");
console.log(`Pages origin: ${origin}`);
console.log(`Checkout session API host: https://${CHECKOUT_API_HOST}${CHECKOUT_API_PATH}`);
console.log(`(Not ${origin}/api — Pages /api 404 does not affect checkout.)`);
console.log(JSON.stringify(results, null, 2));

const allOk = results.every((r) => r.success);
process.exit(allOk ? 0 : 1);
