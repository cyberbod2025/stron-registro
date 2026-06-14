import { motion } from "motion/react";
import { ScreenId, TransitionType } from "../types";

interface WelcomeCoverProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
}

export function WelcomeCoverScreen({ onNavigate }: WelcomeCoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-between relative px-6 py-12 overflow-hidden"
    >
      {/* Title at the top */}
      <div className="relative z-10 mt-10 text-center">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-black text-white tracking-tight uppercase italic drop-shadow-[0_0_20px_rgba(242,15,114,0.6)]"
        >
          Strong Nation
        </motion.h1>
      </div>

      {/* Spacer to keep the center clear for the photo */}
      <div className="flex-1" />

      {/* Button at the bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm relative z-10 mb-10"
      >
        <button
          onClick={() => onNavigate(ScreenId.RoleSelection, "push")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20F72] to-[#8E2DE2] text-white font-black text-lg uppercase tracking-widest shadow-[0_4px_20px_rgba(242,15,114,0.4)] hover:shadow-[0_4px_25px_rgba(242,15,114,0.6)] active:scale-[0.98] transition-all"
        >
          Entrar a la app
        </button>
      </motion.div>
    </motion.div>
  );
}
