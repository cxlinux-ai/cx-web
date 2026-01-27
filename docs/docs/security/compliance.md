# Compliance Guide

Compliance frameworks and controls for Cortex Linux deployments.

## Supported Frameworks

| Framework | Description | Status |
|-----------|-------------|--------|
| CIS Benchmarks | Center for Internet Security | Automated |
| SOC 2 | Service Organization Control | Mappings |
| HIPAA | Healthcare data protection | Mappings |
| PCI DSS | Payment card security | Mappings |
| GDPR | EU data protection | Mappings |
| NIST 800-53 | Federal security controls | Mappings |

---

## CIS Benchmarks

### Running CIS Scan

```bash
# Full CIS scan
cortex-security scan --benchmark cis-ubuntu-22.04

# Specific section
cortex-security scan --benchmark cis-ubuntu-22.04 --section 5

# Generate report
cortex-security scan --benchmark cis-ubuntu-22.04 --output report.html
```

### CIS Control Categories

#### 1. Initial Setup

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 1.1.x | Filesystem Configuration | Yes |
| 1.2.x | Package Manager Configuration | Yes |
| 1.3.x | Mandatory Access Control | Partial |
| 1.4.x | Secure Boot Settings | Manual |

```bash
# Example: 1.1.1 - Disable unused filesystems
echo "install cramfs /bin/true" >> /etc/modprobe.d/cramfs.conf
echo "install freevxfs /bin/true" >> /etc/modprobe.d/freevxfs.conf
echo "install jffs2 /bin/true" >> /etc/modprobe.d/jffs2.conf
echo "install hfs /bin/true" >> /etc/modprobe.d/hfs.conf
echo "install hfsplus /bin/true" >> /etc/modprobe.d/hfsplus.conf
```

#### 2. Services

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 2.1.x | Special Purpose Services | Yes |
| 2.2.x | Service Clients | Yes |

```bash
# Example: 2.1.1 - Ensure time sync is configured
sudo apt install chrony
sudo systemctl enable chronyd
sudo systemctl start chronyd
```

#### 3. Network Configuration

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 3.1.x | Network Parameters (Host) | Yes |
| 3.2.x | Network Parameters (Router) | Yes |
| 3.3.x | TCP Wrappers | Partial |
| 3.4.x | Firewall Configuration | Partial |

#### 4. Logging and Auditing

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 4.1.x | Configure System Accounting | Yes |
| 4.2.x | Configure Logging | Yes |
| 4.3.x | Ensure logrotate is configured | Yes |

#### 5. Access, Authentication and Authorization

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 5.1.x | Configure time-based job schedulers | Yes |
| 5.2.x | SSH Server Configuration | Yes |
| 5.3.x | Configure PAM | Partial |
| 5.4.x | User Accounts and Environment | Partial |

#### 6. System Maintenance

| Control | Description | Auto-Fix |
|---------|-------------|----------|
| 6.1.x | System File Permissions | Yes |
| 6.2.x | User and Group Settings | Partial |

### Auto-Remediation

```bash
# Fix all safe controls
cortex-security harden --benchmark cis --auto-fix --safe-only

# Generate remediation script
cortex-security scan --benchmark cis --output-remediation remediate.sh

# Review and apply
cat remediate.sh
chmod +x remediate.sh
sudo ./remediate.sh
```

---

## SOC 2

### Trust Service Criteria Mapping

#### Security (CC)

| Criteria | Control | Cortex Implementation |
|----------|---------|----------------------|
| CC1.1 | COSO Principle 1 | Organization policies |
| CC2.1 | Board/Management | Cortex Security config |
| CC3.1 | Risk Assessment | `cortex-security scan` |
| CC4.1 | Monitoring | Cortex Observe |
| CC5.1 | Control Activities | AppArmor, audit |
| CC6.1-6.8 | Logical/Physical Access | SSH, firewall, logs |
| CC7.1-7.5 | System Operations | `cortex-ops doctor` |
| CC8.1 | Change Management | Update rollback |
| CC9.1-9.2 | Risk Mitigation | Backup, DR |

#### Availability (A)

| Criteria | Control | Cortex Implementation |
|----------|---------|----------------------|
| A1.1 | Capacity Management | Cortex Observe metrics |
| A1.2 | Environmental Protection | Hardware monitoring |
| A1.3 | Recovery | Backup/restore, rollback |

### Evidence Collection

```bash
# Generate SOC 2 evidence bundle
cortex-security evidence --framework soc2 --output evidence/

# Includes:
# - System configuration snapshots
# - Access control lists
# - Audit logs
# - Change history
# - Health check reports
```

---

## HIPAA

### Technical Safeguards

| Safeguard | Requirement | Implementation |
|-----------|-------------|----------------|
| Access Control | Unique user identification | PAM, SSH keys |
| Access Control | Emergency access procedure | Break-glass accounts |
| Access Control | Automatic logoff | SSH timeout |
| Access Control | Encryption | TLS, disk encryption |
| Audit Controls | Record examination | auditd, Cortex Observe |
| Integrity | Mechanism to authenticate ePHI | Checksums, AIDE |
| Transmission Security | Integrity controls | TLS 1.2+ |
| Transmission Security | Encryption | TLS, VPN |

### Configuration

```yaml
# /etc/cortex/compliance/hipaa.yaml
framework: hipaa

controls:
  access_control:
    unique_user_id: true
    auto_logoff_minutes: 15
    emergency_access: true

  audit:
    enabled: true
    retention_days: 365
    tamper_proof: true

  encryption:
    at_rest: true
    in_transit: true
    min_tls_version: "1.2"

  integrity:
    file_integrity_monitoring: true
    aide_enabled: true
```

### HIPAA Audit

```bash
# Run HIPAA compliance check
cortex-security scan --framework hipaa

# Generate HIPAA report
cortex-security report --framework hipaa --output hipaa-report.pdf
```

---

## PCI DSS

### Requirements Mapping

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| 1 | Install firewall | UFW, nftables |
| 2 | Change vendor defaults | Security hardening |
| 3 | Protect stored data | Encryption at rest |
| 4 | Encrypt transmission | TLS 1.2+ |
| 5 | Protect against malware | ClamAV, AIDE |
| 6 | Secure systems and apps | Updates, hardening |
| 7 | Restrict access | RBAC, sudo |
| 8 | Identify and authenticate | PAM, MFA |
| 9 | Restrict physical access | Physical security |
| 10 | Track and monitor | auditd, logging |
| 11 | Test security | `cortex-security scan` |
| 12 | Information security policy | Documentation |

### PCI Scan

```bash
# Run PCI DSS scan
cortex-security scan --framework pci-dss

# Requirements 10 - Logging
cortex-security scan --framework pci-dss --requirement 10
```

---

## GDPR

### Data Protection Controls

| Article | Requirement | Implementation |
|---------|-------------|----------------|
| 5 | Data processing principles | Audit logging |
| 25 | Privacy by design | Security defaults |
| 30 | Records of processing | Audit logs |
| 32 | Security of processing | Encryption, access control |
| 33 | Breach notification | Alerting, monitoring |
| 34 | Communication to data subject | Audit trails |

### Data Subject Rights

```bash
# Export user data
cortex-gdpr export --user user@example.com --output export.zip

# Delete user data (right to erasure)
cortex-gdpr delete --user user@example.com --confirm

# Generate processing records
cortex-gdpr records --output processing-records.csv
```

---

## Compliance Dashboard

### Configuration

```yaml
# /etc/cortex/compliance/config.yaml
compliance:
  frameworks:
    - cis
    - soc2
    - hipaa

  scan_schedule: "0 0 * * 0"  # Weekly

  reporting:
    email:
      to: compliance@example.com
      on_failure: true
    webhook:
      url: https://api.example.com/compliance
    storage:
      path: /var/lib/cortex/compliance/
      retention_days: 365

  alerting:
    on_critical: true
    on_high: true
    channels:
      - email
      - slack
```

### Dashboard Access

```bash
# Start compliance dashboard
cortex-security dashboard --port 8443

# Access at https://localhost:8443
```

---

## Continuous Compliance

### Automated Scanning

```bash
# /etc/cron.d/compliance
# Daily CIS scan
0 2 * * * root cortex-security scan --benchmark cis --output /var/lib/cortex/compliance/daily/

# Weekly comprehensive scan
0 3 * * 0 root cortex-security scan --all-frameworks --output /var/lib/cortex/compliance/weekly/
```

### Integration with CI/CD

```yaml
# .github/workflows/compliance.yml
name: Compliance Check

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

jobs:
  compliance:
    runs-on: self-hosted
    steps:
      - name: Run CIS Benchmark
        run: cortex-security scan --benchmark cis --json > cis-results.json

      - name: Check for failures
        run: |
          FAILURES=$(jq '.summary.failed' cis-results.json)
          if [ "$FAILURES" -gt 0 ]; then
            echo "CIS benchmark has $FAILURES failures"
            exit 1
          fi

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: compliance-results
          path: cis-results.json
```

---

## Audit Preparation

### Pre-Audit Checklist

- [ ] Run comprehensive compliance scan
- [ ] Generate all required reports
- [ ] Review and remediate critical findings
- [ ] Document exceptions with justifications
- [ ] Prepare evidence artifacts
- [ ] Test sampling of controls
- [ ] Review access logs
- [ ] Verify backup/restore procedures

### Evidence Package

```bash
# Generate complete evidence package
cortex-security evidence --all-frameworks --output /evidence/

# Package contents:
# /evidence/
# ├── configuration/
# │   ├── sshd_config
# │   ├── firewall_rules
# │   └── audit_rules
# ├── reports/
# │   ├── cis-scan.html
# │   ├── vulnerability-scan.html
# │   └── access-review.html
# ├── logs/
# │   ├── audit.log (sample)
# │   └── auth.log (sample)
# └── policies/
#     ├── security-policy.md
#     └── acceptable-use.md
```
