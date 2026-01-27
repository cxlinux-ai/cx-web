import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  Shield, 
  Bug, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Mail,
  Lock,
  Package,
  RotateCcw,
  FileCheck,
  Server,
  Eye
} from "lucide-react";
import Footer from "@/components/Footer";

export default function SecurityPage() {
  const coreDesignSections = [
    {
      icon: Lock,
      title: "Principle of Least Privilege",
      content: `CX Linux operates with the minimum permissions necessary for each task. By default, operations run in user space without elevated privileges. When administrative access is required, users are prompted explicitly and shown exactly what will be executed before confirmation.`
    },
    {
      icon: Shield,
      title: "No Root by Default",
      content: `The system does not run with root permissions under normal operation. Elevated privileges are requested only when strictly necessary, and users maintain full visibility into what actions require administrative access and why.`
    },
    {
      icon: FileCheck,
      title: "Reproducible Builds",
      content: `All official releases are built deterministically. Given the same source code and build environment, the resulting binaries are identical. This allows independent verification that distributed binaries match the published source code.`
    }
  ];

  const supplyChainSections = [
    {
      icon: Package,
      title: "Verified Sources",
      content: `Dependencies are fetched only from known, authenticated sources. Package integrity is verified against published checksums before installation. The dependency tree is locked to specific versions to prevent unexpected changes.`
    },
    {
      icon: Eye,
      title: "Checksums and Integrity Validation",
      content: `Every downloaded component is validated against cryptographic checksums. Signature verification is performed where available. Failed integrity checks halt installation and alert the user rather than proceeding silently.`
    },
    {
      icon: Server,
      title: "Sandboxed Execution",
      content: `Commands execute within isolated environments with restricted filesystem and network access. This containment limits the potential impact of compromised or misbehaving software. Users can inspect and adjust sandbox policies as needed.`
    }
  ];

  const operationalSections = [
    {
      icon: CheckCircle,
      title: "Deterministic Installs",
      content: `Installation outcomes are predictable and repeatable. The same configuration produces the same result across different machines and time periods. This consistency simplifies debugging and reduces environment-specific issues.`
    },
    {
      icon: FileCheck,
      title: "Version Pinning",
      content: `All dependencies are pinned to specific versions by default. Updates occur only when explicitly requested, allowing users to control when changes are introduced. Lock files ensure consistent environments across team members and deployments.`
    },
    {
      icon: RotateCcw,
      title: "Safe Rollbacks",
      content: `System state is captured before significant changes. If an update causes issues, users can revert to the previous working state. Rollback operations are tested as part of the release process to ensure reliability when needed.`
    }
  ];

  const additionalSections = [
    {
      icon: Bug,
      title: "Vulnerability Disclosure",
      content: `We accept responsible disclosure of security vulnerabilities.

How to Report:
1. Email security@cxlinux.com with details of the vulnerability
2. Include steps to reproduce, potential impact, and any proof-of-concept
3. Allow up to 90 days for us to address the issue before public disclosure

What to Expect:
- Acknowledgment within 48 hours of your report
- Regular updates on our progress
- Credit in our security advisories (if desired)
- No legal action for good-faith security research`
    },
    {
      icon: Award,
      title: "Bug Bounty Program",
      content: `We reward security researchers who help keep CX Linux secure.

Scope:
- CX Linux core software and CLI
- Official web properties (cxlinux.com)
- API endpoints and authentication systems

Rewards:
- Critical vulnerabilities: Up to $5,000
- High severity: Up to $2,500
- Medium severity: Up to $1,000
- Low severity: Up to $250

Submit reports to: security@cxlinux.com`
    },
    {
      icon: AlertCircle,
      title: "Incident Response",
      content: `Our incident response process ensures rapid and effective handling of security events:

Detection:
- 24/7 automated monitoring and alerting
- Anomaly detection for unusual activity
- Regular log analysis and threat hunting

Response:
- Immediate containment of identified threats
- Root cause analysis and remediation
- Communication to affected users within 72 hours
- Post-incident review and improvements

Target response times:
- Critical: 4 hours
- High: 24 hours
- Medium: 72 hours
- Low: 7 days`
    },
    {
      icon: Mail,
      title: "Security Contact",
      content: `For security-related inquiries:

Email: security@cxlinux.com
PGP Key: Available at cxlinux.com/security.asc

For general inquiries:
- GitHub Issues: github.com/cxlinux-ai/cx/issues
- Discord: discord.gg/cxlinux

Enterprise customers with specific security requirements can contact us for custom assessments and dedicated support.`
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8" data-testid="link-back-home">
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Security</span>{" "}
            <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-gray-400 text-lg">
            How we design, build, and operate CX Linux with security in mind
          </p>
        </motion.div>

        {/* Security-First Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield size={24} className="text-blue-400" />
            </div>
            Security-First Design
          </h2>
          <div className="space-y-4">
            {coreDesignSections.map((section, index) => (
              <div
                key={section.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <section.icon size={18} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Supply Chain Protection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package size={24} className="text-blue-400" />
            </div>
            Supply Chain Protection
          </h2>
          <div className="space-y-4">
            {supplyChainSections.map((section, index) => (
              <div
                key={section.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <section.icon size={18} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Operational Reliability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server size={24} className="text-blue-400" />
            </div>
            Operational Reliability
          </h2>
          <div className="space-y-4">
            {operationalSections.map((section, index) => (
              <div
                key={section.title}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <section.icon size={18} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Sections */}
        <div className="space-y-6">
          {additionalSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <section.icon size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>
              <div className="text-gray-400 whitespace-pre-line leading-relaxed text-sm">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transparency Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 p-6 border border-white/10 rounded-xl bg-white/5"
        >
          <p className="text-gray-400 text-sm leading-relaxed">
            Security is an ongoing process, not a destination. We continuously review and improve our practices as threats evolve and new techniques emerge. This document reflects our current approach and will be updated as our security posture develops. Questions or concerns about our security practices can be directed to security@cxlinux.com.
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
