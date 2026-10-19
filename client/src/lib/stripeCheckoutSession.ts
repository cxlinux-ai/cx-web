import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export interface CreateCheckoutSessionInput {
  email: string;
  name: string;
  planId: string;
  billingCycle: "annual" | "monthly";
  referralCode: string;
  successUrl: string;
  cancelUrl: string;
}

export class CheckoutSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutSessionError";
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function createCheckoutSession(
  licenseServer: string,
  input: CreateCheckoutSessionInput,
  options?: { timeoutMs?: number }
): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? 30_000;

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${licenseServer}/api/v1/stripe/checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          name: input.name,
          planId: input.planId,
          billingCycle: input.billingCycle,
          referralCode: input.referralCode,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
        }),
      },
      timeoutMs
    );
  } catch (error) {
    if (isAbortError(error)) {
      throw new CheckoutSessionError("Checkout timed out. Please try again.");
    }
    throw new CheckoutSessionError(
      "Network error. Check your connection and try again."
    );
  }

  let data: Record<string, unknown>;
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new CheckoutSessionError("Unexpected response from checkout server.");
  }

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : "Failed to create checkout session";
    throw new CheckoutSessionError(message);
  }

  if (data.ok === false) {
    const message =
      typeof data.error === "string"
        ? data.error
        : "Failed to create checkout session";
    throw new CheckoutSessionError(message);
  }

  const url = data.url;
  if (typeof url !== "string" || !url) {
    throw new CheckoutSessionError("No checkout URL returned");
  }

  return url;
}
