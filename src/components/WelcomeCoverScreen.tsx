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
      className="w-full flex flex-col items-center justify-between relative px-6 overflow-hidden"
      style={{ minHeight: 'calc(100dvh - 80px)' }}
    >
      {/* Top gradient for text legibility */}
      <div className="absolute top-0 inset-x-0 h-56 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-0"></div>

      {/* Title at the top */}
      <div className="relative z-10 mt-16 sm:mt-20 text-center w-full">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl font-black text-white tracking-widest uppercase italic leading-tight"
          style={{ textShadow: "0 4px 24px rgba(0,0,0,0.9), 0 0 30px rgba(242,15,114,0.3)" }}
        >
          Strong Nation
        </motion.h1>
      </div>

      {/* Spacer and sub-text */}
      <div className="flex-1 w-full flex flex-col justify-end items-center relative z-10" style={{ paddingBottom: 'clamp(30px, 4vh, 60px)' }}>
         <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white text-xl sm:text-2xl font-black tracking-widest uppercase italic text-center"
            style={{ textShadow: "0 2px 15px rgba(0,0,0,1)" }}
         >
            Entrena sin límites
         </motion.p>
      </div>

      {/* Button at the bottom */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm relative z-10"
        style={{ marginBottom: 'clamp(40px, 8vh, 100px)' }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-[#F20F72] to-[#8E2DE2] rounded-2xl blur-lg opacity-50"></div>
        <button
          onClick={() => onNavigate(ScreenId.RoleSelection, "push")}
          className="relative w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#F20F72]/90 to-[#8E2DE2]/90 text-white font-black text-xl uppercase tracking-widest shadow-[0_8px_32px_rgba(242,15,114,0.4)] border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-md"
        >
          Entrar a la app
        </button>
      </motion.div>
    </motion.div>
  );
}
