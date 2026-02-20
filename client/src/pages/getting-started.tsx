import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Book, 
  Terminal, 
  Cpu, 
  Rocket, 
  Users, 
  HelpCircle, 
  Play, 
  ArrowRight, 
  CheckCircle,
  Download,
  Shield,
  Sparkles,
  Code,
  Database,
  Zap,
  Github,
  MessageCircle,
  GraduationCap,
  FlaskConical,
  Monitor
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function GettingStarted() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.gettingStarted);
    return cleanup;
  }, []);

  const quickNavCards = [
    {
      title: "Installation Guide",
      description: "Get CX running on your system in minutes with our guided setup",
      icon: Download,
      link: "/blog/install-cortex-linux-beginner-guide",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Your First Task",
      description: "Tell CX what you need—from server config to automation to anything in between",
      icon: Terminal,
      link: "/blog/getting-started-cortex-first-workflow",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Unlimited Possibilities",
      description: "See how CX handles any Linux operation through natural language",
      icon: Sparkles,
      link: "/blog/first-ai-task-cortex-linux",
      color: "from-orange-500 to-red-500"
    }
  ];

  const prerequisites = [
    { text: "64-bit x86 processor (AMD64/Intel)", icon: Cpu },
    { text: "8GB RAM minimum (16GB recommended for demanding workloads)", icon: Database },
    { text: "50GB free disk space", icon: Monitor },
    { text: "NVIDIA GPU with CUDA support (optional, for GPU acceleration)", icon: Zap },
    { text: "Internet connection for AI features", icon: Rocket }
  ];

  const gettingStartedSteps = [
    {
      number: 1,
      title: "Choose Your Installation Method",
      description: "CX Linux supports multiple installation methods: fresh install, dual-boot, virtual machine, or WSL2. Choose the method that best fits your workflow.",
      details: [
        "Fresh install for dedicated development machines",
        "Dual-boot to keep your existing OS",
        "Virtual machine for testing and evaluation",
        "WSL2 for Windows users who want Linux tools"
      ]
    },
    {
      number: 2,
      title: "Install CX Linux",
      description: "Follow our guided installer to set up CX Linux. The process takes about 15 minutes and handles all dependencies automatically.",
      details: [
        "Download the ISO from our official site",
        "Create bootable USB or mount in VM",
        "Follow the interactive installer prompts",
        "AI automatically detects and configures hardware"
      ]
    },
    {
      number: 3,
      title: "Verify Installation",
      description: "Confirm that CX is properly installed and all components are functioning correctly.",
      details: [
        "Run 'cx --version' to check installation",
        "Execute 'cx hw detect' to verify hardware detection",
        "Check GPU status with 'cx gpu status'",
        "Review system health with 'cx diagnose'"
      ]
    },
    {
      number: 4,
      title: "Run Your First Command",
      description: "Experience the power of intent-based computing. Simply describe what you want to accomplish—CX handles the rest.",
      details: [
        "Try: 'cx configure my nginx web server with SSL'",
        "Or: 'cx set up automated daily backups to S3'",
        "Or: 'cx install monitoring with Prometheus and Grafana'",
        "Or: 'cx set up a Python dev environment with Django'",
        "Preview commands before execution and watch dependencies resolve automatically"
      ]
    },
    {
      number: 5,
      title: "Do Anything on Linux",
      description: "CX is your intelligent Linux assistant. Whatever you need to accomplish, just ask.",
      details: [
        "System administration: users, permissions, services, networking",
        "DevOps: containers, CI/CD, infrastructure automation",
        "Development: environments, dependencies, build systems",
        "Security: firewall rules, audits, hardening, compliance",
        "And literally anything else you can do on Linux"
      ]
    }
  ];

  const learningPaths = [
    {
      title: "Beginner Path",
      icon: GraduationCap,
      description: "New to Linux? Let CX be your guide.",
      color: "from-green-500 to-emerald-500",
      resources: [
        { title: "Getting Started with CX", link: "/blog/getting-started-cortex-first-workflow" },
        { title: "How to Install CX Linux", link: "/blog/install-cortex-linux-beginner-guide" },
        { title: "Your First Linux Tasks", link: "/blog/first-ai-task-cortex-linux" },
        { title: "CX for Students", link: "/blog/cortex-linux-for-students" },
        { title: "FAQ for New Users", link: "/faq" }
      ]
    },
    {
      title: "Sysadmin Path",
      icon: Shield,
      description: "System administrators managing servers and infrastructure.",
      color: "from-orange-500 to-red-500",
      resources: [
        { title: "Server Configuration Automation", link: "/blog" },
        { title: "User and Permission Management", link: "/blog" },
        { title: "Backup and Disaster Recovery", link: "/blog" },
        { title: "Security Hardening with CX", link: "/blog" },
        { title: "Monitoring and Alerting Setup", link: "/blog" }
      ]
    },
    {
      title: "Developer Path",
      icon: Code,
      description: "Developers building applications and managing environments.",
      color: "from-blue-500 to-indigo-500",
      resources: [
        { title: "Development Environment Setup", link: "/blog" },
        { title: "Docker and Container Integration", link: "/blog" },
        { title: "Multi-Environment Management", link: "/blog/ml-workloads-without-config-hell" },
        { title: "Database Setup and Management", link: "/blog" },
        { title: "Custom Workflow Automation", link: "/blog" }
      ]
    },
    {
      title: "DevOps Path",
      icon: Rocket,
      description: "DevOps engineers automating pipelines and infrastructure.",
      color: "from-purple-500 to-violet-500",
      resources: [
        { title: "CI/CD Pipeline Setup", link: "/blog" },
        { title: "Infrastructure as Code", link: "/blog" },
        { title: "Kubernetes Cluster Management", link: "/blog" },
        { title: "Log Aggregation and Analysis", link: "/blog" },
        { title: "Performance Optimization", link: "/blog/gpu-optimization-real-techniques" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              AI Layer for Linux
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Your intelligent Linux assistant that can do anything
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Stop memorizing commands. Just describe what you need—configure servers, 
            automate tasks, manage infrastructure, set up development environments, 
            or anything else. CX understands your intent and makes it happen.
          </p>
        </motion.div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Quick Start Guides
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {quickNavCards.map((card, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
              >
                <Link href={card.link}>
                  <div 
                    className="group p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full"
                    data-testid={`card-quick-nav-${index}`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{card.description}</p>
                    <div className="flex items-center text-blue-300 text-sm font-medium">
                      Read Guide <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Prerequisites Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white">Prerequisites</h2>
            </div>
            
            <div className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">System Requirements</h3>
              <div className="space-y-4">
                {prerequisites.map((req, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <req.icon className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-gray-300">{req.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-gray-300">
                  <strong className="text-blue-300">Note:</strong> CX Linux is built on Ubuntu 24.04 LTS. 
                  If your hardware runs Ubuntu, it will run CX Linux. GPU support requires NVIDIA drivers 530+.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step Getting Started */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white">Step-by-Step Setup</h2>
            </div>
          </motion.div>
          
          <div className="space-y-8">
            {gettingStartedSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {index < gettingStartedSteps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
                )}
                
                <div className="flex gap-6" data-testid={`step-${step.number}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                    {step.number}
                  </div>
                  
                  <div className="flex-1 p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 mb-4">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Demo Placeholder */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white">Video Tutorial</h2>
            </div>
            
            <div 
              className="aspect-video rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-all duration-300 group"
              data-testid="video-placeholder"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Getting Started in 5 Minutes</h3>
              <p className="text-gray-400 text-center max-w-md">
                Watch our quick start tutorial to see CX Linux in action. Video coming soon.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Book className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white">Learning Paths</h2>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose a learning path based on your experience level and goals
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                data-testid={`learning-path-${index}`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${path.color} flex items-center justify-center mb-4`}>
                  <path.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{path.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{path.description}</p>
                
                <ul className="space-y-3">
                  {path.resources.map((resource, resIndex) => (
                    <li key={resIndex}>
                      <Link 
                        href={resource.link}
                        className="flex items-center gap-2 text-gray-300 hover:text-blue-300 transition-colors text-sm group"
                        data-testid={`resource-link-${index}-${resIndex}`}
                      >
                        <ArrowRight className="w-3 h-3 text-blue-300 group-hover:translate-x-1 transition-transform" />
                        {resource.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Support */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-300" />
              </div>
              <h2 className="text-3xl font-bold text-white">Community and Support</h2>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our community of developers, get help, and contribute to CX Linux
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <a 
              href="https://discord.gg/ASvzWcuTfk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 text-center group"
              data-testid="link-discord"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-500/30 transition-colors">
                <FaDiscord className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Discord Community</h3>
              <p className="text-gray-400 text-sm">Chat with developers and get real-time help</p>
            </a>
            
            <a 
              href="https://github.com/cortexlinux/cx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 text-center group"
              data-testid="link-github"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-500/30 transition-colors">
                <Github className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">GitHub Repository</h3>
              <p className="text-gray-400 text-sm">Star, fork, and contribute to the project</p>
            </a>
            
            <Link 
              href="/faq"
              className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 text-center group"
              data-testid="link-faq"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                <HelpCircle className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">FAQ</h3>
              <p className="text-gray-400 text-sm">Find answers to common questions</p>
            </Link>
          </motion.div>
          
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/beta"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300"
              data-testid="button-try-cx"
            >
              <Sparkles className="w-5 h-5" />
              Try CX Linux Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
