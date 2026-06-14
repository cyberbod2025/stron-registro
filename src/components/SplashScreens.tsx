import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { MapPin, ChevronRight } from "lucide-react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";

interface SplashProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onSelectClass?: (classId: string) => void;
}

interface HomeProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
  isLoading: boolean;
  onSelectClass?: (classId: string) => void;
}

/* Full-featured Home Screen matching mockup */
export function HomeScreen({ onNavigate, classes, isLoading, onSelectClass }: HomeProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada": return "CONFIRMADA";
      case "suspendida": return "CANCELADA";
      default: return "PENDIENTE";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmada": return "status-confirmed";
      case "suspendida": return "status-cancelled";
      default: return "status-pending";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      {/* Hero Section */}
      <div className="relative px-6 pt-14 pb-8">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* S Logo */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00a2ff] via-[#0077ff] to-[#00e5ff] flex items-center justify-center shadow-[0_0_40px_rgba(255,73,148,0.4)] relative">
              <span className="text-3xl font-black italic text-white" style={{ fontFamily: 'Montserrat' }}>S</span>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#5de151] flex items-center justify-center">
                <span className="text-[8px]">🔥</span>
              </div>
            </div>
          </motion.div>

          <h1 className="text-3xl font-black italic tracking-tight text-white uppercase leading-none">
            STRONG{" "}
            <span className="text-[#00a2ff] drop-shadow-[0_0_15px_rgba(255,73,148,0.5)]">
              NATION
            </span>
          </h1>
          <p className="text-xs font-semibold text-[#ffb1c7] mt-2 tracking-wider italic">
            Más fuertes juntas 💪
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-[#e2bdc6] text-center leading-relaxed max-w-xs mx-auto mb-8">
          Regístrate para tus clases y seamos más fuertes juntas 💪
        </p>

        {/* Class Cards */}
        <div className="space-y-3 mb-8">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl p-4 bg-white/5 border border-white/5 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-40 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-28"></div>
                </div>
              ))}
            </>
          ) : (
            classes.filter(c => getWeekCategory(c.startsAt) !== "otro").map((c, index) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (onSelectClass) onSelectClass(c.id);
                  onNavigate(ScreenId.RegistroDeClase, "push");
                }}
                className="class-card w-full text-left rounded-2xl p-4 bg-[#0a1020]/60 border border-white/8 hover:border-[#00a2ff]/30 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Day indicator */}
                  <div className="w-12 h-12 rounded-xl bg-[#00a2ff]/15 border border-[#00a2ff]/25 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#00a2ff] text-xl">event</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">
                      {formatDisplayDate(c)} {c.timeStr}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-[#00a2ff]" />
                      <span className="text-xs text-[#e2bdc6]">{c.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${getStatusClass(c.status)}`}>
                    {getStatusLabel(c.status)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#00a2ff] transition-colors" />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onNavigate(ScreenId.MisRegistros, "push")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(255,73,148,0.3)] active:scale-[0.97] transition-all cursor-pointer"
        >
          MIS REGISTROS
        </motion.button>
      </div>
    </motion.div>
  );
}

/* Splash is just a quick loader that auto-advances to Home */
export function Splash({ onNavigate, onSelectClass }: SplashProps) {
  return (
    <HomeScreen 
      onNavigate={onNavigate} 
      classes={[]} 
      isLoading={true}
      onSelectClass={onSelectClass}
    />
  );
}
