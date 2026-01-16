import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar } from "lucide-react";
import HackathonRegistrationForm from "@/components/HackathonRegistrationForm";
import { updateSEO } from "@/lib/seo";

export default function Register() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: "Register - Cortex Hackathon 2026",
      description: "Join the Cortex Linux Hackathon 2026. $17,000 in prizes. Register now to participate.",
      keywords: ["hackathon", "registration", "cortex linux", "AI", "linux"],
    });
    return cleanup;
  }, []);

  const handleSuccess = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-[32px] sm:text-[42px] md:text-[50px] font-bold mt-0 mb-0 pt-2 pb-2">
            Join the <span className="gradient-text">Hackathon</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Cortex Linux Hackathon 2026 · February 17, 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-6 mb-10"
        >
          <div className="flex items-center gap-2 text-sm">
            <Trophy size={18} className="text-terminal-green" />
            <span className="text-terminal-green font-semibold">$17,000</span>
            <span className="text-gray-400">in Prizes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users size={18} className="text-blue-400" />
            <span className="text-gray-400">Open to Everyone</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={18} className="text-amber-400" />
            <span className="text-gray-400">13-Week Program</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 sm:p-8"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 rounded-full mb-8 -mt-2" />
          <HackathonRegistrationForm onSuccess={handleSuccess} />
        </motion.div>
      </div>
    </div>
  );
}
