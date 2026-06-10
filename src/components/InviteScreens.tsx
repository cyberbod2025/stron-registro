import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, MessageCircle, MapPin, Navigation, Calendar } from "lucide-react";
import React from "react";

interface InviteProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast: (message: string) => void;
  classSession?: ClassSession;
}

export function InviteScreen({ onNavigate, onShowToast, classSession }: InviteProps) {

  const missing = classSession ? Math.max(0, classSession.minRequired - classSession.confirmedCount) : 1;

  const quorumFriends = [
    { name: "Sofía Martínez", status: "Frecuente", phone: "+52 55 1234 5678" },
    { name: "Valeria Gómez", status: "Ausente", phone: "+52 55 9876 5432" },
    { name: "Camila Ruiz", status: "Frecuente", phone: "+52 55 4567 8901" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black text-[#ffb1c7] tracking-widest uppercase mb-0.5">Invitar Amigas</span>
          <h1 className="text-base font-black text-white uppercase tracking-tight">Comunidad Strong</h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* S.O.S Crisis Alert Widget Card */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/20 to-[#14050c] border border-rose-500/40 space-y-3 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Protege el Quórum</p>
          </div>

          <h2 className="text-base font-black text-white uppercase leading-tight italic">
            Falta{missing !== 1 ? 'n' : ''} <span className="text-[#ff4994] font-black">{missing} alumna{missing !== 1 ? 's' : ''}</span> para confirmar la sesión
          </h2>

          <p className="text-[11px] text-[#e2bdc6] leading-relaxed">
            Nuestra comunidad requiere un mínimo de {classSession?.minRequired || 5} personas. ¡Ayuda a asegurar el entrenamiento invitando a una amiga por WhatsApp!
          </p>
        </div>

        {/* Core Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const whatsappText = `Hola, estamos por confirmar la clase de Strong Nation Iztacalco.\nSolo falta ${missing} persona${missing !== 1 ? 's' : ''} para completar el mínimo de ${classSession?.minRequired || 5}.\nClase: ${classSession?.dateStr} ${classSession?.timeStr}\nSede: ${classSession?.location}.\n¿Te animas a venir?`;
              window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
            }}
            className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-black text-xs uppercase tracking-widest shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            Compartir por WhatsApp
          </button>
          
          {!classSession?.isPrivateLocation && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (classSession?.mapsUrl) {
                    window.open(classSession.mapsUrl, '_blank');
                  } else {
                    onShowToast("Ubicación pendiente por configurar");
                  }
                }}
                className={`py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${!classSession?.wazeUrl ? 'col-span-2' : ''}`}
              >
                <MapPin className="w-4 h-4 text-[#ff4994]" />
                Abrir ubicación
              </button>
              {classSession?.wazeUrl && (
                <button
                  onClick={() => window.open(classSession.wazeUrl, '_blank')}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-blue-400" />
                  Abrir en Waze
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => {
              const title = "Strong Nation Iztacalco";
              const details = "Clase confirmada con mínimo de 5 alumnas. Llegar 10 minutos antes.";
              const location = classSession?.location || "";
              const calendarUrl = classSession?.calendarUrl || `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
              window.open(calendarUrl, '_blank');
              onShowToast("Al agregarlo a tu calendario, activa recordatorio 1 hora antes.");
            }}
            className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Agregar a calendario
          </button>
        </div>

        {/* Quick lists */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Sugerencias (WhatsApp)</h3>
          <div className="space-y-3">
            {quorumFriends.map((friend, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#1e0f14] border border-white/5 hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <p className="text-xs font-black text-white">{friend.name}</p>
                  <span className="text-[9px] font-bold text-white/50 uppercase bg-white/5 px-1.5 py-0.5 mt-1 rounded inline-block">
                    {friend.status}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onShowToast(`Abriendo chat con ${friend.name}...`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Enviar Link
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
