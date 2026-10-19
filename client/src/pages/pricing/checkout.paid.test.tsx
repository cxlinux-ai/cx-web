import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CheckoutPage from "./checkout";

vi.mock("wouter", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/pricing/checkout?plan=pro", vi.fn()],
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

const LICENSE_CHECKOUT_URL = "https://license.cxlinux.com/api/v1/stripe/checkout-session";

describe("CheckoutPage paid checkout errors", () => {
  beforeEach(() => {
    vi.stubGlobal("location", {
      ...window.location,
      origin: "http://localhost",
      search: "?plan=pro&billing=monthly",
      href: "http://localhost/pricing/checkout?plan=pro&billing=monthly",
    });
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows inline error and re-enables Subscribe on 500", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      })
    );

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe now/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/checkout failed/i);
      expect(screen.getByRole("alert")).toHaveTextContent(/internal server error/i);
    });

    const subscribeButton = screen.getByRole("button", { name: /subscribe now/i });
    expect(subscribeButton).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /contact support/i })).toHaveAttribute(
      "href",
      "mailto:support@cxlinux.com"
    );
    expect(fetch).toHaveBeenCalledWith(
      LICENSE_CHECKOUT_URL,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows inline error on network failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe now/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/network error/i);
    });

    expect(screen.getByRole("button", { name: /subscribe now/i })).not.toBeDisabled();
  });

  it("retry clears error and submits again", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Temporary failure" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          url: "https://checkout.stripe.com/c/pay/cs_test_retry",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        origin: "http://localhost",
        search: "?plan=pro&billing=monthly",
        set href(url: string) {
          hrefSetter(url);
        },
        get href() {
          return "http://localhost/pricing/checkout?plan=pro&billing=monthly";
        },
      },
      writable: true,
    });

    render(<CheckoutPage />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe now/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^retry$/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
