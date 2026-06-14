import { motion } from "motion/react";
import bgImage from "../assets/bienvenida.png";

export function LoadingSplash() {
  return (
    <motion.div
      key="loading-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <img 
        src={bgImage} 
        alt="Bienvenida" 
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
