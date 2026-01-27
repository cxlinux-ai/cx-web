import { motion } from "framer-motion";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { 
  ArrowLeft, 
  Scale, 
  Users, 
  Code, 
  Shield, 
  FileText, 
  Trophy, 
  AlertTriangle,
  Globe,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export default function HackathonRulesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="h-16" />

      {/* Hero Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <Link 
            href="/hackathon" 
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-8 transition-colors"
            data-testid="link-back-to-hackathon"
          >
            <ArrowLeft size={20} />
            Back to Hackathon
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-6"
          >
            <Scale size={16} />
            Legal & Rules
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="gradient-text">Hackathon Rules & Legal</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 mb-4"
          >
            Cortex Linux Hackathon 2026 — Legal Issues, Participant Commitments, and Rules
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500"
          >
            Effective Date: January 12, 2026
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-introduction"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FileText size={20} className="text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Cortex Linux ("Organizer") is hosting the Cortex Hackathon 2026, a global, 13-week program designed to crowdsource monetization strategies and transform the best ideas into production-ready code. Participation in the hackathon implies agreement with the following rules, terms, and conditions.
              </p>
              <p className="text-gray-400 leading-relaxed mt-4">
                This document outlines legal responsibilities, participant commitments, intellectual property considerations, code of conduct, judging criteria, and other essential rules.
              </p>
            </motion.div>

            {/* Eligibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-eligibility"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Users size={20} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">2. Eligibility</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Open to individuals and teams (2–5 participants per team).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Participants must be 13 years or older or meet local legal age requirements for entering competitions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>Participants may join from any geographic location where participation is not prohibited by law.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 mt-1 flex-shrink-0" />
                  <span>No prior application or payment is required; participation is 100% free.</span>
                </li>
              </ul>
            </motion.div>

            {/* Registration and Participation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-registration"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Code size={20} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">3. Registration and Participation</h2>
              </div>
              <p className="text-gray-400 mb-6">
                Participants must star and fork the Cortex GitHub repository:{" "}
                <a 
                  href="https://github.com/cortexlinux/cortex" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 inline-flex items-center gap-1"
                >
                  github.com/cortexlinux/cortex
                  <ExternalLink size={14} />
                </a>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Phase 1: Ideation (Weeks 1–4)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Submit monetization strategies, feature ideas, and growth tactics via GitHub Issues.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong className="text-gray-300">Judging Criteria:</strong> Monetization (40%), Features (30%), Marketing (20%), Other categories (10%).
                  </p>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">Phase 2: Execution (Weeks 6–13)</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Build and submit Pull Requests implementing your ideas.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong className="text-gray-300">Judging Criteria:</strong> Code Quality (25%), Completeness (25%), Documentation (20%), Test Coverage (15%), Architecture (15%).
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-ip"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Scale size={20} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">4. Intellectual Property (IP)</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>All contributions (ideas, code, documentation) are submitted under the MIT License unless otherwise specified.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>Cortex Linux retains full access and ownership of all submitted code, ideas, and documentation for use in the Cortex Linux project.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>Participants must not submit proprietary code or materials that they do not have the right to share.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>By participating, contributors confirm that their submissions do not infringe on third-party IP rights.</span>
                </li>
              </ul>
            </motion.div>

            {/* Code of Conduct */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-conduct"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">5. Code of Conduct</h2>
              </div>
              <p className="text-gray-400 mb-4">Participants are expected to:</p>
              <ul className="space-y-3 text-gray-400 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                  <span>Treat all participants, organizers, and mentors with respect.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                  <span>Refrain from harassment, discrimination, or abusive behavior in any form.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                  <span>Maintain professional conduct in all communications, including Discord, GitHub, and other hackathon channels.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                  <span>Avoid spamming or plagiarizing content from other participants or external sources.</span>
                </li>
              </ul>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-300 text-sm">
                  <strong>Warning:</strong> Violation of the code of conduct may result in disqualification or removal from the hackathon.
                </p>
              </div>
            </motion.div>

            {/* Submission Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-submission"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <FileText size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">6. Submission Rules</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-cyan-400 mt-1 flex-shrink-0" />
                  <span>Submissions must be made via GitHub Issues (Phase 1) or Pull Requests (Phase 2).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-cyan-400 mt-1 flex-shrink-0" />
                  <span>Each participant or team is responsible for ensuring code functionality, documentation, and testing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-cyan-400 mt-1 flex-shrink-0" />
                  <span>All submissions must comply with applicable laws, including but not limited to copyright, data privacy, and cybersecurity regulations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-cyan-400 mt-1 flex-shrink-0" />
                  <span>The Organizer reserves the right to disqualify submissions that contain malicious code, violate GitHub terms, or breach these rules.</span>
                </li>
              </ul>
            </motion.div>

            {/* Privacy and Data Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-privacy"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">7. Privacy and Data Use</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
                  <span>The Organizer may collect participant information (e.g., GitHub username, email, submission content) for hackathon administration and prize distribution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
                  <span>
                    Participant data will be handled according to Cortex Linux's{" "}
                    <Link href="/privacy" className="text-blue-300 hover:text-blue-200">Privacy Policy</Link>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
                  <span>By participating, contributors consent to the processing of personal data related to hackathon participation and judging.</span>
                </li>
              </ul>
            </motion.div>

            {/* Prizes and Taxation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-prizes"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Trophy size={20} className="text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">8. Prizes and Taxation</h2>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-emerald-500/10 border border-yellow-500/30 rounded-xl mb-6 text-center">
                <p className="text-2xl font-bold text-white">Total Prize Pool: <span className="text-emerald-400">$18,800</span></p>
                <p className="text-sm text-gray-400 mt-1">(1st-3rd place cash, 4th-10th place goodies + managed service)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Phase 1: Ideathon — $3,800</h3>
                  <p className="text-gray-400 text-sm mb-4">Submit monetizable feature ideas via GitHub Issues.</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex justify-between">
                      <span>1st Place</span>
                      <span className="text-emerald-400 font-semibold">$250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>2nd Place</span>
                      <span className="text-emerald-400 font-semibold">$250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>3rd Place</span>
                      <span className="text-emerald-400 font-semibold">$250</span>
                    </li>
                    <li className="flex justify-between">
                      <span>4th–10th Place</span>
                      <span className="text-emerald-400 font-semibold">$150 each</span>
                    </li>
                    <li className="flex justify-between">
                      <span>11th–30th Place</span>
                      <span className="text-emerald-400 font-semibold">$100 each</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">11th-30th: Goodie package (shirt, water bottle, notebook) + 1 month Cortex Linux AI Premium</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3">Phase 2: Hackathon — $15,000</h3>
                  <p className="text-gray-400 text-sm mb-4">Build and ship real code via Pull Requests.</p>
                  <ul className="space-y-2 text-gray-400 text-sm">
                    <li className="flex justify-between">
                      <span>1st Place</span>
                      <span className="text-blue-300 font-semibold">$5,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>2nd Place</span>
                      <span className="text-blue-300 font-semibold">$3,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>3rd Place</span>
                      <span className="text-blue-300 font-semibold">$2,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>4th–10th Place</span>
                      <span className="text-blue-300 font-semibold">$700 worth of goodies each</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">4th-10th: $700 worth of goodies + 2 months Cortex Linux managed service (not cash)</p>
                </div>
              </div>

              {/* Category Awards */}
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Category Awards</h3>
                <p className="text-gray-400 text-sm mb-4">Additional prizes awarded alongside main prizes:</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex justify-between">
                    <span>Best Plugin/Extension</span>
                    <span className="text-purple-300 font-semibold">6 months Premium</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Best Automation Workflow</span>
                    <span className="text-purple-300 font-semibold">6 months Premium</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Best Enterprise Feature</span>
                    <span className="text-purple-300 font-semibold">6 months Premium</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">Category awards can be won in addition to main placement prizes.</p>
              </div>

              {/* Builder Pack */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl mb-6">
                <p className="text-sm text-emerald-300"><strong>Builder Pack:</strong> All participants who submit a valid entry receive a <span className="text-white font-semibold">$5 Cortex Linux credit</span> as a thank you for participating.</p>
              </div>

              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>Participants are responsible for any taxes or duties arising from prize winnings in accordance with local laws.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span>Prizes are non-transferable and cannot be exchanged for cash except as specified.</span>
                </li>
              </ul>
            </motion.div>

            {/* Disqualification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-disqualification"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">9. Disqualification</h2>
              </div>
              <p className="text-gray-400 mb-4">Participants may be disqualified for, but not limited to:</p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 mt-1 flex-shrink-0" />
                  <span>Violation of the Code of Conduct or hackathon rules</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 mt-1 flex-shrink-0" />
                  <span>Submission of plagiarized or malicious content</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 mt-1 flex-shrink-0" />
                  <span>Failing to comply with legal or intellectual property requirements</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 mt-1 flex-shrink-0" />
                  <span>Manipulation of judging results or fraudulent claims</span>
                </li>
              </ul>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-liability"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">10. Limitation of Liability</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-orange-400 mt-1 flex-shrink-0" />
                  <span>Participation is at the participant's own risk.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-orange-400 mt-1 flex-shrink-0" />
                  <span>The Organizer is not responsible for lost data, system failures, or security breaches affecting submissions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-orange-400 mt-1 flex-shrink-0" />
                  <span>Participants agree to hold the Organizer harmless from claims, losses, or damages resulting from hackathon participation.</span>
                </li>
              </ul>
            </motion.div>

            {/* Governing Law */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-governing-law"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Globe size={20} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">11. Governing Law</h2>
              </div>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span>The hackathon and its rules are governed by US law and any disputes will be resolved under US jurisdiction.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span>Organizer reserves the right to amend the rules or cancel the hackathon due to unforeseen circumstances.</span>
                </li>
              </ul>
            </motion.div>

            {/* Acknowledgment and Agreement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30"
              data-testid="section-acknowledgment"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">12. Acknowledgment and Agreement</h2>
              </div>
              <p className="text-gray-400 mb-4">By participating in the Cortex Hackathon 2026, participants confirm that:</p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span>They have read and understood this document.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span>They agree to abide by all rules, legal obligations, and ethical standards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span>They accept that their contributions may be used for commercial purposes by the Organizer.</span>
                </li>
              </ul>
            </motion.div>

            {/* Official Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl"
              data-testid="section-links"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Official Links & References</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <a 
                  href="https://github.com/cortexlinux/cortex" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
                >
                  <Code size={20} className="text-gray-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">GitHub Repository</span>
                  <ExternalLink size={16} className="ml-auto text-gray-500" />
                </a>
                <Link 
                  href="/privacy"
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
                >
                  <Shield size={20} className="text-gray-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">Privacy Policy</span>
                </Link>
                <Link 
                  href="/terms"
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
                >
                  <FileText size={20} className="text-gray-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">Terms of Service</span>
                </Link>
                <Link 
                  href="/license"
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
                >
                  <Scale size={20} className="text-gray-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">MIT License</span>
                </Link>
                <Link 
                  href="/security-policy"
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-colors group"
                >
                  <Shield size={20} className="text-gray-400 group-hover:text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white">Security Policy</span>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
