/**
 * Email service using Resend for transactional emails.
 *
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Add domain cxlinux.com (or use onboarding@resend.dev for testing)
 * 3. Add RESEND_API_KEY to Replit secrets
 */

import { Resend } from "resend";

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY not configured - License emails will be disabled");
}

// Use onboarding@resend.dev for testing, or licenses@cxlinux.com for production
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FROM_NAME = "CX Linux";

interface LicenseEmailParams {
  email: string;
  licenseKey: string;
  planName: string;
  planId: string;
  trialDays?: number;
  expiresAt?: Date;
}

/**
 * Send license key email after successful purchase.
 */
export async function sendLicenseEmail(params: LicenseEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured, skipping license email");
    return false;
  }

  const { email, licenseKey, planName, planId, trialDays, expiresAt } = params;

  const trialMessage = trialDays
    ? `<p style="color:#059669;font-weight:600;">🎉 Your ${trialDays}-day free trial has started!</p>`
    : "";

  const expiryMessage = expiresAt
    ? `<p style="color:#6b7280;font-size:14px;">License valid until: ${expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CX Linux ${planName} License</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:20px;">

  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#7c3aed;margin:0;font-size:28px;">🚀 Welcome to CX Linux ${planName}!</h1>
  </div>

  ${trialMessage}

  <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0;">
    <p style="margin:0 0 8px 0;color:#64748b;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Your License Key</p>
    <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#1e293b;word-break:break-all;">
      ${licenseKey}
    </p>
    ${expiryMessage}
  </div>

  <h2 style="color:#1e293b;font-size:20px;margin-top:32px;">⚡ Quick Start</h2>

  <div style="background:#0f172a;border-radius:8px;padding:20px;margin:16px 0;">
    <p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;">Step 1: Install CX Linux</p>
    <code style="color:#22d3ee;font-size:14px;">curl -fsSL https://get.cxlinux.com | bash</code>
  </div>

  <div style="background:#0f172a;border-radius:8px;padding:20px;margin:16px 0;">
    <p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;">Step 2: Activate your license</p>
    <code style="color:#22d3ee;font-size:14px;">cx activate ${licenseKey}</code>
  </div>

  <div style="background:#0f172a;border-radius:8px;padding:20px;margin:16px 0;">
    <p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;">Step 3: Start using CX Linux</p>
    <code style="color:#22d3ee;font-size:14px;">cx "install the latest stable pytorch with CUDA support"</code>
  </div>

  <h2 style="color:#1e293b;font-size:20px;margin-top:32px;">📚 Resources</h2>

  <table style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
        <a href="https://docs.cxlinux.com/pro/quickstart" style="color:#7c3aed;text-decoration:none;font-weight:600;">Quick Start Guide →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
        <a href="https://docs.cxlinux.com/pro/features" style="color:#7c3aed;text-decoration:none;font-weight:600;">Feature Documentation →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
        <a href="https://cxlinux.com/billing" style="color:#7c3aed;text-decoration:none;font-weight:600;">Manage Subscription →</a>
      </td>
    </tr>
    <tr>
      <td style="padding:12px 0;">
        <a href="https://github.com/cxlinux-ai/cx/discussions" style="color:#7c3aed;text-decoration:none;font-weight:600;">Community Support →</a>
      </td>
    </tr>
  </table>

  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;color:#9ca3af;font-size:14px;">
    <p style="margin:0 0 8px 0;">Need help? Reply to this email or visit our <a href="https://docs.cxlinux.com" style="color:#7c3aed;">documentation</a>.</p>
    <p style="margin:0;">© ${new Date().getFullYear()} CX Linux. All rights reserved.</p>
  </div>

</body>
</html>
`;

  const text = `
Welcome to CX Linux ${planName}!

Your License Key: ${licenseKey}

Quick Start:
1. Install CX Linux:
   curl -fsSL https://get.cxlinux.com | bash

2. Activate your license:
   cx activate ${licenseKey}

3. Start using CX Linux:
   cx "install the latest stable pytorch with CUDA support"

Resources:
- Quick Start: https://docs.cxlinux.com/pro/quickstart
- Documentation: https://docs.cxlinux.com/pro/features
- Manage Subscription: https://cxlinux.com/billing
- Community: https://github.com/cxlinux-ai/cx/discussions

Need help? Reply to this email or visit https://docs.cxlinux.com

© ${new Date().getFullYear()} CX Linux. All rights reserved.
`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Your CX Linux ${planName} License Key`,
      html,
      text,
      tags: [
        { name: "type", value: "license" },
        { name: "plan", value: planId },
      ],
    });

    if (error) {
      console.error("Failed to send license email:", error);
      return false;
    }

    console.log(`License email sent to ${email}, id: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("Error sending license email:", error);
    return false;
  }
}

/**
 * Send license renewal reminder email.
 */
export async function sendRenewalReminderEmail(
  email: string,
  licenseKey: string,
  planName: string,
  expiresAt: Date,
  daysRemaining: number
): Promise<boolean> {
  if (!resend) {
    console.warn("Resend not configured, skipping renewal email");
    return false;
  }

  const urgencyColor = daysRemaining <= 3 ? "#dc2626" : daysRemaining <= 7 ? "#f59e0b" : "#6b7280";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CX Linux License Renewal Reminder</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:20px;">

  <h1 style="color:#1e293b;margin-bottom:24px;">⏰ License Renewal Reminder</h1>

  <p style="font-size:18px;color:${urgencyColor};font-weight:600;">
    Your CX Linux ${planName} license expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.
  </p>

  <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
    <p style="margin:0;color:#92400e;">
      <strong>Expiration Date:</strong> ${expiresAt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </p>
  </div>

  <p>To ensure uninterrupted access to CX Linux ${planName} features, please renew your subscription.</p>

  <div style="text-align:center;margin:32px 0;">
    <a href="https://cxlinux.com/billing" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
      Renew Now →
    </a>
  </div>

  <p style="color:#6b7280;font-size:14px;">
    License Key: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;">${licenseKey}</code>
  </p>

  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;color:#9ca3af;font-size:14px;">
    <p style="margin:0;">Questions? Reply to this email for support.</p>
  </div>

</body>
</html>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `⏰ Your CX Linux ${planName} license expires in ${daysRemaining} days`,
      html,
      tags: [
        { name: "type", value: "renewal_reminder" },
        { name: "days_remaining", value: String(daysRemaining) },
      ],
    });

    if (error) {
      console.error("Failed to send renewal email:", error);
      return false;
    }

    console.log(`Renewal reminder sent to ${email}, id: ${data?.id}`);
    return true;
  } catch (error) {
    console.error("Error sending renewal email:", error);
    return false;
  }
}

/**
 * Send license suspended notification.
 */
export async function sendLicenseSuspendedEmail(
  email: string,
  planName: string,
  reason: string
): Promise<boolean> {
  if (!resend) {
    return false;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CX Linux License Suspended</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:20px;">

  <h1 style="color:#dc2626;margin-bottom:24px;">⚠️ License Suspended</h1>

  <p>Your CX Linux ${planName} license has been suspended due to: <strong>${reason}</strong></p>

  <p>Your Pro features have been temporarily disabled. To restore access:</p>

  <ol>
    <li>Visit your <a href="https://cxlinux.com/billing" style="color:#7c3aed;">billing portal</a></li>
    <li>Update your payment method</li>
    <li>Your license will be automatically reactivated</li>
  </ol>

  <div style="text-align:center;margin:32px 0;">
    <a href="https://cxlinux.com/billing" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
      Update Payment →
    </a>
  </div>

  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;color:#9ca3af;font-size:14px;">
    <p>Need help? Reply to this email or contact support@cxlinux.com</p>
  </div>

</body>
</html>
`;

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `⚠️ Your CX Linux ${planName} license has been suspended`,
      html,
      tags: [{ name: "type", value: "license_suspended" }],
    });

    return !error;
  } catch {
    return false;
  }
}
