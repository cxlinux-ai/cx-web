import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Code2,
  Globe,
  Heart,
  Rocket,
  Shield,
  Users,
  Zap,
  Terminal,
  Cpu,
  Building2,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { updateSEO } from "@/lib/seo";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const coreValues = [
  {
    icon: Brain,
    title: "Source Available",
    description:
      "Our code is publicly inspectable under the BSL 1.1 license with Apache 2.0 conversion. We believe in transparency without compromising commercial sustainability.",
    gradient: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Security First",
    description:
      "Every feature goes through sandboxed execution, preview-before-execute validation, and instant rollback. Safety is non-negotiable.",
    gradient: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-300",
  },
  {
    icon: Users,
    title: "Community Contributors",
    description:
      "We work alongside a global community of contributors who help shape CX Linux through feedback, plugins, and real-world testing.",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
];

const benefits = [
  {
    icon: Rocket,
    title: "Work on Cutting-Edge AI",
    description:
      "Build the future of human-computer interaction. Our AI reasoning engine translates natural language into multi-step Linux execution.",
  },
  {
    icon: Globe,
    title: "Remote-First Culture",
    description:
      "Work from anywhere in the world. We're a distributed team that values results over hours in an office.",
  },
  {
    icon: Heart,
    title: "Competitive Compensation",
    description:
      "Salary, equity, and benefits that reflect the value you bring. We invest in our people.",
  },
  {
    icon: Zap,
    title: "Ship Fast, Learn Faster",
    description:
      "Small, autonomous teams with real ownership. You'll see your work in production within days, not quarters.",
  },
  {
    icon: Code2,
    title: "BSL Licensed with Apache 2.0 Conversion",
    description:
      "Our licensing model balances transparency with sustainability. Code converts to Apache 2.0 after the change date.",
  },
  {
    icon: Building2,
    title: "Growing Team, Big Impact",
    description:
      "Join early and help define the culture, architecture, and product direction of CX Linux.",
  },
];

const openRoles = [
  {
    title: "Senior AI/ML Engineer",
    team: "Reasoning Engine",
    location: "Remote",
    type: "Full-time",
    description:
      "Design and improve the Sapiens reasoning engine that powers multi-agent AI planning, execution, and validation for Linux systems.",
    tags: ["Python", "Transformers", "Multi-Agent Systems"],
  },
  {
    title: "Senior Full-Stack Engineer",
    team: "Platform",
    location: "Remote",
    type: "Full-time",
    description:
      "Build the web platform, API layer, and developer tools that power the CX Linux experience for thousands of users.",
    tags: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Systems Engineer",
    team: "Core Runtime",
    location: "Remote",
    type: "Full-time",
    description:
      "Work on the core Linux integration layer: sandboxed execution, system-level access, rollback mechanisms, and plugin architecture.",
    tags: ["Linux", "Rust", "C", "Systems Programming"],
  },
  {
    title: "Developer Advocate",
    team: "Community",
    location: "Remote",
    type: "Full-time",
    description:
      "Be the bridge between CX Linux and the developer community. Create content, demos, and drive adoption through authentic engagement.",
    tags: ["Content", "Community", "Technical Writing"],
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote",
    type: "Full-time / Contract",
    description:
      "Shape how developers interact with AI on Linux. Design intuitive interfaces for complex system operations and natural language workflows.",
    tags: ["UI/UX", "Figma", "Developer Tools"],
  },
];

export default function CareersPage() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: "Careers at CX Linux | Join Our Team",
      description:
        "Join the team building the AI layer for Linux. We're hiring engineers, designers, and advocates to help shape the future of intelligent system interaction.",
      canonicalPath: "/careers",
      keywords: [
        "CX Linux careers",
        "AI jobs",
        "Linux engineering",
        "remote jobs",
        "developer tools",
      ],
    });
    window.scrollTo(0, 0);
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              We're Hiring
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build the Future of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI on Linux
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              CX Linux is creating the first native AI layer for Linux. Join a
              team that's redefining how developers interact with their systems
              through natural language.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#open-roles">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white"
                  data-testid="button-view-roles"
                >
                  View Open Roles
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <Link href="/mission">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20"
                  data-testid="button-our-mission"
                >
                  Our Mission
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our values guide how we build, collaborate, and grow together.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-md border ${value.borderColor} bg-gradient-to-b ${value.gradient}`}
              >
                <value.icon className={`w-10 h-10 ${value.iconColor} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why CX Linux?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We offer more than a job. We offer the chance to shape how
              millions of developers work with Linux.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="p-6 rounded-md border border-white/10 bg-white/[0.02]"
              >
                <benefit.icon className="w-8 h-8 text-blue-300 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="open-roles" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Open Roles
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              All positions are remote-first. We hire worldwide and care about
              what you build, not where you sit.
            </p>
          </motion.div>

          <div className="space-y-4">
            {openRoles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="p-6 rounded-md border border-white/10 bg-white/[0.02] hover-elevate"
                data-testid={`card-role-${index}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{role.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-1">
                      <span>{role.team}</span>
                      <span className="text-gray-600">|</span>
                      <span>{role.location}</span>
                      <span className="text-gray-600">|</span>
                      <span>{role.type}</span>
                    </div>
                  </div>
                  <a href="mailto:careers@cxlinux.com">
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-300 shrink-0"
                      data-testid={`button-apply-${index}`}
                    >
                      Apply Now
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                </div>
                <p className="text-gray-400 text-sm mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-2">
                  {role.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md bg-white/5 text-gray-400 text-xs border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Hiring Process
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Straightforward and respectful of your time. No trick questions,
              no all-day interviews.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Apply",
                desc: "Send your resume and a short note about why CX Linux interests you.",
                icon: BadgeCheck,
              },
              {
                step: "2",
                title: "Chat",
                desc: "30-minute conversation with someone on the team about your experience.",
                icon: Users,
              },
              {
                step: "3",
                title: "Build",
                desc: "A take-home exercise or pair programming session relevant to the role.",
                icon: Terminal,
              },
              {
                step: "4",
                title: "Offer",
                desc: "If it's a fit, we move fast. You'll hear back within a week.",
                icon: Cpu,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-5 rounded-md border border-white/10 bg-white/[0.02]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't See Your Role?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              We're always looking for talented people who share our vision.
              Send us your resume and tell us how you'd like to contribute.
            </p>
            <a href="mailto:careers@cxlinux.com">
              <Button
                size="lg"
                className="bg-blue-600 text-white"
                data-testid="button-general-application"
              >
                Send General Application
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
