import { ScreenId, TransitionType, ClassRegistration, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Calendar, MapPin, QrCode, AlertTriangle, AlertCircle, Navigation, MessageCircle } from "lucide-react";
import React, { useState } from "react";

interface ClassScreensProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast?: (message: string) => void;
  registration?: ClassRegistration;
  onChangeRegistration?: (reg: ClassRegistration) => void;
  classes?: ClassSession[];
  classSession?: ClassSession;
}

export function RegistroDeClaseScreen({
  onNavigate,
  onShowToast,
  registration,
  onChangeRegistration,
  classes
}: ClassScreensProps) {
  const pendingClass = classes?.find(c => c.status === "pendiente") || classes?.[0];

  const [formData, setFormData] = useState<ClassRegistration>({
    classId: registration?.classId || pendingClass?.id || "",
    fullName: registration?.fullName || "",
    email: registration?.email || "",
    mobile: registration?.mobile || "",
    isCommitted: registration?.isCommitted ?? false,
    understandsGoal: registration?.understandsGoal ?? false,
    willCancelInTime: registration?.willCancelInTime ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile) {
      onShowToast?.("Por favor completa todos los campos.");
      return;
    }
    if (!formData.isCommitted || !formData.understandsGoal || !formData.willCancelInTime) {
      onShowToast?.("Debes aceptar el compromiso de asistencia.");
      return;
    }
    onChangeRegistration?.(formData);
    onShowToast?.("¡Registro realizado con éxito!");
    onNavigate(ScreenId.Confirmada, "push");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Splash, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black text-rose-300 tracking-wider uppercase">Inscripción</span>
        <div className="w-10" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-black italic text-white uppercase tracking-tight">Registro de Clase</h1>
        <p className="text-xs text-[#e2bdc6] mt-1">Completa tus datos para garantizar tu lugar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex gap-2.5 items-center p-3 rounded-lg bg-white/5 text-xs text-white">
            <MapPin className="w-4 h-4 text-[#ff4994]" />
            <div>
              <p className="font-extrabold text-white uppercase">{pendingClass?.title || "Strong Nation"}</p>
              <p className="text-[10px] text-white/50">
                Sede: {pendingClass?.location} • {pendingClass?.dateStr} {pendingClass?.timeStr}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full bg-[#1e0f14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#ff4994]"
              placeholder="Tu nombre completo"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full bg-[#1e0f14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#ff4994]"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1">Teléfono</label>
            <input
              type="tel"
              required
              className="w-full bg-[#1e0f14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#ff4994]"
              placeholder="55 1234 5678"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          </div>
        </div>

        {/* Commitment Agreement Checkpoint */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2b172a] to-[#120614] border border-[#ff4994]/30 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-[#ff4994] text-primary focus:ring-0"
              checked={formData.understandsGoal}
              onChange={(e) => setFormData({ ...formData, understandsGoal: e.target.checked })}
            />
            <div className="text-[11px] text-[#e2bdc6] leading-relaxed">
              Entiendo que la clase requiere un mínimo de <strong>5 alumnas confirmadas</strong> para llevarse a cabo.
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-[#ff4994] text-primary focus:ring-0"
              checked={formData.willCancelInTime}
              onChange={(e) => setFormData({ ...formData, willCancelInTime: e.target.checked })}
            />
            <div className="text-[11px] text-[#e2bdc6] leading-relaxed">
              Si no puedo asistir, me comprometo a <strong>cancelar con tiempo</strong> para no afectar al grupo y al quórum.
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer border-t border-white/10 pt-3">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-[#ff4994] text-primary focus:ring-0"
              checked={formData.isCommitted}
              onChange={(e) => setFormData({ ...formData, isCommitted: e.target.checked })}
            />
            <div className="text-[11px] font-bold text-white leading-relaxed">
              Confirmo mi asistencia y acepto el compromiso de comunidad.
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#562ba0] text-white font-black text-xs uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
        >
          CONFIRMAR MI LUGAR
        </button>
      </form>
    </motion.div>
  );
}

export function ConfirmadaScreen({ onNavigate, onShowToast, classSession }: ClassScreensProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24 text-center"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black text-emerald-300 tracking-wider uppercase">Clase Confirmada</span>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center space-y-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 p-2 text-emerald-400 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black italic text-white uppercase tracking-tight">
          ¡Lugar Reservado!
        </h1>
        <p className="text-xs text-[#e2bdc6] max-w-sm leading-relaxed">
          Tu lugar está asegurado. Gracias por confirmar a tiempo y apoyar al quórum del grupo.
        </p>
      </div>

      <div className="bg-[#1e0f14] rounded-3xl p-5 border border-emerald-500/30 space-y-4 max-w-sm mx-auto text-left relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <p className="text-[8px] font-black uppercase text-emerald-400 tracking-wider leading-none mb-1">Clase</p>
            <p className="text-xs font-black text-white">{classSession?.title || "Strong Nation"}</p>
          </div>
        </div>

        <div className="space-y-2 py-1 text-xs text-[#e2bdc6]">
          <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> {classSession?.dateStr} a las {classSession?.timeStr}</p>
          <div className="flex flex-col gap-1">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> {classSession?.location}</p>
            {classSession?.address && (
              <p className="pl-6 text-[10px] text-emerald-400/80 italic">{classSession.address}</p>
            )}
          </div>
        </div>

        <div className="border-t border-dashed border-white/20 pt-4 text-center space-y-4">
          <div>
            <QrCode className="w-24 h-24 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-[9px] text-white/50 font-mono">Presenta este código al llegar</p>
          </div>
          
          <div className="space-y-2">
            {classSession?.mapsUrl && (
              <button
                onClick={() => window.open(classSession.mapsUrl, '_blank')}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Abrir ubicación en Maps
              </button>
            )}
            {classSession?.wazeUrl && (
              <button
                onClick={() => window.open(classSession.wazeUrl, '_blank')}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                Abrir en Waze
              </button>
            )}
            <button
              onClick={() => {
                const title = "Strong Nation Iztacalco";
                const details = "Clase confirmada. Llegar 10 minutos antes.";
                const location = classSession?.location || "";
                const calendarUrl = classSession?.calendarUrl || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
                window.open(calendarUrl, '_blank');
                onShowToast?.("Al agregarlo a tu calendario, activa recordatorio 1 hora antes.");
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Agregar a calendario
            </button>
            <button
              onClick={() => {
                const whatsappText = `¡Hola! Ya confirmé mi asistencia a la clase de Strong Nation Iztacalco el ${classSession?.dateStr} a las ${classSession?.timeStr} en ${classSession?.location}. ¿Te animas a venir?`;
                window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
              }}
              className="w-full py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#25D366]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              Compartir con una amiga
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.Inicio, "none")}
        className="w-full max-w-sm py-3.5 rounded-xl bg-white text-[#1e0f14] font-black text-xs uppercase tracking-widest shadow-md hover:bg-gray-200 active:scale-95 transition-all cursor-pointer mt-6"
      >
        IR A INICIO
      </button>
    </motion.div>
  );
}

export function ClaseCanceladaIztacalcoScreen({ onNavigate, classSession }: ClassScreensProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24 text-center"
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black text-rose-300 tracking-wider uppercase">Estado</span>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center space-y-4 my-8">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-400 p-2 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-black italic text-rose-400 uppercase tracking-tight">
          CLASE SUSPENDIDA
        </h1>
        <p className="text-xs text-[#e2bdc6] max-w-sm px-4 leading-relaxed">
          Para la clase de {classSession?.dateStr} en {classSession?.location}, no logramos alcanzar el mínimo de <strong className="text-white">{classSession?.minRequired || 5} alumnas confirmadas</strong> antes de la hora de cierre.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-white/10 text-left max-w-sm mx-auto space-y-2 mb-6 bg-[#1e0f14]">
        <div className="flex items-start gap-2 text-xs text-[#e2bdc6]">
          <AlertCircle className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Nuestra regla de quórum es clave: así cuidamos el tiempo de todas. Te invitamos a registrarte en las próximas sesiones.
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.Inicio, "push")}
        className="w-full max-w-sm py-3.5 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 shadow-md cursor-pointer"
      >
        VER PRÓXIMAS CLASES
      </button>
    </motion.div>
  );
}
