# CX Linux Agent Profile Generator

## Overview

The Dynamic Agent Profile Generator creates monochromatic purple 'Service Records' for CX Linux agents, showcasing BSL 1.1 compliance and autonomous achievements.

## Features

### 🟣 Monochromatic Purple Design
- Gradient backgrounds from purple-950 to purple-900
- Purple accent colors throughout (400/20, 500/30, 600/30)
- Consistent purple theming for professional appearance

### 🛡️ BSL 1.1 Compliance Tracking
- Real-time compliance score calculation (60-100%)
- License key validation status
- Source code protection monitoring
- Commercial use compliance verification

### 🏆 Autonomous Wins System
- **Security Wins**: Blocked unauthorized access, detected threats, prevented exploits
- **Performance Wins**: Optimized resources, improved response times, enhanced efficiency
- **Automation Wins**: Automated tasks, workflow improvements, scheduled operations
- **Prevention Wins**: Avoided system failures, prevented data loss, stopped attacks

### 📊 Real-time Metrics
- System uptime percentage (95-99%)
- Threats blocked counter
- Commands executed successfully
- Average response time monitoring

## Implementation

### 1. Database Schema (`shared/agents-schema.ts`)
```sql
-- Core agent management tables
agents              -- Agent registration and status
fleet_status        -- System-wide deployment tracking
agent_requests      -- Command execution logging
system_health       -- Real-time health monitoring
agent_capabilities  -- Agent capability definitions
```

### 2. API Endpoints (`server/agent-profiles.ts`)
```
GET  /api/agents                    -- List all agent profiles
GET  /api/agents/:id/profile        -- Get detailed agent service record
POST /api/agents/sample             -- Create sample agents for demo
```

### 3. UI Components
- `AgentServiceRecord.tsx` - Detailed service record display
- `AgentProfilesPage.tsx` - Fleet management dashboard

## Usage

### Access the Agent Fleet Dashboard
Navigate to `/agent-profiles` to view the fleet overview dashboard.

### Create Sample Agents
```bash
curl -X POST http://localhost:5000/api/agents/sample
```

This creates 3 sample agents:
- **SYSTEM**: Core monitoring (disk, CPU, memory, services)
- **FILE**: File operations and security
- **DOCKER**: Container orchestration and scanning

### View Individual Service Records
Click any agent in the fleet dashboard to view its detailed service record with:
- Unique agent ID and host information
- BSL 1.1 compliance score and status
- Performance metrics and uptime stats
- Complete autonomous wins history
- Agent capabilities and configuration

### Export Fleet Reports
Use the "Export Fleet Report" button to download JSON reports containing:
- Fleet-wide statistics
- Individual agent metrics
- Compliance summaries
- Autonomous wins totals

## Autonomous Wins Generation

The system automatically generates realistic autonomous wins based on agent type:

### Security Agent Wins
- "Blocked unauthorized sudo attempt" (5-20 instances)
- "Detected suspicious network activity" (2-10 instances)
- "Stopped malicious file execution" (1-6 instances)

### System Agent Wins
- "Optimized system resource allocation" (10-30 instances)
- "Automated disk cleanup procedures" (8-20 instances)
- "Prevented system overload" (3-9 instances)

### File Agent Wins
- "Detected corrupted file integrity" (4-12 instances)
- "Automated backup verification" (15-40 instances)
- "Optimized file system operations" (12-30 instances)

### Package Agent Wins
- "Blocked vulnerable package installation" (3-10 instances)
- "Automated security updates" (20-50 instances)
- "Prevented dependency conflicts" (8-23 instances)

### Git Agent Wins
- "Detected credential exposure attempt" (2-6 instances)
- "Automated branch protection enforcement" (6-18 instances)
- "Prevented force push to main branch" (1-4 instances)

### Docker Agent Wins
- "Scanned container images for vulnerabilities" (15-35 instances)
- "Automated container health checks" (25-60 instances)
- "Prevented privileged container execution" (2-7 instances)

## Service Record Features

### Interactive Elements
- **Export Service Record**: Download agent data as JSON
- **Share Service Record**: Native sharing or clipboard copy
- **Expand/Collapse**: View full autonomous wins history
- **Real-time Updates**: Live monitoring status indicator

### Visual Design
- Purple gradient backgrounds with subtle patterns
- Status indicators with color coding (green=active, red=error, yellow=inactive)
- Progress bars for compliance scores
- Icon-based win categorization
- Responsive grid layout for metrics

### BSL 1.1 Compliance Display
- Visual compliance score (60-100%) with animated progress bar
- Checkmark indicators for license validation status
- Source code protection and monitoring confirmations
- Commercial use compliance verification

## Integration with Rust Core

The agent profiles are designed to integrate with the CX Terminal Rust core:

### Agent Registration
```rust
// In wezterm-gui/src/agents/runtime.rs
pub async fn register_with_cloud(&self, license_key: &str) -> Result<(), AgentError> {
    // HTTP POST to /api/agents/register with system info
}
```

### Health Reporting
```rust
// New module: wezterm-gui/src/fleet/health.rs
pub async fn report_health(&self) -> Result<(), FleetError> {
    // HTTP POST to /api/fleet/health with system metrics
}
```

### License Validation
```rust
// In wezterm-gui/src/subscription/
pub async fn validate_license(&self) -> Result<LicenseStatus, LicenseError> {
    // HTTP GET to /api/license/validate
}
```

## Next Steps

1. **Database Migration**: Add agent tables to production database
2. **API Implementation**: Complete fleet management endpoints
3. **Rust Integration**: Add HTTP client to CX Terminal
4. **Real-time Updates**: WebSocket connections for live monitoring
5. **Enterprise Dashboard**: Advanced fleet management UI

The Agent Profile Generator provides a complete foundation for enterprise-grade agent monitoring with BSL 1.1 compliance tracking and autonomous achievement recognition.