import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Users, CheckCircle, Clock, X } from "lucide-react";
import React, { useState } from "react";

interface InstructorProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast?: (message: string) => void;
  classes?: ClassSession[];
}

export function PanelInstructor({ onNavigate, onShowToast, classes }: InstructorProps) {
  const [students, setStudents] = useState<any[]>([]);
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
          .select('*, students(full_name, mobile)')
          .eq('class_id', selectedClassId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.students?.full_name || "Desconocido",
          status: s.attended ? "Asistió" : (s.absent ? "No Asistió" : "Confirmada"),
          phone: s.students?.mobile || "",
          time: new Date(s.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        }));
        setStudents(mapped);
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
          <p className="text-[10px] font-black text-[#00a2ff] tracking-widest uppercase">Panel del Instructor</p>
          <h1 className="text-lg font-black italic text-white uppercase tracking-tight">Profe Hugo ✌️</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a2ff] to-[#00e5ff] flex items-center justify-center">
          <span className="text-sm font-black text-white">H</span>
        </div>
      </div>

      {/* Class Cards Summary */}
      <div className="px-5 mb-6">
        <h2 className="text-xs font-black text-white uppercase tracking-widest mb-3">Resumen de clases</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {classes?.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`shrink-0 w-32 rounded-2xl p-4 border transition-all cursor-pointer ${
                selectedClassId === c.id
                  ? "border-[#00a2ff]/50 bg-[#00a2ff]/10"
                  : "border-white/5 bg-[#0a1020]/30"
              }`}
            >
              <p className="text-[10px] font-bold text-[#e2bdc6] truncate">{c.dateStr} {c.timeStr}</p>
              <p className="text-[9px] text-white/40 truncate">{c.location}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-black text-white leading-none">
                  {c.confirmedCount}<span className="text-sm text-white/40">/{c.minRequired}</span>
                </span>
              </div>
              <div className={`mt-2 inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${getStatusBg(c.status)} ${getStatusColor(c.status)}`}>
                {c.status === "confirmada" ? "CONFIRMADA ✅" : c.status === "suspendida" ? "CANCELADA" : "EN PROGRESO"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Instructor Actions */}
      <div className="px-5 mb-6">
        <button
          onClick={() => onShowToast?.("Mensaje de recordatorio preparado 📋")}
          className="w-full py-4 rounded-2xl bg-[#00a2ff]/10 border border-[#00a2ff]/30 text-[#00a2ff] font-black text-xs uppercase tracking-widest hover:bg-[#00a2ff]/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">campaign</span>
          Preparar recordatorio
        </button>
      </div>

      {/* Selected Class Detail */}
      {selectedClass && (
        <div className="px-5 mb-6">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-3">
            Detalle de registros — {selectedClass.dateStr} {selectedClass.timeStr}
          </h2>

          {/* Students Table */}
          <div className="rounded-2xl overflow-hidden border border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[#12080c] px-4 py-2 text-[9px] font-bold text-white/40 uppercase tracking-wider">
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
                  <div className="col-span-4">
                    <p className="font-bold text-white truncate text-[11px]">{student.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40 text-[10px] font-mono">{student.time}</p>
                  </div>
                  <div className="col-span-3">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      student.status === "Asistió"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : student.status === "No Asistió"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        : "bg-[#00a2ff]/15 text-[#00a2ff] border border-[#00a2ff]/30"
                    }`}>
                      {student.status}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-1">
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
        <div className="rounded-2xl p-5 bg-[#0a1020]/40 border border-white/5">
          {/* Circular Chart Placeholder */}
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-white/5" fill="transparent" strokeWidth="3" r="15.9" cx="18" cy="18" />
                <circle 
                  className="stroke-[#00a2ff]" 
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
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00a2ff]"></div>
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
