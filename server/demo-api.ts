import { Router, Request, Response } from 'express';

const router = Router();

const REQUEST_LIMIT = 5;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

const requestTracker = new Map<string, RateLimitRecord>();

function getClientId(req: Request): string {
  const ip = req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
  const cleanIp = ip.split(',')[0].trim();
  return Buffer.from(cleanIp).toString('base64').slice(0, 16);
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestTracker.get(clientId);

  if (!record || (now - record.firstRequest) > RESET_INTERVAL_MS) {
    requestTracker.set(clientId, { count: 1, firstRequest: now });
    return { allowed: true, remaining: REQUEST_LIMIT - 1 };
  }

  if (record.count >= REQUEST_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: REQUEST_LIMIT - record.count };
}

router.post('/api/demo/chat', async (req: Request, res: Response) => {
  const clientId = getClientId(req);
  const rateCheck = checkRateLimit(clientId);

  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'Demo limit reached',
      message: 'You have used all 5 demo requests. Install CX to continue!',
      redirect: '/install'
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { messages, model = 'claude-sonnet-4-20250514', max_tokens = 1024 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens, messages })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json({
        error: 'AI service error',
        details: data.error?.message || 'Unknown error'
      });
    }

    return res.json({
      ...data,
      _demo: { remaining: rateCheck.remaining, limit: REQUEST_LIMIT }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/demo/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', apiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

export default router;
