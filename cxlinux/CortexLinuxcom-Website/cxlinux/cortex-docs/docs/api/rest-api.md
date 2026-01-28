# REST API Reference

Cortex Linux provides REST APIs for programmatic access to system management functions.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All API endpoints require authentication via API key:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8080/api/v1/health
```

Or via Bearer token:

```bash
curl -H "Authorization: Bearer your-token" http://localhost:8080/api/v1/health
```

## Health API

### GET /health

Get system health status.

**Request:**

```bash
curl http://localhost:8080/api/v1/health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "2024.1.0",
  "uptime_seconds": 432156,
  "components": {
    "cli": true,
    "ops": true,
    "llm": true,
    "security": true
  }
}
```

### GET /health/checks

Get detailed health check results.

**Request:**

```bash
curl http://localhost:8080/api/v1/health/checks
```

**Response:**

```json
{
  "summary": {
    "total": 12,
    "passed": 11,
    "warned": 1,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 1234
  },
  "results": [
    {
      "check_id": "disk_space",
      "name": "Disk Space",
      "status": "pass",
      "message": "Disk usage at 23.4%",
      "details": {
        "path": "/",
        "percent_used": 23.4,
        "total_gb": 100.0,
        "free_gb": 76.6
      },
      "duration_ms": 12
    }
  ]
}
```

### GET /health/checks/{check_id}

Get specific check result.

**Request:**

```bash
curl http://localhost:8080/api/v1/health/checks/disk_space
```

### POST /health/checks/{check_id}/fix

Apply fix for a check.

**Request:**

```bash
curl -X POST http://localhost:8080/api/v1/health/checks/apt_status/fix
```

**Response:**

```json
{
  "success": true,
  "fix_id": "apt_fix",
  "message": "APT repairs completed successfully"
}
```

---

## System API

### GET /system/info

Get system information.

**Response:**

```json
{
  "hostname": "cortex-server",
  "os": {
    "name": "Cortex Linux",
    "version": "2024.1",
    "kernel": "6.5.0-cortex"
  },
  "cpu": {
    "model": "AMD EPYC 7763",
    "cores": 64,
    "threads": 128,
    "load_percent": 12.5
  },
  "memory": {
    "total_bytes": 137438953472,
    "available_bytes": 103079215104,
    "percent_used": 25.0
  },
  "disk": {
    "path": "/",
    "total_bytes": 1073741824000,
    "free_bytes": 751619276800,
    "percent_used": 30.0
  }
}
```

### GET /system/services

List systemd services.

**Query Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `status` | Filter by status (active, inactive, failed) | all |
| `limit` | Max results | 100 |

**Response:**

```json
{
  "services": [
    {
      "name": "sshd.service",
      "description": "OpenSSH Daemon",
      "active": true,
      "running": true,
      "enabled": true
    }
  ],
  "total": 42
}
```

### POST /system/services/{name}/restart

Restart a service.

**Request:**

```bash
curl -X POST http://localhost:8080/api/v1/system/services/nginx/restart
```

### GET /system/logs

Query system logs.

**Query Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `unit` | Filter by systemd unit | - |
| `since` | Start time (RFC3339) | 1h ago |
| `until` | End time (RFC3339) | now |
| `priority` | Log priority (0-7) | all |
| `limit` | Max entries | 1000 |

**Response:**

```json
{
  "logs": [
    {
      "timestamp": "2024-01-15T12:00:00Z",
      "unit": "cortex.service",
      "priority": 6,
      "message": "Health check completed"
    }
  ],
  "total": 150
}
```

---

## Update API

### GET /updates/check

Check for available updates.

**Response:**

```json
{
  "system": {
    "available": true,
    "version": "2024.2.0",
    "release_date": "2024-01-15",
    "is_security": false,
    "changelog": "..."
  },
  "packages": {
    "total": 15,
    "security": 3,
    "updates": [
      {
        "name": "openssl",
        "current_version": "3.0.2",
        "new_version": "3.0.3",
        "is_security": true
      }
    ]
  }
}
```

### POST /updates/apply

Apply updates.

**Request Body:**

```json
{
  "type": "packages",
  "security_only": true,
  "create_snapshot": true
}
```

**Response:**

```json
{
  "success": true,
  "snapshot_id": "20240115-120000",
  "packages_updated": 3,
  "requires_reboot": false
}
```

### GET /updates/snapshots

List rollback snapshots.

**Response:**

```json
{
  "snapshots": [
    {
      "id": "20240115-120000",
      "description": "Before package updates",
      "created_at": "2024-01-15T12:00:00Z",
      "size_bytes": 52428800
    }
  ]
}
```

### POST /updates/rollback/{snapshot_id}

Rollback to snapshot.

---

## Connectors API

### GET /connectors

List LLM connectors.

**Response:**

```json
{
  "default": "anthropic",
  "connectors": [
    {
      "name": "openai",
      "provider": "OpenAI",
      "model": "gpt-4-turbo-preview",
      "status": "connected"
    },
    {
      "name": "anthropic",
      "provider": "Anthropic",
      "model": "claude-3-opus-20240229",
      "status": "connected"
    }
  ]
}
```

### POST /connectors/{name}/test

Test connector connection.

**Response:**

```json
{
  "success": true,
  "message": "Connection successful",
  "latency_ms": 234
}
```

### POST /connectors/chat

Send chat completion request.

**Request Body:**

```json
{
  "connector": "anthropic",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Response:**

```json
{
  "content": "Hello! How can I help you today?",
  "model": "claude-3-opus-20240229",
  "usage": {
    "input_tokens": 25,
    "output_tokens": 12
  }
}
```

---

## Plugins API

### GET /plugins

List plugins.

**Response:**

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "version": "1.0.0",
      "type": "command",
      "enabled": true,
      "author": "Developer"
    }
  ]
}
```

### POST /plugins/{name}/enable

Enable a plugin.

### POST /plugins/{name}/disable

Disable a plugin.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "messages",
      "issue": "Required field missing"
    }
  }
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API requests are rate limited:

- 100 requests per minute per API key
- 1000 requests per hour per API key

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

---

## WebSocket API

### /ws/logs

Stream logs in real-time.

**Connection:**

```javascript
const ws = new WebSocket('ws://localhost:8080/api/v1/ws/logs?api_key=xxx');

ws.onmessage = (event) => {
  const log = JSON.parse(event.data);
  console.log(log.message);
};

// Filter logs
ws.send(JSON.stringify({
  type: 'filter',
  unit: 'cortex.service',
  priority: 'error'
}));
```

### /ws/health

Stream health check updates.

```javascript
const ws = new WebSocket('ws://localhost:8080/api/v1/ws/health?api_key=xxx');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  if (update.status === 'fail') {
    alert(`Check failed: ${update.name}`);
  }
};
```

---

## SDK Examples

### Python

```python
import httpx

client = httpx.Client(
    base_url="http://localhost:8080/api/v1",
    headers={"X-API-Key": "your-api-key"}
)

# Get health
health = client.get("/health").json()
print(f"Status: {health['status']}")

# Run checks
checks = client.get("/health/checks").json()
for result in checks['results']:
    if result['status'] == 'fail':
        print(f"FAIL: {result['name']}")
```

### JavaScript

```javascript
const CORTEX_API = 'http://localhost:8080/api/v1';
const API_KEY = 'your-api-key';

async function getHealth() {
  const response = await fetch(`${CORTEX_API}/health`, {
    headers: { 'X-API-Key': API_KEY }
  });
  return response.json();
}

async function applyUpdates() {
  const response = await fetch(`${CORTEX_API}/updates/apply`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'packages',
      security_only: true
    })
  });
  return response.json();
}
```

### Go

```go
package main

import (
    "encoding/json"
    "net/http"
)

type HealthResponse struct {
    Status  string `json:"status"`
    Version string `json:"version"`
}

func getHealth(apiKey string) (*HealthResponse, error) {
    req, _ := http.NewRequest("GET", "http://localhost:8080/api/v1/health", nil)
    req.Header.Set("X-API-Key", apiKey)

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var health HealthResponse
    json.NewDecoder(resp.Body).Decode(&health)
    return &health, nil
}
```
