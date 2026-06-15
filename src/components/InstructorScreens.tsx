import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Users, CheckCircle, Clock, X, AlertTriangle, Info } from "lucide-react";
import React, { useState } from "react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";

interface InstructorProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast?: (message: string) => void;
  classes?: ClassSession[];
}

export function PanelInstructor({ onNavigate, onShowToast, classes }: InstructorProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [suggestedStudents, setSuggestedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Set initial selected class
  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes]);

  const selectedClass = classes?.find(c => c.id === selectedClassId);

  React.useEffect(() => {
    if (!selectedClassId) {
      setIsLoading(false);
      return;
    }
    
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('registrations')
          .select('*, students(full_name, mobile, whatsapp_opt_in)')
          .eq('class_id', selectedClassId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const mapped = data.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          name: s.students?.full_name || "Desconocido",
          status: s.attended ? "Asistió" : (s.absent ? "No Asistió" : "Confirmada"),
          phone: s.students?.mobile || "",
          whatsappOptIn: s.students?.whatsapp_opt_in ?? true,
          time: new Date(s.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        }));

        mapped.forEach((student: any) => {
          student.isSuspicious = mapped.some(
            (other: any) => 
              other.name.toLowerCase().trim() === student.name.toLowerCase().trim() && 
              other.studentId !== student.studentId
          );
        });

        setStudents(mapped);

        // Fetch suggested students if pending
        const currentSelected = classes?.find(c => c.id === selectedClassId);
        if (currentSelected && currentSelected.status !== "suspendida" && (currentSelected.minRequired - currentSelected.confirmedCount) > 0) {
          const registeredIds = mapped.map((m: any) => m.studentId);
          const { data: allOpts } = await supabase
            .from('students')
            .select('id, full_name, mobile')
            .eq('whatsapp_opt_in', true)
            .neq('mobile', '');

          if (allOpts) {
            const uniquePhones = new Set();
            const suggestions = allOpts.filter((opt: any) => {
              if (registeredIds.includes(opt.id)) return false;
              if (uniquePhones.has(opt.mobile)) return false;
              uniquePhones.add(opt.mobile);
              return true;
            });
            setSuggestedStudents(suggestions);
          }
        } else {
          setSuggestedStudents([]);
        }
      } catch (err) {
        console.error(err);
        onShowToast?.("Error al cargar alumnas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  const handleMarkAttendance = async (id: string, name: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('registrations')
        .update({ attended: true, absent: false })
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.map(s => s.id === id ? { ...s, status: "Asistió" } : s));
      onShowToast?.(`${name} marcada como Asistió.`);
    } catch (err) {
      console.error(err);
      onShowToast?.("Error al marcar asistencia.");
    }
  };

  const handleMarkAbsent = async (id: string, name: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('registrations')
        .update({ attended: false, absent: true })
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.map(s => s.id === id ? { ...s, status: "No Asistió" } : s));
      onShowToast?.(`${name} marcada como No Asistió.`);
    } catch (err) {
      console.error(err);
      onShowToast?.("Error al marcar inasistencia.");
    }
  };

  const handleGenerateNextWeek = async () => {
    if (!classes || classes.length === 0) return;
    try {
      const { supabase } = await import('../lib/supabase');
      // Find maximum starts_at currently in DB
      const validStarts = classes.map(c => c.startsAt ? new Date(c.startsAt).getTime() : 0).filter(t => t > 0);
      if (validStarts.length === 0) return;
      
      const maxTime = Math.max(...validStarts);
      const maxDate = new Date(maxTime);
      
      // Get all classes that are within 6 days of the max date (so we clone the last week)
      const latestWeekClasses = classes.filter(c => {
        if (!c.startsAt) return false;
        const d = new Date(c.startsAt);
        const diffDays = Math.abs((d.getTime() - maxDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 6; 
      });

      const newClasses = latestWeekClasses.map(c => {
        const newDate = new Date(c.startsAt!);
        newDate.setDate(newDate.getDate() + 7);
        return {
          title: c.title,
          date_str: c.dateStr,
          time_str: c.timeStr,
          location: c.location,
          address: c.address,
          is_private_location: c.isPrivateLocation,
          status: 'scheduled',
          min_required: c.minRequired,
          deadline_str: c.deadlineStr,
          maps_url: c.mapsUrl,
          waze_url: c.wazeUrl,
          calendar_url: c.calendarUrl,
          starts_at: newDate.toISOString()
        };
      });

      if (newClasses.length === 0) return;

      const { error } = await supabase.from('classes').insert(newClasses);
      if (error) throw error;
      onShowToast?.("Próxima semana generada con éxito");
      window.location.reload();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error generando próxima semana");
    }
  };

  const handleCancelClass = async () => {
    if (!selectedClassId) return;
    const reason = window.prompt("Motivo de cancelación (ej. Lluvia, Enfermedad):", "Fuerza mayor");
    if (reason === null) return; // User cancelled prompt
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('classes').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      }).eq('id', selectedClassId);
      if (error) throw error;
      onShowToast?.("Clase cancelada");
      window.location.reload();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error cancelando clase");
    }
  };

  const handleReactivateClass = async () => {
    if (!selectedClassId) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('classes').update({
        status: 'scheduled',
        cancelled_at: null,
        cancellation_reason: null
      }).eq('id', selectedClassId);
      if (error) throw error;
      onShowToast?.("Clase reactivada");
      window.location.reload();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error reactivando clase");
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedClassId) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('classes').update({
        manual_confirmed: true,
        confirmation_source: 'manual',
        confirmed_at: new Date().toISOString(),
        confirmed_by: 'instructor'
      }).eq('id', selectedClassId);
      if (error) throw error;
      onShowToast?.("Clase confirmada manualmente");
      window.location.reload();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error confirmando clase");
    }
  };

  const getCancellationMessage = () => {
    if (!selectedClass) return "";
    const dateStr = formatDisplayDate(selectedClass);
    const reason = selectedClass.cancellationReason || "Motivos de fuerza mayor";
    return `Hola, chicas. Les aviso que la clase de Strong Nation del ${dateStr} a las ${selectedClass.timeStr} en ${selectedClass.location} queda cancelada por: ${reason}. Una disculpa por el inconveniente. Gracias por estar al pendiente. 💪`;
  };

  const copyCancellationMessage = async () => {
    const text = getCancellationMessage();
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.("Mensaje de cancelación copiado 📋");
    } catch (err) {
      onShowToast?.("No se pudo copiar el mensaje");
    }
  };

  const getWhatsAppLink = (phone: string) => {
    const text = encodeURIComponent(getCancellationMessage());
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `52${formattedPhone}` : formattedPhone;
    return `https://wa.me/${finalPhone}?text=${text}`;
  };

  const getQuorumPushMessage = () => {
    if (!selectedClass) return "";
    const dateStr = formatDisplayDate(selectedClass);
    const missing = selectedClass.minRequired - selectedClass.confirmedCount;
    return `Hola 👋 Solo faltan ${missing} lugares para confirmar la clase de Strong Nation del ${dateStr} a las ${selectedClass.timeStr} en ${selectedClass.location}.\n\nSi te animas, regístrate aquí:\nhttps://stron-registro.vercel.app\n\nLa clase se confirma con mínimo ${selectedClass.minRequired} alumnas. 💪`;
  };

  const copyQuorumPushMessage = async () => {
    const text = getQuorumPushMessage();
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.("Mensaje de empujón copiado 📋");
    } catch (err) {
      onShowToast?.("No se pudo copiar el mensaje");
    }
  };

  const getQuorumWhatsAppLink = (phone: string) => {
    const text = encodeURIComponent(getQuorumPushMessage());
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `52${formattedPhone}` : formattedPhone;
    return `https://wa.me/${finalPhone}?text=${text}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada": return "text-emerald-400";
      case "suspendida": return "text-rose-400";
      default: return "text-amber-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "confirmada": return "bg-emerald-500/10 border-emerald-500/30";
      case "suspendida": return "bg-rose-500/10 border-rose-500/30";
      default: return "bg-amber-500/10 border-amber-500/30";
    }
  };

  // Stats
  const totalRegistrations = classes?.reduce((sum, c) => sum + c.confirmedCount, 0) || 0;
  const confirmedClasses = classes?.filter(c => c.status === "confirmada").length || 0;
  const cancelledClasses = classes?.filter(c => c.status === "suspendida").length || 0;
  const totalClasses = classes?.length || 0;
  const attendanceRate = totalClasses > 0 ? Math.round((confirmedClasses / totalClasses) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-[#F20F72] tracking-widest uppercase">Panel del Instructor</p>
          <h1 className="text-lg font-black italic text-white uppercase tracking-tight">Profe Hugo ✌️</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F20F72] to-[#8E2DE2] flex items-center justify-center">
          <span className="text-sm font-black text-white">H</span>
        </div>
      </div>

      {/* Class Cards Summary */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-black text-[#C93CFF] uppercase tracking-widest mb-3">Tus próximas clases</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
          {classes?.filter(c => getWeekCategory(c.startsAt) !== "otro").map((c) => (
            <motion.button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`shrink-0 w-32 rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedClassId === c.id
                  ? "border-[#F20F72]/50 bg-[#F20F72]/10"
                  : "border-white/5 bg-[#0a1020]/30"
              }`}
            >
              <p className="text-[10px] font-bold text-[#e2bdc6] truncate">{formatDisplayDate(c)} {c.timeStr}</p>
              <p className="text-white text-xs font-black truncate">{c.location}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-black text-white leading-none">
                  {c.confirmedCount}<span className="text-sm text-white/40">/{c.minRequired}</span>
                </span>
              </div>
              <div className={`mt-2 flex items-center justify-center w-full px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getStatusBg(c.status)} ${getStatusColor(c.status)}`}>
                {c.status === "confirmada" ? (c.manual_confirmed ? "CONFIRMADA (MANUAL)" : "CONFIRMADA ✅") : c.status === "suspendida" ? "CANCELADA" : "EN PROGRESO"}
              </div>
              <div className="mt-2 text-[9px] font-bold text-center text-[#C93CFF] bg-[#C93CFF]/10 py-1 rounded-md uppercase">
                Ver registradas
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructor Actions */}
      <div className="px-5 mb-6">
        <button
          onClick={() => onShowToast?.("Mensaje de recordatorio preparado 📋")}
          className="w-full py-4 rounded-2xl bg-[#F20F72]/10 border border-[#F20F72]/30 text-[#F20F72] font-black text-xs uppercase tracking-widest hover:bg-[#F20F72]/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mb-3"
        >
          <span className="material-symbols-outlined text-lg">campaign</span>
          Preparar recordatorio
        </button>

        <button
          onClick={handleGenerateNextWeek}
          className="w-full py-4 rounded-2xl bg-[#8E2DE2]/10 border border-[#8E2DE2]/30 text-[#8E2DE2] font-black text-xs uppercase tracking-widest hover:bg-[#8E2DE2]/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">event_repeat</span>
          Generar próxima semana
        </button>
      </div>

      {/* Declarative Warning */}
      <div className="px-5 mb-6">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 flex gap-3 items-start">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-200/70 leading-relaxed">
            <strong>Identidad V1 (Declarativa):</strong> Las alumnas se registran libremente con su email y teléfono. El sistema no verifica identidad real (OTP/Passwords). Un ícono ⚠️ indica un posible registro duplicado o sospechoso (mismo nombre, diferente correo/teléfono).
          </p>
        </div>
      </div>

      {/* Selected Class Detail */}
      {selectedClass && (
        <div className="px-5 mb-6">
          <div className="bg-[#12080c] px-4 py-3 flex items-center justify-between border-b border-white/5 flex-wrap gap-2">
            <span className="text-[10px] text-[#e2bdc6] font-bold uppercase tracking-wider">
              Detalle de registros — {formatDisplayDate(selectedClass)} {selectedClass.timeStr}
            </span>
            <div className="flex gap-2">
              {selectedClass.status !== "suspendida" && !selectedClass.manual_confirmed && selectedClass.status !== "confirmada" && (
                <button
                  onClick={handleManualConfirm}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-blue-500/30 transition-all cursor-pointer"
                >
                  Confirmar clase manualmente
                </button>
              )}
              {selectedClass.status === "suspendida" ? (
                <button
                  onClick={handleReactivateClass}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-all cursor-pointer"
                >
                  Reactivar Sesión
                </button>
              ) : (
                <button
                  onClick={handleCancelClass}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-rose-500/30 transition-all cursor-pointer"
                >
                  Cancelar Sesión
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Notice Section */}
          {selectedClass.status === "suspendida" && students.length > 0 && (
            <div className="glass-panel mx-4 mb-6 p-4 border border-rose-500/20">
              <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Avisar a alumnas registradas
              </h3>
              <p className="text-[10px] text-rose-200/90 mb-3 italic">
                "{getCancellationMessage()}"
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyCancellationMessage}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer flex-1 text-center"
                >
                  Copiar mensaje general
                </button>
              </div>
              {!students.some(s => s.phone) && (
                <p className="mt-3 text-[10px] text-amber-200/70 italic">
                  No hay teléfonos disponibles para esta sesión.
                </p>
              )}
            </div>
          )}

          {/* Quorum Push Section */}
          {selectedClass.status !== "suspendida" && (selectedClass.minRequired - selectedClass.confirmedCount) > 0 && (
            <div className="glass-panel mx-4 mb-6 p-4 border border-[#8E2DE2]/30 shadow-[0_0_20px_rgba(142,45,226,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-[#8E2DE2] uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group_add</span>
                  Empujón de quórum
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-wider border border-purple-500/30">
                  Faltan {selectedClass.minRequired - selectedClass.confirmedCount} para confirmar
                </span>
              </div>
              <p className="text-[10px] text-purple-200/90 mb-3 italic">
                "{getQuorumPushMessage()}"
              </p>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={copyQuorumPushMessage}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer flex-1 text-center"
                >
                  Copiar mensaje de empujón
                </button>
              </div>
              
              {/* Suggested Students List */}
              {suggestedStudents.length > 0 ? (
                <div className="mt-4">
                  <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest mb-2">Alumnas Sugeridas</p>
                  <div className="space-y-1">
                    {suggestedStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                        <span className="text-[10px] text-white font-bold truncate pr-2">{student.full_name}</span>
                        <a
                          href={getQuorumWhatsAppLink(student.mobile)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-purple-500/20 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          WA
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[10px] text-amber-200/70 italic">
                  No hay alumnas sugeridas disponibles en este momento.
                </p>
              )}
            </div>
          )}

          {/* Students Table */}
          <div className="glass-panel mx-4 mb-6 rounded-2xl overflow-hidden border border-white/10">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#030712]/80 px-4 py-2 text-[9px] font-bold text-white/80 uppercase tracking-wider">
              <span className="col-span-4">Alumna</span>
              <span className="col-span-2">Hora</span>
              <span className="col-span-3">Registro</span>
              <span className="col-span-3 text-right">Acción</span>
            </div>

            {/* Table Rows */}
            {isLoading ? (
              <div className="p-6 text-center">
                <span className="text-xs text-white/30">Cargando alumnas...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-6 text-center">
                <span className="text-xs text-white/30 italic">Aún no hay alumnas confirmadas</span>
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.id}
                  className={`grid grid-cols-12 items-center px-4 py-3 text-xs border-t border-white/5 ${
                    index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                  }`}
                >
                  <div className="col-span-4 flex items-center gap-1.5">
                    <p className="font-bold text-white truncate text-[11px]">{student.name}</p>
                    {student.isSuspicious && (
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" title="Posible duplicado. Mismo nombre, diferente correo/teléfono." />
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/80 text-[10px] font-mono">{student.time}</p>
                  </div>
                  <div className="col-span-3">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      student.status === "Asistió"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : student.status === "No Asistió"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-[#F20F72]/15 text-[#F20F72] border border-[#F20F72]/30"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-1">
                    {selectedClass.status === "suspendida" ? (
                      student.phone ? (
                        student.whatsappOptIn ? (
                          <a
                            href={getWhatsAppLink(student.phone)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[12px]">chat</span>
                            WA
                          </a>
                        ) : (
                          <span className="text-[8px] text-rose-300/60 italic uppercase text-right leading-tight">No autorizó<br/>WhatsApp</span>
                        )
                      ) : (
                        <span className="text-[9px] text-white/30 italic uppercase">Sin Tel.</span>
                      )
                    ) : (
                      <>
                        <button
                          disabled={student.status === "Asistió"}
                          onClick={() => handleMarkAttendance(student.id, student.name)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            student.status === "Asistió"
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-emerald-400/50 bg-emerald-500/5 hover:bg-emerald-500/20 hover:text-emerald-400"
                          }`}
                          title="Marcar Asistencia"
                        >
                          {student.status === "Asistió" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="material-symbols-outlined text-base">how_to_reg</span>
                          )}
                        </button>
                        <button
                          disabled={student.status === "No Asistió"}
                          onClick={() => handleMarkAbsent(student.id, student.name)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            student.status === "No Asistió"
                              ? "text-rose-400 bg-rose-500/10"
                              : "text-rose-400/50 bg-rose-500/5 hover:bg-rose-500/20 hover:text-rose-400"
                          }`}
                          title="Marcar Falta"
                        >
                          {student.status === "No Asistió" ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <span className="material-symbols-outlined text-base">person_off</span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Statistics Panel */}
      <div className="px-5">
        <h2 className="text-xs font-black text-white uppercase tracking-widest mb-3">Estadísticas</h2>
        <div className="rounded-2xl p-5 glass-card">
          {/* Circular Chart Placeholder */}
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-white/5" fill="transparent" strokeWidth="3" r="15.9" cx="18" cy="18" />
                <circle 
                  className="stroke-[#F20F72]" 
                  fill="transparent" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeDasharray={`${attendanceRate}, 100`}
                  r="15.9" cx="18" cy="18" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{totalRegistrations}</span>
                <span className="text-[7px] font-bold text-white/40 uppercase">Registros</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="text-[11px] text-[#e2bdc6]">Clases confirmadas</span>
                </div>
                <span className="text-sm font-black text-white">{confirmedClasses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <span className="text-[11px] text-[#e2bdc6]">Clases canceladas</span>
                </div>
                <span className="text-sm font-black text-white">{cancelledClasses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F20F72]"></div>
                  <span className="text-[11px] text-[#e2bdc6]">Asistencia promedio</span>
                </div>
                <span className="text-sm font-black text-white">{attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
