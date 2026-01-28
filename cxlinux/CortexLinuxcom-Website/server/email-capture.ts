import { Router } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiter for email submissions (5 per minute per IP)
const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many submissions. Please try again later." },
});

// Google Sheets Web App URL (set via environment variable)
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

interface EmailSubmission {
  email: string;
  source?: string;
  timestamp?: string;
}

/**
 * POST /api/email-capture
 * Submit email to Google Sheets
 */
router.post("/", emailLimiter, async (req, res) => {
  try {
    const { email, source = "founders_waitlist" } = req.body as EmailSubmission;

    // Validate email
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Check if Google Sheets webhook is configured
    if (!GOOGLE_SHEETS_WEBHOOK_URL) {
      console.error("[Email Capture] GOOGLE_SHEETS_WEBHOOK_URL is not configured");
      return res.status(500).json({
        success: false,
        error: "Email capture is not configured. Please contact support.",
      });
    }

    // Submit to Google Sheets
    const payload = {
      email: email.toLowerCase().trim(),
      source,
      timestamp: new Date().toISOString(),
      userAgent: req.get("User-Agent") || "Unknown",
      ip: req.ip || req.socket.remoteAddress || "Unknown",
    };

    console.log(`[Email Capture] Submitting email: ${email} from source: ${source}`);

    // Google Apps Script requires following redirects and specific content type
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    console.log(`[Email Capture] Response status: ${response.status}`);
    
    // Google Apps Script returns text, try to parse as JSON
    const responseText = await response.text();
    console.log(`[Email Capture] Response text: ${responseText.substring(0, 200)}`);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      // If it's not JSON but contains success indicators, treat as success
      if (response.ok || responseText.includes("success")) {
        result = { success: true };
      } else if (responseText.includes("Page Not Found") || responseText.includes("DOCTYPE")) {
        console.error("[Email Capture] Google Sheets URL returned HTML - check deployment settings");
        return res.status(500).json({
          success: false,
          error: "Email service configuration error. Please contact support.",
        });
      } else {
        throw new Error(`Google Sheets returned: ${responseText.substring(0, 200)}`);
      }
    }

    if (!response.ok && !result?.success) {
      console.error("[Email Capture] Google Sheets error:", responseText.substring(0, 500));
      return res.status(500).json({
        success: false,
        error: "Failed to save email. Please try again.",
      });
    }

    console.log(`[Email Capture] Successfully saved email: ${email}`);

    return res.json({
      success: true,
      message: "Email successfully added to waitlist!",
    });
  } catch (error) {
    console.error("[Email Capture] Error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
});

/**
 * GET /api/email-capture/status
 * Check if email capture is configured
 */
router.get("/status", (req, res) => {
  res.json({
    configured: !!GOOGLE_SHEETS_WEBHOOK_URL,
    timestamp: new Date().toISOString(),
  });
});

export default router;
