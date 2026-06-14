import { ScreenId, TransitionType, ClassRegistration, ClassSession } from "../types";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, CheckCircle, ArrowLeft, Users, ShieldAlert, Sparkles, MessageCircle, Share2, Map, AlertTriangle, AlertCircle, Bell } from "lucide-react";
import React, { useState, useEffect } from "react";
import { generateGoogleCalendarUrl } from "../lib/calendar";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";
import { useOneSignal } from "../hooks/useOneSignal";
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
    whatsappOptIn: registration?.whatsappOptIn ?? true,
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
      
      // 1. Buscar si la alumna ya existe (por email o teléfono)
      const { data: existingStudents, error: searchError } = await supabase
        .from('students')
        .select('id')
        .or(`email.eq.${formData.email},mobile.eq.${formData.mobile}`)
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
        const updateData: any = { whatsapp_opt_in: formData.whatsappOptIn };
        if (playerId) {
          updateData.onesignal_player_id = playerId;
        }
        await supabase.from('students').update(updateData).eq('id', studentId);
      } else {
        // 2. Si no existe, crearla
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert([
            {
              full_name: formData.fullName,
              email: formData.email,
              mobile: formData.mobile,
              whatsapp_opt_in: formData.whatsappOptIn,
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
        {/* Class Selection UI grouped by Week */}
        {classes && classes.length > 0 && (
          <div className="space-y-6">
            {["esta_semana", "proxima_semana"].map((weekCategory) => {
              const weekClasses = classes.filter(
                c => c.status !== "suspendida" && getWeekCategory(c.startsAt) === weekCategory
              );
              
              if (weekClasses.length === 0) return null;

              return (
                <div key={weekCategory} className="space-y-3">
                  <p className="text-xs font-black text-[#ffb1c7] uppercase tracking-widest pl-1">
                    {weekCategory === "esta_semana" ? "Esta semana" : "Próxima semana"}
                  </p>
                  <div className="space-y-2.5">
                    {weekClasses.map(c => {
                      const isSelected = selectedClassId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedClassId(c.id)}
                          className={`w-full text-left rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden ${
                            isSelected 
                              ? "bg-[#0a1020]/80 border-2 border-[#00a2ff] shadow-[0_0_15px_rgba(0,162,255,0.2)]" 
                              : "bg-[#0a1020]/40 border-2 border-transparent border-t-white/5 border-l-white/5 hover:bg-[#0a1020]/60"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-4 right-4 text-[#00a2ff]">
                              <CheckCircle className="w-5 h-5 fill-[#00a2ff]/20" />
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected ? "bg-[#00a2ff]/20 text-[#00a2ff]" : "bg-white/5 text-white/40"
                            }`}>
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="pr-8">
                              <p className={`text-base font-extrabold ${isSelected ? "text-white" : "text-white/80"}`}>
                                {formatDisplayDate(c)} <span className="text-white/50 font-medium">| {c.timeStr}</span>
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <MapPin className={`w-3 h-3 ${isSelected ? "text-[#00a2ff]" : "text-white/30"}`} />
                                <span className={`text-xs ${isSelected ? "text-[#e2bdc6]" : "text-white/50"}`}>{c.location}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
                placeholder="Tu nombre completo"
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
                placeholder="tu.correo@ejemplo.com"
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
          <div>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20">
              <input
                type="checkbox"
                className="w-5 h-5 rounded"
                checked={formData.whatsappOptIn}
                onChange={(e) => setFormData({ ...formData, whatsappOptIn: e.target.checked })}
              />
              <span className="text-sm text-white font-semibold">Quiero recibir avisos por WhatsApp 📱</span>
            </label>
            <p className="mt-1.5 ml-2 text-[10px] text-white/40 italic">
              Usaremos tu número solo para avisarte cambios importantes de tu clase.
            </p>
          </div>
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

export function ConfirmadaScreen({ onNavigate, classSession, registration, onShowToast }: ClassScreensProps) {
  const { status, requestPermission, debugInfo } = useOneSignal();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelRegistration = async () => {
    if (!confirm("¿Estás segura de que deseas cancelar tu asistencia a esta clase?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const { supabase } = await import('../lib/supabase');
      
      // Get student ID
      const { data: students, error: searchError } = await supabase
        .from('students')
        .select('id')
        .or(`email.eq.${registration?.email},mobile.eq.${registration?.mobile}`)
        .limit(1);

      if (searchError) throw searchError;
      
      if (students && students.length > 0) {
        const studentId = students[0].id;
        
        // Delete registration
        const { error: deleteError } = await supabase
          .from('registrations')
          .delete()
          .match({ class_id: classSession?.id, student_id: studentId });

        if (deleteError) throw deleteError;

        onShowToast?.("Tu asistencia ha sido cancelada.");
        onNavigate(ScreenId.MisRegistros, "push_back");
      } else {
        onShowToast?.("No se pudo encontrar tu registro.");
      }
    } catch (e) {
      console.error(e);
      onShowToast?.("Hubo un error al cancelar tu asistencia.");
    } finally {
      setIsCancelling(false);
    }
  };
  
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
              {formatDisplayDate(classSession)} {classSession?.timeStr}
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

        {/* Ubicación */}
        {classSession?.mapsUrl && (
          <button
            onClick={() => window.open(classSession.mapsUrl, '_blank')}
            className="w-full py-3.5 rounded-2xl bg-[#0a1020]/40 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:bg-emerald-500/10 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            Abrir ubicación en Maps
          </button>
        )}

        <button
          onClick={() => {
            const calUrl = classSession?.calendarUrl || generateGoogleCalendarUrl(
              classSession?.title || "",
              formatDisplayDate(classSession) || "",
              classSession?.timeStr || "",
              classSession?.location || "",
              "Regla de cierre: Te avisaremos si la clase se CONFIRMA o se CANCELA a las 8:00 PM.\nQuórum mínimo: 3 personas."
            );
            window.open(calUrl, '_blank');
          }}
          className="w-full py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          Agendar en mi calendario
        </button>

        <button
          onClick={async () => {
            const refParam = registration?.email ? `?ref=${encodeURIComponent(registration.email)}` : "";
            const shareUrl = `https://stron-registro.vercel.app/${refParam}`;
            const whatsappText = `¡Hola! Ya confirmé mi asistencia a la clase de Strong Nation el ${formatDisplayDate(classSession)} a las ${classSession?.timeStr}. ¡Vamos juntas! 💪 ${shareUrl}`;
            
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'Clase Strong Nation',
                  text: whatsappText,
                });
                return;
              } catch (e) {
                console.log("Share API error or cancelled", e);
              }
            }
            
            // Fallback a wa.me
            const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
            try {
              window.open(waUrl, '_blank');
            } catch (e) {
              // Fallback a clipboard
              try {
                await navigator.clipboard.writeText(whatsappText);
                onShowToast?.("Enlace copiado al portapapeles");
              } catch (clipErr) {
                onShowToast?.("No se pudo compartir");
              }
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-white font-bold text-xs uppercase tracking-widest hover:bg-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#25D366]" />
          Compartir con una amiga
        </button>

        <button
          onClick={handleCancelRegistration}
          disabled={isCancelling}
          className="w-full py-3.5 rounded-2xl bg-transparent border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-widest hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isCancelling ? (
            <span className="animate-pulse">Cancelando...</span>
          ) : (
            <>Cancelar asistencia</>
          )}
        </button>

        {status === "unsubscribed" && (
          <button
            onClick={requestPermission}
            className="w-full py-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest hover:bg-amber-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            Activar recordatorios
          </button>
        )}
        {status === "loading" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-center mt-2">
            <p className="text-[11px] text-white/50 leading-relaxed animate-pulse">
              Verificando estado de recordatorios...
            </p>
          </div>
        )}

        {status === "subscribed" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 text-center mt-2 flex items-center justify-center gap-2">
            <Bell className="w-4 h-4 text-[#25D366]" />
            <p className="text-[11px] text-[#25D366] font-bold uppercase tracking-wider">
              Recordatorios activados
            </p>
          </div>
        )}

        {status === "unconfigured" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-center mt-2">
            <p className="text-[11px] text-white/50 leading-relaxed">
              Recordatorios no configurados. Falta configurar OneSignal.
            </p>
          </div>
        )}

        {status === "unsupported" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-center mt-2">
            <p className="text-[11px] text-white/50 leading-relaxed">
              Este navegador o dispositivo no permite recordatorios push.
            </p>
          </div>
        )}

        {status === "blocked" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center mt-2">
            <p className="text-[11px] text-rose-400/80 leading-relaxed">
              Permiso bloqueado. Activa notificaciones desde la configuración del navegador.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="w-full py-3 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left mt-2">
            <p className="text-[11px] text-rose-400 font-bold mb-2 uppercase tracking-wider">
              Diagnóstico recordatorios:
            </p>
            <div className="text-[10px] text-rose-300/80 space-y-1 font-mono break-all">
              <p>Estado: {status}</p>
              <p>App ID: {debugInfo?.appIdDetected ? 'detectado' : 'no detectado'} / longitud {debugInfo?.appIdLength}</p>
              <p>Notification API: {debugInfo?.notificationApi ? 'sí' : 'no'}</p>
              <p>Permiso navegador: {debugInfo?.notificationPermission}</p>
              <p>Service Worker: {debugInfo?.serviceWorker ? 'sí' : 'no'}</p>
              <p>OneSignal SDK: {debugInfo?.oneSignalSdk ? 'cargado' : 'no cargado'}</p>
              <p>Error: {debugInfo?.errorMessage || 'Desconocido'}</p>
            </div>
          </div>
        )}
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
        <div className="text-center space-y-1">
          <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Clase Cancelada</p>
          <p className="text-white text-sm font-black">
            {formatDisplayDate(classSession)} {classSession?.timeStr}
          </p>
        </div>
        <p className="text-xs text-[#e2bdc6] mt-1">{classSession?.location}</p>
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
