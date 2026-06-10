import { ScreenId, TransitionType, ClassRegistration } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Calendar, ShieldCheck, MapPin, QrCode, AlertTriangle, AlertCircle } from "lucide-react";
import React, { useState } from "react";

interface ClassScreensProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast: (message: string) => void;
  registration: ClassRegistration;
  onChangeRegistration: (reg: ClassRegistration) => void;
  onAddRegistrationRecord?: (className: string, date: string, status: "confirmada" | "asistida" | "cancelada") => void;
}

export function RegistroDeClaseScreen({
  onNavigate,
  onShowToast,
  registration,
  onChangeRegistration,
}: ClassScreensProps) {
  const [formData, setFormData] = useState<ClassRegistration>({
    fullName: registration.fullName || "Hugo Watson Primero",
    email: registration.email || "hugo.watson@gmail.com",
    mobile: registration.mobile || "55 1234 5678",
    isCommitted: registration.isCommitted ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.mobile) {
      onShowToast("Por favor completa todos los campos.");
      return;
    }
    if (!formData.isCommitted) {
      onShowToast("Debes aceptar el compromiso de asistencia.");
      return;
    }
    onChangeRegistration(formData);
    onShowToast("¡Registro realizado con éxito!");
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
        <span className="text-xs font-black text-rose-300 tracking-wider uppercase">Pase de Entrada</span>
        <div className="w-10" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-xl font-black italic text-white uppercase tracking-tight">Registro de Clase</h1>
        <p className="text-xs text-[#e2bdc6] mt-1">Completa tus datos para garantizar tu lugar en el entrenamiento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex gap-2.5 items-center p-3 rounded-lg bg-white/5 text-xs text-white">
            <MapPin className="w-4 h-4 text-[#ff4994]" />
            <div>
              <p className="font-extrabold text-white uppercase">STRONG NATION IZTACALCO</p>
              <p className="text-[10px] text-white/50">Instructor: Hugo Sánchez • Hoy 7:00 PM</p>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full bg-[#1e0f14] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#ff4994]"
              placeholder="Hugo Watson Primero"
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
              placeholder="hugo.watson@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1">WhatsApp Teléfono</label>
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
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2b172a] to-[#120614] border border-[#ff4994]/30">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-[#ff4994] text-primary focus:ring-0"
              checked={formData.isCommitted}
              onChange={(e) => setFormData({ ...formData, isCommitted: e.target.checked })}
            />
            <div className="text-xs text-[#e2bdc6] leading-relaxed">
              <strong className="text-white block font-black uppercase text-[10px] tracking-widest text-[#ffb1c7] mb-1">
                Pacto de Honor y Confianza
              </strong>
              Me comprometo solemnemente a asistir. Sé que si cancelo de última hora o no me presento, perjudico el quórum grupal y bajaré mi <span className="text-[#ff4994] font-bold">Nivel de Confianza</span> en la sede.
            </div>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#562ba0] text-white font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all cursor-pointer text-center"
        >
          REGISTRARSE A LA CLASE
        </button>
      </form>
    </motion.div>
  );
}

// Unified Ticket Confirmation screen replacing 2 separate visual ticket screens
export function ConfirmadaScreen({ onNavigate, registration }: ClassScreensProps) {
  const [ticketStyle, setTicketStyle] = useState<"standard" | "compact">("standard");

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
        <span className="text-xs font-black text-rose-300 tracking-wider uppercase">Pase Reservado</span>
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center space-y-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 p-2 text-emerald-400 flex items-center justify-center animate-bounce">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black italic text-white uppercase tracking-tight">
          ¡ENTRENAMIENTO RESERVADO!
        </h1>
        <p className="text-xs text-[#e2bdc6] max-w-sm leading-relaxed">
          Has completado el pacto de honor. Tu lugar en <strong className="text-white">Strong Nation Iztacalco</strong> ha quedado garantizado.
        </p>
      </div>

      {/* Ticket Selection Toggles */}
      <div className="flex bg-[#12050c] border border-white/5 p-1 rounded-xl mb-4 max-w-sm mx-auto">
        <button
          onClick={() => setTicketStyle("standard")}
          className={`flex-1 py-1.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            ticketStyle === "standard" ? "bg-[#ff4994] text-white" : "text-white/40"
          }`}
        >
          Ticket Entrada QR
        </button>
        <button
          onClick={() => setTicketStyle("compact")}
          className={`flex-1 py-1.5 text-[9px] font-extrabold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            ticketStyle === "compact" ? "bg-[#ff4994] text-white" : "text-white/40"
          }`}
        >
          Pase de Honor Team
        </button>
      </div>

      {ticketStyle === "standard" ? (
        <div className="bg-[#2a1723] rounded-3xl p-5 border border-[#ff4994]/30 space-y-4 max-w-sm mx-auto text-left relative overflow-hidden">
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#1e0f14] rounded-full transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#1e0f14] rounded-full transform -translate-y-1/2"></div>

          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <p className="text-[8px] font-black uppercase text-[#ff4994] tracking-wider leading-none mb-1">Atleta Registrado</p>
              <p className="text-xs font-black text-white">{registration?.fullName || "Hugo Watson Primero"}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase text-[#ff4994] tracking-wider leading-none mb-1">Nivel Confianza</p>
              <p className="text-xs font-bold text-emerald-400">98% (Elite)</p>
            </div>
          </div>

          <div className="space-y-2 py-1 text-xs text-[#e2bdc6]">
            <p>🗓️ Hoy, 7:00 PM (Llegar 10 min antes)</p>
            <p>📍 Sede Iztacalco • Domo Deportivo</p>
          </div>

          <div className="border-t border-dashed border-white/20 pt-4 text-center">
            <QrCode className="w-24 h-24 text-white mx-auto p-1.5 bg-white rounded-lg mb-2" />
            <p className="text-[9px] text-white/50 font-mono">ID: SNI-984260-MX</p>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-5 border border-white/10 text-left max-w-sm mx-auto space-y-4 bg-gradient-to-tr from-[#1b0a33] to-[#120516]">
          <div className="flex gap-2.5 items-start">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 h-8 w-8 shrink-0 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Compromiso Sellado</h3>
              <p className="text-xs text-[#e2bdc6] mt-1 leading-relaxed">
                El club premia tu palabra empeñada. Prepárate y asiste para sumar puntos a tu ranking de fuego consecutivo.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => onNavigate(ScreenId.Inicio, "none")}
        className="w-full max-w-sm py-3.5 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#582ea2] text-white font-black text-xs uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer mt-6"
      >
        REGRESAR AL INICIO
      </button>
    </motion.div>
  );
}

export function SuccessClassConfirmedScreen({ onNavigate }: { onNavigate: (screen: ScreenId, transition: TransitionType) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24 text-center"
    >
      <div className="flex flex-col items-center space-y-3 my-8">
        <span className="text-5xl animate-bounce">👑</span>
        <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">
          ¡RETO COMPLETADO!
        </h1>
        <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-wide">
          Meta 5: Conseguida Exitosamente
        </p>
        <p className="text-xs text-[#e2bdc6] max-w-xs px-4 mt-2 leading-relaxed">
          ¡Increíble compromiso! 5 de tus amigas invitadas se han registrado en Strong Nation Iztacalco. Has desbloqueado tu Pase VIP.
        </p>
      </div>

      <div className="relative rounded-2xl p-5 bg-gradient-to-tr from-[#3b174a] via-[#10041d] to-[#ff4994]/20 border-2 border-dashed border-amber-400 max-w-xs mx-auto mb-6 shadow-xl">
        <span className="absolute -top-3 -right-3 bg-amber-400 text-[#1e0f14] text-[9px] uppercase font-black px-2.5 py-1 rounded-full">
          VIP REWARD
        </span>
        <p className="text-[9px] font-black uppercase text-amber-300 tracking-wider mb-1">CÓDIGO DE PASE</p>
        <p className="text-2xl font-black text-white font-mono tracking-wider">STRG-VIP-55</p>
        <p className="text-[10px] text-[#e2bdc6] mt-3">Canjeable en mostrador con tu Instructor por 3 entrenamientos gratis.</p>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
        className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#582ea2] text-white font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer"
      >
        VER MI PERFIL Y HISTORIAL
      </button>
    </motion.div>
  );
}

export function ClaseCanceladaIztacalcoScreen({ onNavigate }: { onNavigate: (screen: ScreenId, transition: TransitionType) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24 text-center"
    >
      <div className="flex flex-col items-center space-y-4 my-8">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border-2 border-rose-400 p-2 text-rose-400 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-black italic text-rose-400 uppercase tracking-tight">
          SESIÓN SUSPENDIDA
        </h1>
        <p className="text-xs text-[#e2bdc6] max-w-sm px-4 leading-relaxed">
          Por falta del quórum mínimo de <strong className="text-white">5 atletas confirmadas</strong> antes de la hora límite, la sesión HIIT de hoy en Iztacalco ha quedado suspendida.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-rose-500/20 text-left max-w-sm mx-auto space-y-2 mb-6">
        <div className="flex items-start gap-2 text-xs text-[#e2bdc6]">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Al cancelarse de forma grupal, tu <strong className="text-white">Nivel de Confianza</strong> no bajará directamente, pero se congelará. Organicémonos mejor para la siguiente sesión invitando a amigas en riesgo.
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.Inicio, "push")}
        className="w-full max-w-sm py-3.5 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#582ea2] text-white font-black text-xs uppercase tracking-widest shadow-md cursor-pointer animate-pulse"
      >
        REGRESAR AL INICIO
      </button>
    </motion.div>
  );
}
