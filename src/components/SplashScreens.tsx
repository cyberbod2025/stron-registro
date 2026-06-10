import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { Bolt, Dumbbell, MapPin, Users } from "lucide-react";

interface SplashProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
}

export function Splash({ onNavigate }: SplashProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[90vh] flex flex-col items-center justify-between overflow-hidden py-10"
    >
      {/* Background with Athlete Image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-45 mix-blend-luminosity filter brightness-75 scale-105 animate-pulse"
          alt="Athlete background"
          referrerPolicy="no-referrer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ7XwRYnnArs6d3cgHQrK7pGergvJWVEfTNvfJgmAzQ5lguEDVKvfXGhRIqLmGiV_clrtjL41_U7DtQzDw5z8vfXNRfE5fKHK5tyFNP3LQCRZIt0T6otuJWjXEsDWAYMEgDsGGxNTm9L-lE0Hud0fRufBLprP3mjZkTzF5W9gTX_tSGrtPjSVR4C_9fjeHC6G60GBcd3Acg-TvAEicb1ga_FKm85LM5oZsJS3TzUvRc8w5AZYWxRbQRTLsDyFCFDQeI7zhBWgl0MEW"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e0f14] via-[#1e0f14]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-purple-950/20 mix-blend-color"></div>
      </div>

      {/* Brand Header */}
      <div className="relative z-10 text-center px-6 pt-6 flex flex-col items-center">
        <motion.div
          animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-5 inline-flex"
        >
          <div className="w-16 h-16 rounded-full border-2 border-[#ffb1c7]/40 bg-gradient-to-r from-[#ff4994] to-[#562ba0] flex items-center justify-center shadow-[0_0_25px_rgba(255,73,148,0.4)]">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <p className="text-[10px] font-black tracking-[0.25em] text-[#ffb1c7] mb-1.5 uppercase">
          HUGO SÁNCHEZ • SEDE IZTACALCO
        </p>
        <h1 className="text-4xl font-black italic tracking-tighter text-white leading-none uppercase">
          STRONG <br />
          <span className="text-[#ff4994] drop-shadow-[0_0_15px_rgba(255,73,148,0.5)]">
            NATION
          </span>
        </h1>
        <p className="text-xs font-bold tracking-widest text-[#e2bdc6] mt-3 uppercase opacity-90">
          RESPONSABILIDAD Y COMPROMISO 💪👥
        </p>
      </div>

      {/* Action Buttons & Quick card */}
      <div className="relative z-10 w-full max-w-sm px-6 space-y-4 mt-auto">
        <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3 mb-2 bg-[#2a1723]/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#ff4994]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#ff4994]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#ffb1c7] leading-none uppercase tracking-wide">Más fuertes juntas</p>
              <p className="text-[10px] text-[#e2bdc6] mt-1">Conecta con tu equipo y mantén las rachas de asistencia intactas.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push")}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#562ba0] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-[#ff4994]/20 active:scale-95 transition-all duration-300 transform hover:brightness-110 cursor-pointer text-center"
        >
          INGRESAR AL PANEL DE ATLETA
        </button>

        <button
          onClick={() => onNavigate(ScreenId.RegistroDeClase, "push")}
          className="w-full py-3.5 px-6 rounded-xl glass-card text-white text-xs font-black uppercase tracking-widest border border-white/15 hover:bg-white/5 transition-all duration-300 active:scale-95 cursor-pointer text-center"
        >
          REGISTRARME EN NUEVA CLASE
        </button>
      </div>

      {/* Stats Indicator Footer */}
      <div className="relative z-10 mt-6 flex gap-6 items-center justify-center opacity-85 px-6 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">500+</span>
          <span className="text-[8px] font-bold tracking-widest text-[#ffb1c7] uppercase">
            Atletas
          </span>
        </div>
        <div className="w-[1px] h-6 bg-white/10"></div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">100%</span>
          <span className="text-[8px] font-bold tracking-widest text-[#ffb1c7] uppercase">
            Compromiso
          </span>
        </div>
        <div className="w-[1px] h-6 bg-white/10"></div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-black text-white">CDMX</span>
          <span className="text-[8px] font-bold tracking-widest text-[#ffb1c7] uppercase">
            Iztacalco
          </span>
        </div>
      </div>
    </motion.div>
  );
}
