import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Code,
  Server,
  Eye,
  Database,
  Zap,
  CheckCircle,
  FileText,
  AlertTriangle,
  Globe,
  HardDrive,
  Cpu,
  GitBranch
} from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

export default function TrustCenter() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Trust Center | CX Linux - Security, Privacy & Compliance',
      description: 'CX Linux Trust Center: BSL 1.1 licensing, zero telemetry architecture, Rust memory safety, SOC2 & HIPAA compliance. Enterprise-grade security for your digital sovereignty.',
      canonicalPath: '/trust',
      keywords: [
        'CX Linux security',
        'zero telemetry',
        'BSL 1.1 license',
        'Rust memory safety',
        'SOC2 compliance',
        'HIPAA compliance',
        'enterprise security',
        'data sovereignty',
        'local persistence',
        'atomic rollback'
      ]
    });
    return cleanup;
  }, []);

  const securityFeatures = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Memory Safety Guaranteed",
      description: "Rust-based core eliminates buffer overflows, null pointer dereferences, and memory corruption vulnerabilities.",
      technical: "Zero-cost abstractions with compile-time memory safety verification"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Atomic Rollback System",
      description: "Every system change can be instantly reverted with atomic transactions and immutable snapshots.",
      technical: "Copy-on-write filesystem with cryptographic integrity verification"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Local-First Encryption",
      description: "All data encrypted at rest and in transit. Keys never leave your hardware.",
      technical: "AES-256-GCM with hardware security module integration"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Zero Telemetry Architecture",
      description: "No data collection, no phone-home, no tracking. Your activities remain completely private.",
      technical: "Air-gapped by design with optional encrypted sync"
    }
  ];

  const complianceStandards = [
    {
      standard: "SOC 2 Type II",
      status: "In Progress",
      description: "Security, availability, and confidentiality controls",
      timeline: "Q2 2026",
      color: "text-yellow-400"
    },
    {
      standard: "HIPAA Compliance",
      status: "Architecture Ready",
      description: "Healthcare data protection and privacy safeguards",
      timeline: "Q3 2026",
      color: "text-blue-400"
    },
    {
      standard: "ISO 27001",
      status: "Planned",
      description: "Information security management systems",
      timeline: "Q4 2026",
      color: "text-purple-400"
    },
    {
      standard: "Common Criteria",
      status: "Under Review",
      description: "Government-grade security evaluation",
      timeline: "2027",
      color: "text-green-400"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Enterprise Trust Center</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your <span className="gradient-text">Digital Sovereignty</span>
              <br />
              Our Technical Guarantee
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              CX Linux is built on principles of user sovereignty, technical transparency, and enterprise-grade security.
              Every architectural decision prioritizes your control over your computing environment.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-terminal-green mb-2">100%</div>
                <div className="text-sm text-gray-500">Open Source Core</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
                <div className="text-sm text-gray-500">Telemetry Collection</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">6 Years</div>
                <div className="text-sm text-gray-500">BSL Protection</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BSL 1.1 License Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Business Source License 1.1</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The perfect balance between open source transparency and competitive protection.
                BSL 1.1 ensures your access to source code while protecting our innovation.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Code className="w-7 h-7 text-blue-400" />
                  Source Available Today
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-terminal-green mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Full Source Code Access</div>
                      <div className="text-gray-400">Inspect, audit, and understand every line of CX Linux</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-terminal-green mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Modification Rights</div>
                      <div className="text-gray-400">Customize and extend CX Linux for your specific needs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-terminal-green mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Internal Use Freedom</div>
                      <div className="text-gray-400">Deploy and use within your organization without restrictions</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-300 mb-2">Conversion Timeline</h4>
                  <p className="text-sm text-gray-400">
                    On <strong>January 15, 2032</strong> (6 years from release), CX Linux automatically converts to
                    Apache 2.0 license, providing full open source freedom while protecting our competitive window.
                  </p>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-xl p-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Commercial Use Restrictions
                </h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-yellow-200 mb-1">Prohibited Without License:</div>
                    <ul className="text-gray-400 space-y-1 ml-4">
                      <li>• Offering CX Linux as a commercial service</li>
                      <li>• Reselling or redistributing CX Linux</li>
                      <li>• Creating competing products using our code</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-terminal-green mb-1">Always Permitted:</div>
                    <ul className="text-gray-400 space-y-1 ml-4">
                      <li>• Internal enterprise deployment</li>
                      <li>• Educational and research use</li>
                      <li>• Security auditing and testing</li>
                      <li>• Contributing back improvements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sovereignty Architecture */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Sovereignty Architecture</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                CX Linux is designed from the ground up to ensure your complete control over your computing environment.
                No backdoors, no surveillance, no compromise.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Database className="w-7 h-7 text-purple-400" />
                    Local Persistence First
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="font-semibold text-purple-300 mb-2">Your Data Stays Local</div>
                      <div className="text-gray-400 text-sm">
                        All AI models, user preferences, and system state stored locally.
                        Optional encrypted sync with servers you control.
                      </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="font-semibold text-purple-300 mb-2">Offline-First Design</div>
                      <div className="text-gray-400 text-sm">
                        Core functionality works without internet connectivity.
                        AI agents operate using local models when cloud access is unavailable.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Globe className="w-7 h-7 text-red-400" />
                    Zero Telemetry Guarantee
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="font-semibold text-red-300 mb-2">No Phone Home</div>
                      <div className="text-gray-400 text-sm">
                        CX Linux never sends usage data, crash reports, or analytics to our servers.
                        Your activities remain completely private.
                      </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="font-semibold text-red-300 mb-2">Network Isolation</div>
                      <div className="text-gray-400 text-sm">
                        All network connections are explicit and user-controlled.
                        Air-gapped deployment supported for maximum security environments.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 rounded-xl p-8">
                <h4 className="text-lg font-semibold mb-6 text-center">Data Flow Architecture</h4>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Local Processing</div>
                      <div className="text-sm text-gray-400">AI inference on your hardware</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium">Local Storage</div>
                      <div className="text-sm text-gray-400">Encrypted filesystem with user keys</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium">User-Controlled Sync</div>
                      <div className="text-sm text-gray-400">Optional, encrypted, your choice</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <div className="font-medium">Zero Visibility</div>
                      <div className="text-sm text-gray-400">We cannot see your data or usage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Specifications */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Security Specifications</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Built with Rust for memory safety and designed with atomic operations for bulletproof reliability.
                Your system remains secure and recoverable at all times.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black/50 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400 mb-3">{feature.description}</p>
                      <div className="text-sm font-mono bg-gray-900/50 px-3 py-2 rounded border text-blue-300">
                        {feature.technical}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Atomic Rollback Deep Dive */}
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 border border-white/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <GitBranch className="w-7 h-7 text-green-400" />
                Atomic Rollback System
              </h3>

              <div className="grid lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold text-green-300 mb-3">Immutable Snapshots</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Every system change creates an immutable snapshot using copy-on-write semantics.
                    Rollback to any previous state instantly.
                  </p>
                  <div className="text-xs font-mono bg-black/50 p-3 rounded border">
                    cx rollback --to="2026-01-27T10:30:00"
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-300 mb-3">Transaction Safety</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    All operations are atomic transactions. If any part fails,
                    the entire change is automatically reverted.
                  </p>
                  <div className="text-xs font-mono bg-black/50 p-3 rounded border">
                    cx install --atomic docker nginx postgres
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-300 mb-3">Cryptographic Integrity</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Each snapshot is cryptographically signed and verified.
                    Tampering or corruption is instantly detected.
                  </p>
                  <div className="text-xs font-mono bg-black/50 p-3 rounded border">
                    cx verify --snapshot=sha256:abc123...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Enterprise Compliance</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                CX Linux is architected to meet the highest compliance standards.
                Our roadmap includes certifications for healthcare, finance, and government sectors.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {complianceStandards.map((standard, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black/50 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{standard.standard}</h3>
                      <p className="text-gray-400 text-sm mt-1">{standard.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      standard.status === "In Progress" ? "bg-yellow-500/20 text-yellow-400" :
                      standard.status === "Architecture Ready" ? "bg-blue-500/20 text-blue-400" :
                      standard.status === "Planned" ? "bg-purple-500/20 text-purple-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {standard.status}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Target Timeline:</span>
                      <span className={`text-sm font-medium ${standard.color}`}>{standard.timeline}</span>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          standard.status === "In Progress" ? "bg-yellow-400 w-3/4" :
                          standard.status === "Architecture Ready" ? "bg-blue-400 w-1/2" :
                          standard.status === "Under Review" ? "bg-green-400 w-1/4" :
                          "bg-purple-400 w-1/4"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <FileText className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Enterprise Support & Documentation</h3>
                  <p className="text-gray-400 mb-6">
                    Our enterprise customers receive comprehensive compliance documentation,
                    security whitepapers, and direct access to our security team for audits and assessments.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Available Documentation:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Security Architecture Whitepaper</li>
                        <li>• Data Protection Impact Assessment</li>
                        <li>• Penetration Test Results</li>
                        <li>• Incident Response Procedures</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Enterprise Services:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Dedicated compliance manager</li>
                        <li>• Custom security assessments</li>
                        <li>• Priority security updates</li>
                        <li>• 24/7 security incident response</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}