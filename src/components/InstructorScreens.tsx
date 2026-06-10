import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Users, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import React, { useState } from "react";

interface InstructorProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast?: (message: string) => void;
  classes?: ClassSession[];
}

export function PanelInstructor({ onNavigate, onShowToast, classes }: InstructorProps) {
  // Find next pending class
  const nextClass = classes?.find(c => c.status === "pendiente") || classes?.[0];

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (!nextClass?.id) {
      setIsLoading(false);
      return;
    }
    
    const fetchStudents = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('registrations')
          .select('*, students(full_name, mobile)')
          .eq('class_id', nextClass.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.students?.full_name || "Desconocido",
          status: s.attended ? "Asistió" : "Confirmada",
          phone: s.students?.mobile || ""
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
  }, [nextClass?.id]);

  const confirmedCount = nextClass?.confirmedCount ?? 4;
  const minRequired = nextClass?.minRequired ?? 5;
  const missingCount = Math.max(0, minRequired - confirmedCount);

  const handleMarkAttendance = async (id: string, name: string) => {
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase
        .from('registrations')
        .update({ attended: true })
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.map(s => s.id === id ? { ...s, status: "Asistió" } : s));
      onShowToast?.(`${name} marcada como Asistió.`);
    } catch (err) {
      console.error(err);
      onShowToast?.("Error al marcar asistencia.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Upper Unified Header on Instructor Panel */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black text-orange-400 tracking-widest uppercase">CONSOLA INSTRUCTOR</p>
          <h1 className="text-base font-black text-white uppercase tracking-tight">Próxima Clase</h1>
        </div>
        <div className="w-10" />
      </div>

      <div className="space-y-6">
        {/* Class Info and Quorum Status */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-[#251b17] to-[#130d0a] border border-orange-500/30 space-y-4 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-orange-400 tracking-wider mb-1">
                {nextClass?.title || "Strong Nation"}
              </p>
              <h2 className="text-lg font-black text-white uppercase leading-tight">
                {nextClass?.dateStr} {nextClass?.timeStr}
              </h2>
              <p className="text-xs text-[#e2bdc6] mt-1">{nextClass?.location}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-white uppercase">Cierre: {nextClass?.deadlineStr || "8:00 p.m. (Ayer)"}</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-2xl font-black text-white leading-none">
                  {confirmedCount} <span className="text-sm text-[#e2bdc6] font-normal uppercase tracking-widest">Confirmadas</span>
                </p>
              </div>
              <div className="text-right">
                {missingCount > 0 ? (
                  <p className="text-sm font-black text-rose-400 leading-none">
                    Faltan {missingCount}
                  </p>
                ) : (
                  <p className="text-sm font-black text-emerald-400 leading-none">
                    ¡Quórum Listo!
                  </p>
                )}
              </div>
            </div>

            <div className="w-full bg-[#1e0f14] rounded-full h-3 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  confirmedCount >= minRequired ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-rose-500"
                }`}
                style={{ width: `${Math.min(100, (confirmedCount / minRequired) * 100)}%` }}
              />
            </div>
            
            {missingCount > 0 && (
              <p className="text-[10px] text-amber-300/80 mt-2 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" />
                Riesgo de suspensión si no se llega a {minRequired}.
              </p>
            )}
          </div>
        </div>

        {/* Student Roster & Attendance */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" /> Lista de Alumnas
          </h3>

          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-black text-white uppercase">{student.name}</p>
                  <p className="text-[10px] text-[#e2bdc6] mt-0.5 font-mono">{student.phone}</p>
                </div>

                <button
                  disabled={student.status === "Asistió"}
                  onClick={() => handleMarkAttendance(student.id, student.name)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all cursor-pointer ${
                    student.status === "Asistió"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {student.status === "Asistió" ? (
                    <>
                      <CheckCircle className="w-3 h-3" /> Asistió
                    </>
                  ) : (
                    "Marcar Asistencia"
                  )}
                </button>
              </div>
            ))}

            {students.length === 0 && (
              <p className="text-xs text-[#e2bdc6] text-center py-4 italic">
                Aún no hay alumnas confirmadas para esta clase.
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
