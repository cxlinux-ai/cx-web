import { Router } from "express";

const router = Router();

interface LicenseValidationRequest {
  license_key: string;
  machine_id: string;
}

interface LicenseValidationResponse {
  valid: boolean;
  error?: string;
  tier?: string;
  expires_at?: string;
  features?: string[];
}

const VALID_LICENSE_PREFIXES: Record<string, { tier: string; features: string[] }> = {
  'CORTEX-PRO-': {
    tier: 'pro',
    features: ['cloud_llms', 'web_console', 'email_support', 'priority_updates']
  },
  'CORTEX-ENT-': {
    tier: 'enterprise',
    features: ['cloud_llms', 'web_console', 'sso_ldap', 'audit_logs', 'compliance_reports', 'priority_support']
  },
  'CORTEX-MNG-': {
    tier: 'managed',
    features: ['cloud_llms', 'web_console', 'sso_ldap', 'audit_logs', 'compliance_reports', 'dedicated_support', 'custom_integrations', 'sla_guarantee']
  }
};

router.post("/validate", async (req, res) => {
  try {
    const { license_key, machine_id } = req.body as LicenseValidationRequest;

    if (!license_key || !machine_id) {
      return res.status(400).json({
        valid: false,
        error: "Missing license_key or machine_id"
      } as LicenseValidationResponse);
    }

    let matchedTier: { tier: string; features: string[] } | null = null;
    for (const [prefix, tierInfo] of Object.entries(VALID_LICENSE_PREFIXES)) {
      if (license_key.startsWith(prefix)) {
        matchedTier = tierInfo;
        break;
      }
    }

    if (!matchedTier) {
      return res.json({
        valid: false,
        error: "Invalid license key"
      } as LicenseValidationResponse);
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return res.json({
      valid: true,
      tier: matchedTier.tier,
      expires_at: expiresAt.toISOString(),
      features: matchedTier.features
    } as LicenseValidationResponse);

  } catch (error) {
    console.error("[License] Validation error:", error);
    return res.status(500).json({
      valid: false,
      error: "Internal server error"
    } as LicenseValidationResponse);
  }
});

router.post("/activate", async (req, res) => {
  try {
    const { license_key, machine_id } = req.body as LicenseValidationRequest;

    if (!license_key || !machine_id) {
      return res.status(400).json({
        success: false,
        error: "Missing license_key or machine_id"
      });
    }

    let matchedTier: { tier: string; features: string[] } | null = null;
    for (const [prefix, tierInfo] of Object.entries(VALID_LICENSE_PREFIXES)) {
      if (license_key.startsWith(prefix)) {
        matchedTier = tierInfo;
        break;
      }
    }

    if (!matchedTier) {
      return res.json({
        success: false,
        error: "Invalid license key"
      });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return res.json({
      success: true,
      message: "License activated successfully",
      tier: matchedTier.tier,
      expires_at: expiresAt.toISOString(),
      features: matchedTier.features
    });

  } catch (error) {
    console.error("[License] Activation error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

router.get("/status/:license_key", async (req, res) => {
  try {
    const { license_key } = req.params;

    if (!license_key) {
      return res.status(400).json({
        valid: false,
        error: "Missing license_key"
      });
    }

    let matchedTier: { tier: string; features: string[] } | null = null;
    for (const [prefix, tierInfo] of Object.entries(VALID_LICENSE_PREFIXES)) {
      if (license_key.startsWith(prefix)) {
        matchedTier = tierInfo;
        break;
      }
    }

    if (!matchedTier) {
      return res.json({
        valid: false,
        error: "Invalid license key"
      });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return res.json({
      valid: true,
      active: true,
      tier: matchedTier.tier,
      expires_at: expiresAt.toISOString(),
      features: matchedTier.features
    });

  } catch (error) {
    console.error("[License] Status check error:", error);
    return res.status(500).json({
      valid: false,
      error: "Internal server error"
    });
  }
});

export default router;
