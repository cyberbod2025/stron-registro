import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, MessageCircle, MapPin, Navigation, Calendar } from "lucide-react";

interface InviteProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast: (message: string) => void;
  classSession?: ClassSession;
}

export function InviteScreen({ onNavigate, onShowToast, classSession }: InviteProps) {
  const missing = classSession ? Math.max(0, classSession.minRequired - classSession.confirmedCount) : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#1e0f14]/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-wider">Invitar amigas</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Crisis Alert */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-950/20 to-[#14050c] border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Protege el Quórum</p>
          </div>
          <h2 className="text-lg font-black text-white uppercase leading-tight italic">
            Falta{missing !== 1 ? 'n' : ''}{" "}
            <span className="text-[#ff4994]">{missing} alumna{missing !== 1 ? 's' : ''}</span>{" "}
            para confirmar
          </h2>
          <p className="text-xs text-[#e2bdc6] leading-relaxed">
            Necesitamos mínimo {classSession?.minRequired || 5} personas. ¡Ayuda invitando por WhatsApp!
          </p>
        </div>

        {/* Core Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const whatsappText = `Hola, estamos por confirmar la clase de Strong Nation.\nSolo falta ${missing} persona${missing !== 1 ? 's' : ''} para completar el mínimo de ${classSession?.minRequired || 5}.\nClase: ${classSession?.dateStr} ${classSession?.timeStr}\nSede: ${classSession?.location}.\n¿Te animas? 💪`;
              window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
            }}
            className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm uppercase tracking-widest shadow-md hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                    onShowToast("Ubicación pendiente");
                  }
                }}
                className={`py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${!classSession?.wazeUrl ? 'col-span-2' : ''}`}
              >
                <MapPin className="w-4 h-4 text-[#ff4994]" />
                Abrir ubicación
              </button>
              {classSession?.wazeUrl && (
                <button
                  onClick={() => window.open(classSession.wazeUrl, '_blank')}
                  className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer"
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
              onShowToast("Recordatorio: activar alarma 1 hora antes.");
            }}
            className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/10 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            Agregar a calendario
          </button>
        </div>
      </div>
    </motion.div>
  );
}
