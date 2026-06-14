import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { Bell, User, MapPin, CheckCircle, AlertTriangle, XCircle, Share2 } from "lucide-react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";

interface InicioProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
  onSelectClass?: (classId: string) => void;
}

export function InicioScreen({ onNavigate, classes, onSelectClass }: InicioProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada": return "text-emerald-400";
      case "suspendida": return "text-rose-400";
      default: return "text-amber-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "confirmada": return "status-confirmed";
      case "suspendida": return "status-cancelled";
      default: return "status-pending";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmada": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "suspendida": return <XCircle className="w-4 h-4 text-rose-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
    }
  };

  const getHeaderTitle = (status: string) => {
    switch (status) {
      case "confirmada": return "CONFIRMADA";
      case "suspendida": return "CANCELADA";
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
          <Bell className="w-5 h-5 text-[#ffb1c7]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#1e0f14]" />
        </button>

        <div className="text-center">
          <span className="text-[9px] font-black text-[#00a2ff] tracking-[0.2em] uppercase leading-none block mb-0.5">
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
        {classes.filter(c => getWeekCategory(c.startsAt) !== "otro").map((c, index) => {
          const isPending = c.status === "pendiente";
          const isConfirmed = c.status === "confirmada";
          const isSuspended = c.status === "suspendida";
          const missing = Math.max(0, c.minRequired - c.confirmedCount);
          const needsHelp = isPending && missing <= 2 && missing > 0;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-2xl overflow-hidden p-5 border shadow-lg ${
                isConfirmed ? "bg-[#0f1f17]/60 border-emerald-500/20" :
                isSuspended ? "bg-[#1f0f12]/60 border-rose-500/20" :
                "bg-[#0a1020]/40 border-[#00a2ff]/15"
              }`}
            >
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${getStatusBg(c.status)}`}>
                  {getStatusIcon(c.status)}
                  {getHeaderTitle(c.status)}
                </span>
                <span className="text-[10px] text-white/40 font-mono">{c.confirmedCount}/{c.minRequired}</span>
              </div>

              {/* Class Info */}
              <h3 className="text-lg font-black text-white leading-tight mb-1">
                {formatDisplayDate(c)} {c.timeStr}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#e2bdc6] mb-4">
                <MapPin className="w-3.5 h-3.5 text-[#00a2ff]" />
                <span>{c.location}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (c.confirmedCount / c.minRequired) * 100)}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                  className={`h-full rounded-full ${
                    isConfirmed ? "bg-emerald-400" : isSuspended ? "bg-rose-400" : "bg-[#00a2ff]"
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
                {needsHelp && (
                  <button
                    onClick={() => onNavigate(ScreenId.InvitarAmiga, "slide_up")}
                    className="py-3 px-4 rounded-xl bg-[#00a2ff] text-white font-black text-[11px] uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
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
