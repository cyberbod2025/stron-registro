import { ScreenId, TransitionType, ClassRegistration, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, Calendar, MapPin, AlertTriangle, AlertCircle, MessageCircle, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

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
    whatsappOptIn: true,
    referredByEmail: new URLSearchParams(window.location.search).get('ref') || undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(formData.classId);

  const selectedClass = classes?.find(c => c.id === selectedClassId) || pendingClass;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      onShowToast?.("Por favor completa tu nombre y correo.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { supabase } = await import('../lib/supabase');
      
      // 1. Buscar si la alumna ya existe
      const { data: existingStudents, error: searchError } = await supabase
        .from('students')
        .select('id')
        .eq('email', formData.email)
        .limit(1);

      if (searchError) throw searchError;

      let studentId;
      
      // Intentar obtener el ID de OneSignal
      let playerId = null;
      try {
        const w = window as any;
        if (w.OneSignal && w.OneSignal.User && w.OneSignal.User.PushSubscription) {
          playerId = w.OneSignal.User.PushSubscription.id;
        }
      } catch (e) {
        console.log("OneSignal not ready", e);
      }

      if (existingStudents && existingStudents.length > 0) {
        studentId = existingStudents[0].id;
        if (playerId) {
          await supabase.from('students').update({ onesignal_player_id: playerId }).eq('id', studentId);
        }
      } else {
        // 2. Si no existe, crearla
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert([
            {
              full_name: formData.fullName,
              email: formData.email,
              mobile: formData.mobile,
              onesignal_player_id: playerId
            }
          ])
          .select('id')
          .single();

        if (insertError) throw insertError;
        studentId = newStudent.id;
      }

      // 3. Crear el registro en la clase
      const { error: regError } = await supabase.from('registrations').insert([
        {
          class_id: selectedClassId || formData.classId,
          student_id: studentId,
          is_committed: true,
          understands_goal: true,
          will_cancel_in_time: true,
          referred_by_email: formData.referredByEmail
        }
      ]);

      if (regError) {
        if (regError.code === '23505') {
          onShowToast?.("Ya tienes un lugar reservado en esta clase.");
          setIsSubmitting(false);
          return;
        }
        throw regError;
      }

      onChangeRegistration?.(formData);
      onShowToast?.("¡Registro realizado con éxito!");
      onNavigate(ScreenId.Confirmada, "push");
    } catch (err) {
      console.error(err);
      onShowToast?.("Hubo un error al registrarte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#1e0f14]/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => onNavigate(ScreenId.Splash, "push_back")}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-wider">Registro de clase</h1>
        <div className="w-9" />
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-6 space-y-6">
        {/* Selected Class Info */}
        <div className="rounded-2xl p-4 bg-[#0a1020]/40 border border-[#00a2ff]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a2ff]/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#00a2ff]">event</span>
            </div>
            <div>
              <p className="text-base font-extrabold text-white">
                {selectedClass?.dateStr} {selectedClass?.timeStr}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-[#00a2ff]" />
                <span className="text-xs text-[#e2bdc6]">{selectedClass?.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Class selector if multiple */}
        {classes && classes.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {classes.filter(c => c.status !== "suspendida").map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassId(c.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedClassId === c.id 
                    ? "bg-[#00a2ff] text-white" 
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {c.dateStr} {c.timeStr}
              </button>
            ))}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-5">
          <p className="text-xs font-black text-[#ffb1c7] uppercase tracking-widest">Tus datos</p>
          
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1.5">Nombre completo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-lg">person</span>
              <input
                type="text"
                required
                className="w-full bg-[#12080c] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/20"
                placeholder="Viridiana López"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1.5">Correo electrónico</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-lg">mail</span>
              <input
                type="email"
                required
                className="w-full bg-[#12080c] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/20"
                placeholder="viri.lopez@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1.5">Teléfono (opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/20 text-lg">call</span>
              <input
                type="tel"
                className="w-full bg-[#12080c] border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/20"
                placeholder="55 1234 5678"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>
          </div>

          {/* WhatsApp opt-in */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
            <input
              type="checkbox"
              className="w-5 h-5 rounded"
              checked={formData.whatsappOptIn ?? true}
              onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
            />
            <span className="text-sm text-white font-semibold">Quiero recibir avisos por WhatsApp 📱</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(255,73,148,0.3)] transition-all text-center ${
            isSubmitting 
              ? 'bg-gray-600 cursor-not-allowed opacity-70' 
              : 'bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:brightness-110 active:scale-[0.97] cursor-pointer'
          }`}
        >
          {isSubmitting ? "PROCESANDO..." : "CONFIRMAR ASISTENCIA 💪"}
        </button>

        <p className="text-[11px] text-center text-white/40 leading-relaxed">
          Recibirás un correo con la confirmación
        </p>
      </form>
    </motion.div>
  );
}

export function ConfirmadaScreen({ onNavigate, onShowToast, classSession, registration }: ClassScreensProps) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00a2ff', '#10b981', '#562ba0']
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center px-6 pt-16 pb-24"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center mb-6"
      >
        <CheckCircle className="w-14 h-14 text-emerald-400" />
      </motion.div>

      <h1 className="text-2xl font-black italic text-white uppercase tracking-tight text-center mb-2">
        ¡Registro exitoso!
      </h1>
      <p className="text-sm text-[#e2bdc6] text-center mb-8">
        Te anotaste para:
      </p>

      {/* Class details card */}
      <div className="w-full max-w-sm rounded-2xl p-5 bg-[#0a1020]/40 border border-emerald-500/20 space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white">
              {classSession?.dateStr} {classSession?.timeStr}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-[#e2bdc6]">{classSession?.location}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#e2bdc6]">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Fecha límite: <strong className="text-white">{classSession?.deadlineStr}</strong></span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed pl-6">
            Te avisaremos si la clase se CONFIRMA o se CANCELA después de las 8:00 PM.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => onNavigate(ScreenId.MisRegistros, "push")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(255,73,148,0.3)] active:scale-[0.97] transition-all cursor-pointer"
        >
          VER MIS REGISTROS
        </button>

        {classSession?.calendarUrl && (
          <button
            onClick={() => window.open(classSession.calendarUrl, '_blank')}
            className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Agendar en mi calendario
          </button>
        )}

        <button
          onClick={() => {
            const refParam = registration?.email ? `?ref=${encodeURIComponent(registration.email)}` : "";
            const shareUrl = `https://stron-registro.vercel.app/${refParam}`;
            const whatsappText = `¡Hola! Ya confirmé mi asistencia a la clase de Strong Nation el ${classSession?.dateStr} a las ${classSession?.timeStr}. ¡Vamos juntas! 💪 ${shareUrl}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
          }}
          className="w-full py-3.5 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          Compartir con una amiga
        </button>
      </div>
    </motion.div>
  );
}

export function ClaseCanceladaIztacalcoScreen({ onNavigate, classSession }: ClassScreensProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center px-6 pt-16 pb-24"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate(ScreenId.Splash, "push_back")}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-black text-rose-300 tracking-wider uppercase">Clase cancelada</span>
        <div className="w-9" />
      </div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-400 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-rose-400" />
      </div>

      <h1 className="text-2xl font-black italic text-white uppercase tracking-tight text-center mb-3">
        Clase cancelada
      </h1>

      <div className="w-full max-w-sm rounded-2xl p-5 bg-rose-950/20 border border-rose-500/20 space-y-4 mb-6 text-center">
        <p className="text-sm text-[#e2bdc6] leading-relaxed">
          Hola, lamentablemente no se alcanzó el mínimo de{" "}
          <strong className="text-white">{classSession?.minRequired || 5} personas</strong>.
        </p>
        <div className="border-t border-white/5 pt-4">
          <p className="text-base font-extrabold text-white">
            {classSession?.dateStr} {classSession?.timeStr}
          </p>
          <p className="text-xs text-[#e2bdc6] mt-1">{classSession?.location}</p>
        </div>
      </div>

      <div className="w-full max-w-sm glass-card rounded-2xl p-4 border border-white/10 mb-6">
        <div className="flex items-start gap-2 text-xs text-[#e2bdc6]">
          <AlertCircle className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Te avisaremos para la próxima clase. ¡No te desanimes!
          </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.Splash, "push")}
        className="w-full max-w-sm py-4 rounded-2xl bg-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 active:scale-[0.97] transition-all cursor-pointer"
      >
        VER PRÓXIMAS CLASES
      </button>
    </motion.div>
  );
}
