import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { UserCircle, MapPin, ChevronRight, MessageCircle } from "lucide-react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";
import { useState } from "react";

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
  const [sharingClassId, setSharingClassId] = useState<string | null>(null);
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);

  const fetchRegisteredNames = async (classId: string): Promise<string[]> => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('registrations')
        .select('students(full_name)')
        .eq('class_id', classId);
      if (error) throw error;
      return (data || []).map((r: any) => r.students?.full_name).filter(Boolean);
    } catch (err) {
      console.error("Error fetching registered names:", err);
      return [];
    }
  };

  const handleShareReminder = async (c: ClassSession) => {
    setSharingClassId(c.id);
    try {
      const names = await fetchRegisteredNames(c.id);
      const mapsLine = c.mapsUrl ? `📍 Ubicación:\n${c.mapsUrl}` : `📍 Sede: ${c.location}`;
      const studentsList = names.map(n => `✅ ${n}`).join("\n");
      const titleLine = `🔥 ${c.title || "Strong Nation"}`;
      const dateLine = `📅 ${formatDisplayDate(c)}`;
      const timeLine = `⏰ ${c.timeStr || ""}`;
      const deadlineLine = `⏳ Registro cierra: ${c.deadlineStr || "9:00 p.m."}`;
      const regLine = `📝 Regístrate aquí:\n${window.location.origin}`;
      const whatsappText = `${titleLine}\n\n${dateLine}\n${timeLine}\n${deadlineLine}\n\nRegistradas (${c.confirmedCount}):\n${studentsList || "(aún sin registros)"}\n\n${mapsLine}\n\n${regLine}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
    } catch (err) {
      console.error("Error sharing reminder:", err);
    } finally {
      setSharingClassId(null);
    }
  };

  const shouldShowSmartReminder = (): boolean => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isPast830 = hours > 20 || (hours === 20 && minutes >= 30);
    if (!isPast830) return false;
    return classes.some(
      c => c.status === "pendiente"
        && c.startsAt
        && getWeekCategory(c.startsAt) !== "otro"
    );
  };

  const getNearestPendingClass = (): ClassSession | null => {
    const pending = classes
      .filter(c => c.status === "pendiente" && c.startsAt)
      .sort((a, b) => new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime());
    return pending[0] || null;
  };

  const handleGenerateReminder = async () => {
    setIsGeneratingReminder(true);
    try {
      const nearest = getNearestPendingClass();
      if (!nearest) return;
      const names = await fetchRegisteredNames(nearest.id);
      const mapsLine = nearest.mapsUrl ? `📍 Ubicación:\n${nearest.mapsUrl}` : `📍 Sede: ${nearest.location}`;
      const studentsList = names.map(n => `✅ ${n}`).join("\n");
      const titleLine = `🔥 ${nearest.title || "Strong Nation"}`;
      const dateLine = `📅 ${formatDisplayDate(nearest)}`;
      const timeLine = `⏰ ${nearest.timeStr || ""}`;
      const deadlineLine = `⏳ Registro cierra: ${nearest.deadlineStr || "9:00 p.m."}`;
      const regLine = `📝 Regístrate aquí:\n${window.location.origin}`;
      const message = `${titleLine}\n\n${dateLine}\n${timeLine}\n${deadlineLine}\n\nRegistradas (${nearest.confirmedCount}):\n${studentsList || "(aún sin registros)"}\n\n${mapsLine}\n\n${regLine}`;
      await navigator.clipboard.writeText(message);
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (err) {
      console.error("Error generating reminder:", err);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum": return "CONFIRMADA";
      case "confirmada_manual": return "ACTIVA (MANUAL)";
      case "cancelada": return "CANCELADA";
      case "finalizada": return "FINALIZADA";
      default: return "PENDIENTE";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum":
      case "confirmada_manual": return "status-confirmed";
      case "cancelada": return "status-cancelled";
      case "finalizada": return "bg-slate-500/10 border-slate-500/30 text-slate-400";
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
          {/* Avatar Placeholder */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#170A12] to-[#0B0B0F] flex items-center justify-center shadow-[0_0_30px_rgba(201,60,255,0.2)] border-2 border-white/10 relative overflow-hidden glass-card">
              <UserCircle className="w-14 h-14 text-white/50" strokeWidth={1} />
              <div className="absolute -top-1 -right-1 px-1.5 h-5 rounded-full bg-gradient-to-br from-[#F20F72] to-[#8E2DE2] flex items-center justify-center border border-[#F20F72]/50 shadow-[0_0_10px_rgba(242,15,114,0.5)]">
                <span className="text-[9px] font-black text-white italic">PRO</span>
              </div>
            </div>
          </motion.div>

          <h1 className="text-3xl font-black italic tracking-tight text-white uppercase leading-none">
            STRONG{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F20F72] to-[#C93CFF] drop-shadow-[0_0_15px_rgba(242,15,114,0.5)]">
              NATION
            </span>
          </h1>
          <p className="text-xs font-semibold text-[#C93CFF] mt-2 tracking-wider italic">
            Más fuertes juntos 💪
          </p>
        </div>

        {/* Description */}
        <div className="glass-panel mx-auto mb-8 max-w-xs p-4 rounded-2xl bg-gradient-to-b from-black/60 to-black/40 border border-white/5 backdrop-blur-md">
          <p className="text-sm text-[#F7F4F8]/90 text-center leading-relaxed font-medium">
            Regístrate para tus clases y seamos más fuertes juntos 💪
          </p>
        </div>

        {/* Beneficios */}
        <div className="mb-8 p-5 glass-panel bg-gradient-to-br from-[#0B0B0F]/90 to-[#170A12]/95 border border-[#F20F72]/20 shadow-[0_0_20px_rgba(201,60,255,0.08)] backdrop-blur-xl rounded-2xl relative overflow-hidden">
          {/* Decorative glow inside */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#F20F72]/10 blur-[30px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-[13px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
            <span className="w-1.5 h-1.5 bg-[#F20F72] rounded-full shadow-[0_0_8px_rgba(242,15,114,0.8)]"></span>
            ¿Por qué Strong Nation?
          </h2>
          <ul className="space-y-2 text-xs text-[#F7F4F8]/90 relative z-10">
            <li className="flex items-start gap-2">
              <span className="text-[#8E2DE2] font-black">▹</span> Entrenamiento de alta intensidad
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8E2DE2] font-black">▹</span> Trabajo de cuerpo completo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8E2DE2] font-black">▹</span> Cardio + fuerza sin equipo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8E2DE2] font-black">▹</span> Movimientos sincronizados con música
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8E2DE2] font-black">▹</span> Energía, resistencia y motivación
            </li>
          </ul>
        </div>

        {/* Smart Reminder Button */}
        {shouldShowSmartReminder() && (
          <div className="mb-3">
            <button
              onClick={handleGenerateReminder}
              disabled={isGeneratingReminder}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {isGeneratingReminder ? "Generando..." : "GENERAR RECORDATORIO AUTOMÁTICO"}
            </button>
          </div>
        )}

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
            classes.filter(c => getWeekCategory(c.startsAt) !== "otro" && c.status !== "finalizada").map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="class-card w-full rounded-2xl p-4 glass-card border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F20F72]/15 border border-[#F20F72]/25 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#F20F72] text-xl">event</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">
                        {formatDisplayDate(c)} {c.timeStr}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-[#F20F72]" />
                        <span className="text-xs text-[#e2bdc6]">{c.location}</span>
                        {c.mapsUrl && (
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(c.mapsUrl, '_blank'); }}
                            className="ml-1 text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer"
                          >
                            Maps
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${getStatusClass(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (onSelectClass) onSelectClass(c.id);
                      onNavigate(ScreenId.RegistroDeClase, "push");
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-white text-[#1e0f14] font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                  >
                    Registrarme
                  </button>
                  {c.status === "pendiente" && (
                    <button
                      onClick={() => handleShareReminder(c)}
                      disabled={sharingClassId === c.id}
                      className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-white font-black text-[9px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <MessageCircle className="w-3 h-3 text-[#25D366]" />
                      {sharingClassId === c.id ? "..." : "Recordatorio"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onNavigate(ScreenId.MisRegistros, "push")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20F72] to-[#8E2DE2] text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(242,15,114,0.3)] active:scale-[0.97] transition-all cursor-pointer"
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
