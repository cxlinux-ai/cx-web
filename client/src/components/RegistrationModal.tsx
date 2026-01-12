import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import HackathonRegistrationForm from "./HackathonRegistrationForm";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export default function RegistrationModal({ isOpen, onClose, redirectUrl }: RegistrationModalProps) {
  const handleSuccess = () => {
    if (redirectUrl) {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        style={{ zIndex: 99998 }}
        onClick={onClose}
      />
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 99999 }}
      >
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/20 rounded-2xl shadow-2xl pointer-events-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 rounded-t-2xl" />
          
          <div className="sticky top-0 z-10 bg-[#0a0a0f] border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Join the Hackathon</h2>
              <p className="text-sm text-gray-400">Cortex Linux Hackathon 2026</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              data-testid="button-close-modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <HackathonRegistrationForm onSuccess={handleSuccess} onClose={onClose} />
          </div>
        </motion.div>
      </div>
    </>,
    document.body
  );
}
