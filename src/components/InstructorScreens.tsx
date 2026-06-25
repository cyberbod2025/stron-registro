import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Users, CheckCircle, Clock, X, AlertTriangle, Info, Plus, UserPlus, Share2 } from "lucide-react";
import React, { useState } from "react";
import { formatDisplayDate, getWeekCategory } from "../lib/utils";
import { APP_URL } from "../constants";

interface InstructorProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast?: (message: string) => void;
  classes?: ClassSession[];
  onRefresh?: () => void;
}

export function PanelInstructor({ onNavigate, onShowToast, classes, onRefresh }: InstructorProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [suggestedStudents, setSuggestedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [classTab, setClassTab] = useState<"proximas" | "historial">("proximas");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddPhone, setQuickAddPhone] = useState("");

  const filteredClasses = classes?.filter(c => {
    const isPast = c.status === "finalizada" || (c.startsAt && new Date(c.startsAt) < new Date() && c.status !== "cancelada");
    if (classTab === "proximas") return !isPast;
    return isPast;
  }).sort((a, b) => {
    if (classTab === "historial") {
      return new Date(b.startsAt!).getTime() - new Date(a.startsAt!).getTime();
    }
    return new Date(a.startsAt!).getTime() - new Date(b.startsAt!).getTime();
  }) || [];

  React.useEffect(() => {
    if (filteredClasses && filteredClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [filteredClasses, selectedClassId]);

  const selectedClass = classes?.find(c => c.id === selectedClassId);

  const fetchStudents = async () => {
    if (!selectedClassId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: regsData, error: regError } = await supabase
        .from('registrations')
        .select('*, students(full_name, mobile, whatsapp_opt_in)')
        .eq('class_id', selectedClassId)
        .order('created_at', { ascending: true });

      if (regError) throw regError;

      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClassId);
        
      if (attError) throw attError;

      const attendanceMap = new Map();
      attData?.forEach((a: any) => {
        if (a.student_id) attendanceMap.set(a.student_id, a);
        else attendanceMap.set(a.id, a); // For walk-ins without student_id
      });

      const mapped: any[] = [];
      
      regsData?.forEach((s: any) => {
        const att = attendanceMap.get(s.student_id);
        mapped.push({
          id: s.id, 
          studentId: s.student_id,
          name: s.students?.full_name || "Desconocido",
          phone: s.students?.mobile || "",
          whatsappOptIn: s.students?.whatsapp_opt_in ?? true,
          time: new Date(s.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          attendanceStatus: att ? att.attendance_status : "pendiente",
          isWalkIn: false,
          attendanceId: att ? att.id : null
        });
        if (att) attendanceMap.delete(s.student_id);
      });

      attendanceMap.forEach((att: any) => {
        if (att.was_registered === false || !att.student_id) {
          mapped.push({
            id: att.id,
            studentId: att.student_id,
            name: att.full_name || "Walk-in",
            phone: att.mobile || "",
            whatsappOptIn: false,
            time: new Date(att.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            attendanceStatus: att.attendance_status,
            isWalkIn: true,
            attendanceId: att.id
          });
        }
      });

      mapped.forEach((student: any) => {
        student.isSuspicious = mapped.some(
          (other: any) => 
            other.name.toLowerCase().trim() === student.name.toLowerCase().trim() && 
            other.id !== student.id && !student.isWalkIn && !other.isWalkIn
        );
      });

      setStudents(mapped);

      // Fetch suggested students if pending
      const currentSelected = classes?.find(c => c.id === selectedClassId);
      if (currentSelected && currentSelected.status !== "cancelada" && (currentSelected.minRequired - currentSelected.confirmedCount) > 0) {
        const registeredIds = mapped.map((m: any) => m.studentId).filter(Boolean);
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

  React.useEffect(() => {
    fetchStudents();
  }, [selectedClassId]);

  const handleGenerateNextWeek = async () => {
    if (!classes || classes.length === 0) return;
    try {
      const { supabase } = await import('../lib/supabase');
      const maxDate = new Date(Math.max(...classes.map(c => new Date(c.startsAt!).getTime())));
      
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
      onRefresh?.();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error generando próxima semana");
    }
  };

  const handleCancelClass = async () => {
    if (!selectedClassId) return;
    const reason = window.prompt("Motivo de cancelación (ej. Lluvia, Enfermedad):", "Fuerza mayor");
    if (reason === null) return; 
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.from('classes').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      }).eq('id', selectedClassId);
      if (error) throw error;
      onShowToast?.("Clase cancelada");
      onRefresh?.();
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
      onRefresh?.();
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
      onRefresh?.();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error confirmando clase");
    }
  };

  const handleGenerateReminder = async () => {
    if (!selectedClass) return;
    setIsGeneratingReminder(true);
    try {
      const names = students.map(s => s.name).filter(Boolean);
      const mapsLine = selectedClass.mapsUrl ? `📍 Ubicación:\n${selectedClass.mapsUrl}` : `📍 Sede: ${selectedClass.location}`;
      const studentsList = names.map(n => `✅ ${n}`).join("\n");
      const titleLine = `🔥 ${selectedClass.title || "Strong Nation"}`;
      const dateLine = `📅 ${formatDisplayDate(selectedClass)}`;
      const timeLine = `⏰ ${selectedClass.timeStr || ""}`;
      const deadlineLine = `⏳ Registro cierra: ${selectedClass.deadlineStr || "9:00 p.m."}`;
      const regLine = `📝 Regístrate aquí:\n${APP_URL}`;
      const message = `${titleLine}\n\n${dateLine}\n${timeLine}\n${deadlineLine}\n\nRegistradas (${selectedClass.confirmedCount}):\n${studentsList || "(aún sin registros)"}\n\n${mapsLine}\n\n${regLine}`;
      await navigator.clipboard.writeText(message);
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } catch (err) {
      console.error("Error generating reminder:", err);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const getCancellationMessage = () => {
    if (!selectedClass) return "";
    const dateStr = formatDisplayDate(selectedClass);
    const reason = selectedClass.cancellationReason || "Motivos de fuerza mayor";
    const mapsLine = selectedClass.mapsUrl ? `\n📍 ${selectedClass.mapsUrl}` : "";
    return `Hola, chicas. Les aviso que la clase de Strong Nation del ${dateStr} a las ${selectedClass.timeStr} en ${selectedClass.location} queda cancelada por: ${reason}.${mapsLine}\nUna disculpa por el inconveniente. Gracias por estar al pendiente. 💪`;
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

  const getWhatsAppLink = (phone: string, name: string) => {
    let text = "";
    if (selectedClass?.status === "cancelada") {
       text = getCancellationMessage();
    } else {
       text = `Hola ${name}, te esperamos hoy en la clase de Strong Nation! 💪`;
    }
    const formattedPhone = phone.replace(/\D/g, '');
    const finalPhone = formattedPhone.length === 10 ? `52${formattedPhone}` : formattedPhone;
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
  };

  const getQuorumPushMessage = () => {
    if (!selectedClass) return "";
    const dateStr = formatDisplayDate(selectedClass);
    const missing = selectedClass.minRequired - selectedClass.confirmedCount;
    const mapsLine = selectedClass.mapsUrl ? `\n📍 Ubicación:\n${selectedClass.mapsUrl}` : `\n📍 Sede: ${selectedClass.location}`;
    return `Hola 👋 Solo faltan ${missing} lugares para confirmar la clase de Strong Nation del ${dateStr} a las ${selectedClass.timeStr}.${mapsLine}\n\n📝 Regístrate aquí:\n${APP_URL}\n\n⏳ Cierre: ${selectedClass.deadlineStr || "9:00 p.m."}\nMínimo: ${selectedClass.minRequired} alumnas. 💪`;
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

  const getReminderMessage = () => {
    if (!selectedClass) return "";
    const dateStr = formatDisplayDate(selectedClass);
    const mapsLine = selectedClass.mapsUrl ? `📍 Ubicación:\n${selectedClass.mapsUrl}` : `📍 Sede: ${selectedClass.location}`;
    const studentsList = students.map(s => `✅ ${s.name}`).join("\n");
    return `Chicas 💪💛\n\nRecuerden registrarse para la clase de mañana.\n\n🔥 ${selectedClass.title}\n📅 ${dateStr}\n⏰ ${selectedClass.timeStr}\n⏳ Registro cierra: ${selectedClass.deadlineStr || "9:00 p.m."}\n\nRegistradas hasta ahora (${selectedClass.confirmedCount}):\n${studentsList || "(aún sin registros)"}\n\n${mapsLine}\n\n📝 Regístrate aquí:\n${APP_URL}`;
  };

  const copyReminder = async () => {
    const text = getReminderMessage();
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.("Recordatorio copiado 📋");
    } catch (err) {
      onShowToast?.("No se pudo copiar el recordatorio");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum": return "text-emerald-400";
      case "cancelada": return "text-rose-400";
      default: return "text-amber-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum": return "bg-emerald-500/10 border-emerald-500/30";
      case "cancelada": return "bg-rose-500/10 border-rose-500/30";
      default: return "bg-amber-500/10 border-amber-500/30";
    }
  };

  const handleMarkAttendance = async (student: any, status: 'present' | 'absent') => {
    try {
      const { supabase } = await import('../lib/supabase');
      const payload = {
        class_id: selectedClassId,
        student_id: student.studentId || null,
        full_name: student.name,
        mobile: student.phone,
        attendance_status: status,
        was_registered: !student.isWalkIn,
        marked_by: 'instructor'
      };
      
      let newAttId = student.attendanceId;
      if (student.attendanceId) {
        await supabase.from('attendance').update(payload).eq('id', student.attendanceId);
      } else {
        const { data: newAtt, error } = await supabase.from('attendance').insert([payload]).select('id').single();
        if (error) throw error;
        newAttId = newAtt.id;
      }
      
      onShowToast?.(`Asistencia actualizada: ${student.name}`);
      
      setStudents(prev => prev.map(s => {
        if (s.id === student.id) {
          return { ...s, attendanceStatus: status, attendanceId: newAttId };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
      onShowToast?.("Error al marcar asistencia");
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) return;
    
    try {
      setIsLoading(true);
      const { supabase } = await import('../lib/supabase');
      await supabase.from('attendance').insert([{
        class_id: selectedClassId,
        full_name: quickAddName,
        mobile: quickAddPhone,
        attendance_status: 'present',
        was_registered: false,
        marked_by: 'instructor'
      }]);
      onShowToast?.("Alumna agregada (Walk-in)");
      setShowQuickAdd(false);
      setQuickAddName("");
      setQuickAddPhone("");
      await fetchStudents();
    } catch (err) {
      console.error(err);
      onShowToast?.("Error al agregar alumna");
      setIsLoading(false);
    }
  };

  // Stats
  const totalRegistrations = classes?.reduce((sum, c) => sum + c.confirmedCount, 0) || 0;
  const confirmedClasses = classes?.filter(c => c.status === "confirmada_por_quorum").length || 0;
  const cancelledClasses = classes?.filter(c => c.status === "cancelada").length || 0;
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
        <button 
          onClick={() => onNavigate(ScreenId.RoleSelection, "push_back")}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-[#F20F72] tracking-widest uppercase">Panel del Instructor</p>
          <h1 className="text-lg font-black italic text-white uppercase tracking-tight">Profe Hugo ✌️</h1>
        </div>
      </div>

      {/* Tabs Próximas / Historial */}
      <div className="px-5 mb-4">
        <div className="flex bg-[#12080c] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => { setClassTab("proximas"); setSelectedClassId(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              classTab === "proximas" ? "bg-[#F20F72] text-white shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => { setClassTab("historial"); setSelectedClassId(null); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              classTab === "historial" ? "bg-[#F20F72] text-white shadow-md" : "text-white/80 hover:text-white"
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Class Cards Summary */}
      <div className="px-5 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
          {filteredClasses.length === 0 ? (
            <p className="text-xs text-white/50 italic">No hay clases en esta sección.</p>
          ) : (
            filteredClasses.map((c) => (
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
                  {c.status === "confirmada_por_quorum" ? (c.manual_confirmed ? "CONFIRMADA (MANUAL)" : "CONFIRMADA ✅") : c.status === "cancelada" ? "CANCELADA" : "EN PROGRESO"}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Instructor Actions */}
      <div className="px-5 mb-6">
        <button
          onClick={handleGenerateNextWeek}
          className="w-full py-4 rounded-2xl bg-[#8E2DE2]/10 border border-[#8E2DE2]/30 text-[#8E2DE2] font-black text-xs uppercase tracking-widest hover:bg-[#8E2DE2]/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">event_repeat</span>
          Generar próxima semana
        </button>
      </div>

      {/* Selected Class Detail */}
      {selectedClass && (
        <div className="px-5 mb-6">
          <div className="bg-[#12080c] px-4 py-3 flex items-center justify-between border-b border-white/5 flex-wrap gap-2">
            <span className="text-[10px] text-[#e2bdc6] font-bold uppercase tracking-wider">
              Detalle de asistencia — {formatDisplayDate(selectedClass)} {selectedClass.timeStr}
            </span>
            <div className="flex gap-2">
              {selectedClass.status !== "cancelada" && !selectedClass.manual_confirmed && selectedClass.status !== "confirmada_por_quorum" && (
                <button
                  onClick={handleManualConfirm}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase tracking-wider hover:bg-blue-500/30 transition-all cursor-pointer"
                >
                  Confirmar clase manualmente
                </button>
              )}
              {selectedClass.status === "cancelada" ? (
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

          {/* Smart Reminder Button */}
          {selectedClass.status !== "cancelada" && selectedClass.status !== "finalizada" && (
            <div className="glass-panel mx-4 mb-4 p-4 border border-emerald-500/20">
              <button
                onClick={handleGenerateReminder}
                disabled={isGeneratingReminder}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                {isGeneratingReminder ? "Generando..." : "GENERAR RECORDATORIO AUTOMÁTICO"}
              </button>
            </div>
          )}

          {/* Cancellation Notice Section */}
          {selectedClass.status === "cancelada" && students.length > 0 && (
            <div className="glass-panel mx-4 mb-6 p-4 border border-rose-500/20">
              <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Avisos de cancelación
              </h3>
              <p className="text-[10px] text-rose-200/90 mb-3 italic">
                "{getCancellationMessage()}"
              </p>
              <button
                onClick={copyCancellationMessage}
                className="w-full mb-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all cursor-pointer text-center"
              >
                Copiar mensaje general
              </button>
            </div>
          )}

          {/* Registration List */}
          <div className="bg-[#12080c] p-4 flex flex-col gap-3 min-h-[200px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-[#F20F72] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[#e2bdc6] mt-4 font-bold uppercase tracking-widest animate-pulse">Cargando alumnas...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Users className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-xs text-[#e2bdc6] font-bold uppercase tracking-widest text-center">Aún no hay registros</p>
              </div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="flex flex-col gap-2 p-3 rounded-xl bg-[#0a1020]/50 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F20F72]/20 to-[#8E2DE2]/20 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-black text-white">{student.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{student.name}</p>
                          {student.isSuspicious && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                              <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wider">Mismo nombre</span>
                            </span>
                          )}
                          {student.isWalkIn && (
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                              <span className="text-[8px] text-indigo-300 font-bold uppercase tracking-wider">Asistencia rápida (Walk-in)</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/50">{student.phone || "Sin teléfono"}</p>
                      </div>
                    </div>
                    {student.phone && (
                      <a
                        href={getWhatsAppLink(student.phone, student.name)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[#25D366] text-sm">chat</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Attendance Controls */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleMarkAttendance(student, 'present')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        student.attendanceStatus === 'present'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      Presente ✅
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(student, 'absent')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        student.attendanceStatus === 'absent'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/5 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      Faltó ❌
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Quick Add Button */}
            {!isLoading && selectedClass.status !== "cancelada" && (
              <div className="mt-2">
                {!showQuickAdd ? (
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Agregar Asistencia Rápida (Walk-in)
                  </button>
                ) : (
                  <form onSubmit={handleQuickAdd} className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-2">Asistencia sin registro previo</p>
                    <input
                      type="text"
                      placeholder="Nombre de la alumna"
                      value={quickAddName}
                      onChange={e => setQuickAddName(e.target.value)}
                      required
                      className="w-full bg-[#030712]/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono (Opcional)"
                      value={quickAddPhone}
                      onChange={e => setQuickAddPhone(e.target.value)}
                      className="w-full bg-[#030712]/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickAdd(false)}
                        className="flex-1 py-2 rounded-lg bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Quorum Push Section */}
          {selectedClass.status !== "cancelada" && (selectedClass.minRequired - selectedClass.confirmedCount) > 0 && suggestedStudents.length > 0 && (
            <div className="bg-[#12080c] border-t border-white/5 p-4 rounded-b-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-400">group_add</span>
                <div>
                  <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">Empujón de quórum</h3>
                  <p className="text-[10px] text-amber-200/70">Faltan {selectedClass.minRequired - selectedClass.confirmedCount} lugares</p>
                </div>
              </div>

              <div className="space-y-2">
                {suggestedStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <p className="text-xs text-white font-bold">{student.full_name}</p>
                    <a
                      href={getQuorumWhatsAppLink(student.mobile)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-wider"
                    >
                      Invitar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Section */}
          {selectedClass.status !== "cancelada" && selectedClass.status !== "finalizada" && students.length > 0 && (
            <div className="bg-[#12080c] border-t border-white/5 p-4 rounded-b-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-[#C93CFF]" />
                <div>
                  <h3 className="text-xs font-black text-[#C93CFF] uppercase tracking-widest">Recordatorio pre-cierre</h3>
                  <p className="text-[10px] text-[#C93CFF]/70">{selectedClass.confirmedCount} registrada(s) — cierre: {selectedClass.deadlineStr || "9:00 p.m."}</p>
                </div>
              </div>
              <p className="text-[10px] text-white/70 mb-3 italic leading-relaxed bg-white/5 p-3 rounded-xl">
                "{getReminderMessage()}"
              </p>
              <button
                onClick={copyReminder}
                className="w-full px-3 py-2.5 rounded-xl bg-[#C93CFF]/15 border border-[#C93CFF]/30 text-white font-black text-[10px] uppercase tracking-wider hover:bg-[#C93CFF]/25 transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Share2 className="w-3 h-3" />
                Copiar recordatorio
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
