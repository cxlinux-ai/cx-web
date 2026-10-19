import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CheckoutSessionError,
  createCheckoutSession,
} from "./stripeCheckoutSession";

const LICENSE_SERVER = "https://license.cxlinux.com";

const baseInput = {
  email: "user@example.com",
  name: "Test User",
  planId: "pro",
  billingCycle: "monthly" as const,
  referralCode: "",
  successUrl: "http://localhost/pricing/success?session_id={CHECKOUT_SESSION_ID}",
  cancelUrl: "http://localhost/pricing/checkout?plan=pro",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createCheckoutSession", () => {
  it("throws on HTTP 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      })
    );

    await expect(
      createCheckoutSession(LICENSE_SERVER, baseInput)
    ).rejects.toThrow(CheckoutSessionError);

    await expect(
      createCheckoutSession(LICENSE_SERVER, baseInput)
    ).rejects.toThrow("Internal server error");
  });

  it("throws on ok=false in response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: false, error: "Plan unavailable" }),
      })
    );

    await expect(
      createCheckoutSession(LICENSE_SERVER, baseInput)
    ).rejects.toThrow("Plan unavailable");
  });

  it("throws on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(
      createCheckoutSession(LICENSE_SERVER, baseInput)
    ).rejects.toThrow("Network error");
  });

  it("returns checkout URL on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          url: "https://checkout.stripe.com/c/pay/cs_test_123",
        }),
      })
    );

    const url = await createCheckoutSession(LICENSE_SERVER, baseInput);
    expect(url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
  });
});
