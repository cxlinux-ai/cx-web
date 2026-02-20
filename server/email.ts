/**
 * Email Service Module
 *
 * Handles sending emails using Resend API
 */

import { Resend } from 'resend';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'CX Linux <hello@cxlinux.com>';
const BASE_URL = process.env.BASE_URL || 'https://cxlinux.com';

/**
 * Send verification email to new signups
 */
export async function sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
  if (!resend) {
    console.log(`[Email] Skipping verification email (no API key). Token: ${verificationToken}`);
    return true; // Return true to not block signup flow
  }

  const verificationLink = `${BASE_URL}/api/referral/verify?token=${verificationToken}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - CX Linux Waitlist',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">CX Linux</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">Verify your email address</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Thanks for joining the CX Linux waitlist! Click the button below to verify your email and secure your spot.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${verificationLink}
              </p>

              <p style="margin: 0; color: #a1a1aa; font-size: 14px;">
                This link expires in 24 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f4f4f5; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                If you didn't sign up for CX Linux, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send welcome email after email verification
 */
export async function sendWelcomeEmail(email: string, referralCode: string): Promise<boolean> {
  if (!resend) {
    console.log(`[Email] Skipping welcome email (no API key). Code: ${referralCode}`);
    return true; // Return true to not block verification flow
  }

  const referralLink = `${BASE_URL}/referrals?ref=${referralCode}`;
  const dashboardLink = `${BASE_URL}/referrals?code=${referralCode}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to CX Linux! 🎉',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Welcome to CX Linux!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Your email is verified and you're officially on the waitlist. We're excited to have you join us on this journey!
              </p>

              <!-- Referral Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Referral Code</p>
                    <p style="margin: 0; color: #18181b; font-size: 28px; font-weight: 700; letter-spacing: 2px;">${referralCode}</p>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 0 0 16px; color: #18181b; font-size: 18px; font-weight: 600;">Move up the waitlist</h3>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Share your referral link with friends to unlock rewards and climb the waitlist:
              </p>

              <!-- Rewards List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #f59e0b; font-weight: 600;">1 referral</span>
                    <span style="color: #52525b;"> → Move up 100 spots</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #a1a1aa; font-weight: 600;">3 referrals</span>
                    <span style="color: #52525b;"> → Move up 500 spots</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                    <span style="color: #eab308; font-weight: 600;">5 referrals</span>
                    <span style="color: #52525b;"> → Exclusive Discord role</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #8b5cf6; font-weight: 600;">10+ referrals</span>
                    <span style="color: #52525b;"> → Free Pro month & more!</span>
                  </td>
                </tr>
              </table>

              <!-- Share Link -->
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">Your shareable link:</p>
              <p style="margin: 0 0 24px; padding: 12px; background-color: #f4f4f5; border-radius: 6px; color: #3b82f6; font-size: 14px; word-break: break-all;">
                ${referralLink}
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${dashboardLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      View Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 32px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <h3 style="margin: 0 0 16px; color: #18181b; font-size: 16px; font-weight: 600;">What's next?</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #52525b; font-size: 14px; line-height: 1.8;">
                <li>We'll notify you when it's your turn for early access</li>
                <li>Follow us on social media for updates</li>
                <li>Join our Discord community to connect with other early adopters</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f4f4f5; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                Questions? Reply to this email or reach out on Discord.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
