import { Router, Request, Response } from 'express';

const router = Router();

const REQUEST_LIMIT = 5;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;

interface RateLimitRecord {
  count: number;
  firstRequest: number;
}

const requestTracker = new Map<string, RateLimitRecord>();

// Fallback responses for when API is unavailable
const FALLBACK_RESPONSES: Record<string, string> = {
  'default': `\`\`\`bash
# CX Linux Demo - AI Service Temporarily Unavailable
# Try these commands locally after installing CX Linux:

cx "your task description here"

# Or explore with:
cx --help
cx examples
\`\`\`

**Note:** The demo AI service is temporarily unavailable. Install CX Linux to get the full experience with your own API key.`,
  'backup': `\`\`\`bash
# Automated backup setup
#!/bin/bash
BACKUP_DIR="/var/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/backup.tar.gz" /var/www
find /var/backups -mtime +7 -delete
\`\`\`

Configure with: \`crontab -e\` and add: \`0 2 * * * /usr/local/bin/backup.sh\``,
  'nginx': `\`\`\`bash
# Nginx reverse proxy configuration
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
# Config at /etc/nginx/sites-available/nodeapp
\`\`\``,
  'monitoring': `\`\`\`bash
# System monitoring setup
sudo apt install prometheus grafana -y
sudo systemctl enable prometheus grafana-server
sudo systemctl start prometheus grafana-server
# Dashboard: http://localhost:3000
\`\`\``
};

function getFallbackResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('backup')) return FALLBACK_RESPONSES['backup'];
  if (lowerInput.includes('nginx') || lowerInput.includes('proxy')) return FALLBACK_RESPONSES['nginx'];
  if (lowerInput.includes('monitor') || lowerInput.includes('alert')) return FALLBACK_RESPONSES['monitoring'];
  return FALLBACK_RESPONSES['default'];
}

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
      message: 'You have used all 5 demo requests. Install CX Linux to continue!',
      redirect: '/install'
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // If no API key, return fallback response
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured - using fallback response');
    const userMessage = req.body.messages?.find((m: any) => m.role === 'user')?.content || '';
    const fallback = getFallbackResponse(userMessage);
    return res.json({
      content: [{ type: 'text', text: fallback }],
      _demo: { remaining: rateCheck.remaining, limit: REQUEST_LIMIT, fallback: true }
    });
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
      // Return fallback on API error
      const userMessage = messages.find((m: any) => m.role === 'user')?.content || '';
      const fallback = getFallbackResponse(userMessage);
      return res.json({
        content: [{ type: 'text', text: fallback }],
        _demo: { remaining: rateCheck.remaining, limit: REQUEST_LIMIT, fallback: true }
      });
    }

    return res.json({
      ...data,
      _demo: { remaining: rateCheck.remaining, limit: REQUEST_LIMIT }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    // Return fallback on network error
    const userMessage = req.body.messages?.find((m: any) => m.role === 'user')?.content || '';
    const fallback = getFallbackResponse(userMessage);
    return res.json({
      content: [{ type: 'text', text: fallback }],
      _demo: { remaining: rateCheck.remaining, limit: REQUEST_LIMIT, fallback: true }
    });
  }
});

router.get('/api/demo/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', apiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

export default router;
