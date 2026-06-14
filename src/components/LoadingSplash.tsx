import { motion } from "motion/react";
import bgImage from "../assets/strong_nation_bg.png";

export function LoadingSplash() {
  return (
    <motion.div
      key="loading-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between px-6 py-12 overflow-hidden bg-black"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-60"
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      ></div>
      
      {/* Gradient overlay for better text readability at top and bottom */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>

      {/* Title at the top */}
      <div className="relative z-10 mt-8 text-center flex flex-col items-center">
        {/* S Logo / Text */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          {/* A stylized S resembling the logo */}
          <div className="text-[#00A3FF] text-6xl font-black italic mb-2 transform -skew-x-12" style={{ fontFamily: "Impact, sans-serif" }}>
            S
          </div>
          <h1 className="text-4xl font-black text-white tracking-[0.2em] uppercase italic leading-none">
            Strong
          </h1>
          <p className="text-[#00A3FF] tracking-[0.5em] text-xs font-bold mt-2 ml-1">
            N A T I O N
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <h2 
            className="text-6xl font-black text-white tracking-tight uppercase"
            style={{ transform: "scaleY(1.3)" }}
          >
            Bienvenida
          </h2>
          <p className="text-[#00A3FF] font-bold text-sm tracking-widest mt-4 uppercase">
            Estás entrando a tu mejor versión
          </p>
        </motion.div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer text */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full relative z-10 mb-4 flex flex-col items-center"
      >
        <div className="text-[#00A3FF] text-3xl mb-3">⚡</div>
        <p className="text-white text-sm tracking-widest uppercase font-bold">
          No es suerte, es <span className="text-[#00A3FF]">STRONG.</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
