import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { Bell, User, MapPin, Clock, Calendar, CheckCircle, AlertTriangle, XCircle, Share2, ArrowRight } from "lucide-react";
import React from "react";

interface InicioProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
}

export function InicioScreen({ onNavigate, classes }: InicioProps) {
  // Find the first upcoming class, or default to the first one in the mock
  const nextClass = classes[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada": return "text-emerald-400";
      case "suspendida": return "text-rose-400";
      default: return "text-amber-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "confirmada": return "bg-emerald-500/20 border-emerald-500/30";
      case "suspendida": return "bg-rose-500/20 border-rose-500/30";
      default: return "bg-amber-500/20 border-amber-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmada": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "suspendida": return <XCircle className="w-5 h-5 text-rose-400" />;
      default: return <Clock className="w-5 h-5 text-amber-400 animate-pulse" />;
    }
  };

  const getHeaderTitle = (status: string) => {
    switch (status) {
      case "confirmada": return "CLASE CONFIRMADA";
      case "suspendida": return "CLASE SUSPENDIDA";
      default: return "PRÓXIMA CLASE";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <button
            onClick={() => onNavigate(ScreenId.Notificaciones, "push")}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer relative"
          >
            <Bell className="w-5 h-5 text-[#ffb1c7]" />
            {/* Mock unread indicator */}
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#1e0f14]" />
          </button>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-black text-rose-300 tracking-[0.2em] uppercase leading-none block mb-1">
            Strong Nation Iztacalco
          </span>
          <h2 className="text-sm font-black text-white italic tracking-tight uppercase">
            by Hugo Sánchez
          </h2>
        </div>

        <button
          onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <User className="w-5 h-5 text-[#d3bbff]" />
        </button>
      </div>

      {/* Main Quorum Cards */}
      <div className="space-y-6">
        {classes.map((c, index) => {
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
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-3xl overflow-hidden p-6 border shadow-xl bg-gradient-to-tr ${
                isConfirmed ? "from-emerald-950/40 to-neutral-900 border-emerald-500/30" :
                isSuspended ? "from-rose-950/30 to-neutral-900 border-rose-500/30" :
                "from-[#301c3d] via-[#1a0c1f] to-[#1e0f14] border-[#ff4994]/30"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${getStatusBg(c.status)} ${getStatusColor(c.status)} flex items-center gap-1.5`}>
                  {getStatusIcon(c.status)}
                  {getHeaderTitle(c.status)}
                </span>
              </div>

              <h3 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mb-2">
                {c.dateStr} {c.timeStr}
              </h3>
              
              <div className="flex flex-col gap-0.5 text-xs text-[#e2bdc6] mb-5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-bold">Sede: {c.location}</span>
                </div>
                {c.address && (
                  <span className={`pl-5 text-[10px] ${c.isPrivateLocation ? 'text-[#ffb1c7] italic' : 'text-white/50'}`}>
                    {c.address}
                  </span>
                )}
              </div>

              {/* Progress Bar & Stats */}
              <div className="bg-black/40 rounded-2xl p-4 mb-5 border border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-2xl font-black text-white font-mono leading-none">
                    {c.confirmedCount} <span className="text-sm text-white/50">/ {c.minRequired}</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                    confirmadas
                  </div>
                </div>
                
                {/* Visual Progress */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                  {Array.from({ length: c.minRequired }).map((_, i) => (
                    <div key={i} className={`flex-1 border-r border-[#1e0f14] last:border-0 ${i < c.confirmedCount ? (isConfirmed ? 'bg-emerald-400' : 'bg-[#ff4994]') : 'bg-transparent'}`} />
                  ))}
                  {c.confirmedCount > c.minRequired && (
                    <div className="flex-1 bg-emerald-400" />
                  )}
                </div>

                <div className="mt-3 text-[11px] font-medium flex items-start gap-2">
                  {isPending && (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-200">
                        Faltan {missing} alumna{missing !== 1 ? 's' : ''}. Cierre: {c.deadlineStr}.
                      </span>
                    </>
                  )}
                  {isConfirmed && (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-emerald-200">
                        Nos vemos en clase. Llegar 10 min antes.
                      </span>
                    </>
                  )}
                  {isSuspended && (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-rose-200">
                        No se alcanzó el mínimo antes del cierre.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!isSuspended && (
                  <button
                    onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
                    className="w-full py-3 px-4 rounded-xl bg-white text-[#1e0f14] font-black text-[11px] uppercase tracking-wider shadow-lg hover:bg-neutral-200 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Confirmar asistencia
                  </button>
                )}
                
                {needsHelp && (
                  <button
                    onClick={() => onNavigate(ScreenId.InvitarAmiga, "slide_up")}
                    className="w-full py-3 px-4 rounded-xl bg-[#ff4994] text-white font-black text-[11px] uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir (WhatsApp)
                  </button>
                )}

                {isSuspended && (
                  <button
                    className="w-full py-3 px-4 rounded-xl bg-white/10 text-white font-black text-[11px] uppercase tracking-wider hover:bg-white/20 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Ver próximas clases
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
