import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { Bell, User, MapPin, CheckCircle, AlertTriangle, XCircle, Share2, MessageCircle } from "lucide-react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";
import { useState } from "react";

interface InicioProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
  onSelectClass?: (classId: string) => void;
}

export function InicioScreen({ onNavigate, classes, onSelectClass }: InicioProps) {
  const [sharingClassId, setSharingClassId] = useState<string | null>(null);

  const fetchRegisteredNames = async (classId: string): Promise<string[]> => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('registrations')
        .select('students(full_name)')
        .eq('class_id', classId);
      if (error) throw error;
      return (data || [])
        .map((r: any) => r.students?.full_name)
        .filter(Boolean);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum":
      case "confirmada_manual": return "text-emerald-400";
      case "cancelada": return "text-rose-400";
      case "finalizada": return "text-slate-400";
      default: return "text-amber-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum":
      case "confirmada_manual": return "status-confirmed";
      case "cancelada": return "status-cancelled";
      case "finalizada": return "bg-slate-500/10 border-slate-500/30";
      default: return "status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum":
      case "confirmada_manual": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "cancelada": return <XCircle className="w-4 h-4 text-rose-400" />;
      case "finalizada": return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
    }
  };

  const getHeaderTitle = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum": return "CONFIRMADA";
      case "confirmada_manual": return "ACTIVA (MANUAL)";
      case "cancelada": return "CANCELADA";
      case "finalizada": return "FINALIZADA";
      default: return "PENDIENTE";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
    >
      {/* Top Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate(ScreenId.Notificaciones, "push")}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer relative"
        >
          <Bell className="w-5 h-5 text-[#C93CFF]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#1e0f14]" />
        </button>

        <div className="text-center">
          <span className="text-[9px] font-black text-[#F20F72] tracking-[0.2em] uppercase leading-none block mb-0.5">
            Strong Nation
          </span>
          <h2 className="text-sm font-black text-white italic tracking-tight uppercase">
            Iztacalco
          </h2>
        </div>

        <button
          onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <User className="w-5 h-5 text-[#d3bbff]" />
        </button>
      </div>

      {/* Class Cards */}
      <div className="px-5 space-y-4">
        {classes.filter(c => getWeekCategory(c.startsAt) !== "otro" && c.status !== "finalizada").map((c, index) => {
          const isPending = c.status === "pendiente";
          const isConfirmed = c.status === "confirmada_por_quorum" || c.status === "confirmada_manual";
          const isSuspended = c.status === "cancelada";
          const missing = Math.max(0, c.minRequired - c.confirmedCount);
          const needsHelp = isPending && missing <= 2 && missing > 0;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-2xl overflow-hidden p-5 shadow-lg glass-card ${
                isConfirmed ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" :
                isSuspended ? "border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]" :
                "border-white/20"
              }`}
            >
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${getStatusBg(c.status)}`}>
                  {getStatusIcon(c.status)}
                  {getHeaderTitle(c.status)}
                </span>
                <span className="text-[10px] text-white/80 font-mono">{c.confirmedCount}/{c.minRequired}</span>
              </div>

              {/* Class Info */}
              <h3 className="text-lg font-black text-white leading-tight mb-1">
                {formatDisplayDate(c)} {c.timeStr}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#e2bdc6] mb-4">
                <MapPin className="w-3.5 h-3.5 text-[#F20F72]" />
                <span>{c.location}</span>
                {c.mapsUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open(c.mapsUrl, '_blank'); }}
                    className="ml-1 text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer"
                  >
                    Maps
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (c.confirmedCount / c.minRequired) * 100)}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                  className={`h-full rounded-full ${
                    isConfirmed ? "bg-emerald-400" : isSuspended ? "bg-rose-400" : "bg-[#F20F72]"
                  }`}
                />
              </div>

              {/* Status message */}
              <div className="text-[11px] text-[#e2bdc6] mb-4">
                {isPending && (
                  <span>Faltan <strong className="text-amber-300">{missing}</strong> alumna{missing !== 1 ? 's' : ''}. Cierre: {c.deadlineStr}.</span>
                )}
                {isConfirmed && <span className="text-emerald-300">✅ Nos vemos en clase. Llegar 10 min antes.</span>}
                {isSuspended && <span className="text-rose-300">{c.cancellationReason ? `Cancelada: ${c.cancellationReason}` : "No se alcanzó el mínimo antes del cierre."}</span>}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isSuspended && (
                  <button
                    onClick={() => {
                      if (onSelectClass) onSelectClass(c.id);
                      onNavigate(ScreenId.RegistroDeClase, "slide_up");
                    }}
                    className="flex-1 py-3 rounded-xl bg-white text-[#1e0f14] font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Confirmar asistencia
                  </button>
                )}
                {isPending && (
                  <button
                    onClick={() => handleShareReminder(c)}
                    disabled={sharingClassId === c.id}
                    className="py-3 px-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    {sharingClassId === c.id ? "..." : "Recordatorio"}
                  </button>
                )}
                {needsHelp && (
                  <button
                    onClick={() => onNavigate(ScreenId.InvitarAmiga, "slide_up")}
                    className="py-3 px-4 rounded-xl bg-[#F20F72] text-white font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Invitar
                  </button>
                )}
                {isSuspended && (
                  <button
                    onClick={() => onNavigate(ScreenId.ClaseCancelada, "push")}
                    className="flex-1 py-3 rounded-xl bg-white/10 text-white font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Ver detalles
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
