import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Settings, ShieldAlert, Users, Calendar, AlertTriangle, Send, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";
import React, { useState } from "react";

interface InstructorProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast: (message: string) => void;
  onTriggerCancelationAlert?: () => void;
}

export function PanelInstructor({ onNavigate, onShowToast, onTriggerCancelationAlert }: InstructorProps) {
  const [activeTab, setActiveTab] = useState<"metrics" | "operations" | "accountability">("metrics");

  // State from panel operations
  const [classStatus, setClassStatus] = useState<"activa" | "amenaza" | "cancelada">("amenaza");
  const [registeredCount, setRegisteredCount] = useState(4);

  // Roster of students under evaluation from panel accountability
  const [suspects, setSuspects] = useState([
    { id: 1, name: "Jessica Rivas", rate: "72%", cancelCount: 4, warningSent: false },
    { id: 2, name: "Priscila Mendoza", rate: "75%", cancelCount: 3, warningSent: false },
    { id: 3, name: "Mariana del Valle", rate: "78%", cancelCount: 2, warningSent: false },
  ]);

  const handleCancelClick = () => {
    setClassStatus("cancelada");
    if (onTriggerCancelationAlert) {
      onTriggerCancelationAlert();
    }
    onShowToast("La clase de Iztacalco ha sido suspendida. Se enviaron alertas críticas a todas las participantes.");
  };

  const handleSendWarning = (id: number, name: string) => {
    setSuspects(suspects.map(s => s.id === id ? { ...s, warningSent: true } : s));
    onShowToast(`Se ha enviado Alerta de Asistencia Crítica a ${name}.`);
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
          <p className="text-[10px] font-black text-orange-400 tracking-widest uppercase">CONSOLA CENTRAL</p>
          <h1 className="text-base font-black text-white uppercase tracking-tight">Panel de Instructores</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Tabs segment selectors styled exactly to fit a modern aesthetic */}
      <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl mb-6 shadow-md">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "metrics"
              ? "bg-[#ff4994]/20 text-[#ffb1c7]"
              : "text-white/40 hover:text-white"
          }`}
        >
          Métricas
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "operations"
              ? "bg-orange-500/15 text-orange-300"
              : "text-white/40 hover:text-white"
          }`}
        >
          Controles
        </button>
        <button
          onClick={() => setActiveTab("accountability")}
          className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "accountability"
              ? "bg-rose-500/15 text-rose-300"
              : "text-white/40 hover:text-white"
          }`}
        >
          Disciplina
        </button>
      </div>

      {/* Interactive Tabs Views */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* TAB 1: METRICS */}
        {activeTab === "metrics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#201524] to-[#120716] border border-white/5 shadow-md">
                <p className="text-[9px] font-black text-[#ffb1c7] uppercase tracking-wider">Atletas Activas</p>
                <p className="text-2xl font-black text-white mt-1">214</p>
                <p className="text-[10px] text-emerald-400 font-extrabold mt-1">▲ +12% esta semana</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-[#201524] to-[#120716] border border-white/5 shadow-md">
                <p className="text-[9px] font-black text-[#ffb1c7] uppercase tracking-wider">Tasa Asistencia</p>
                <p className="text-2xl font-black text-white mt-1">94.2%</p>
                <p className="text-[10px] text-[#ff4994] font-extrabold mt-1">● Altamente Fiel</p>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#ff4994]" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Consistencia de Sede</h3>
              </div>
              <p className="text-xs text-[#e2bdc6] leading-relaxed">
                El índice general de honorabilidad de Iztacalco se mantiene alto, disminuyendo penalizaciones de ausencias no justificadas a menos del 3% este mes.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONS AND EMERGENCY CONTROL */}
        {activeTab === "operations" && (
          <div className="space-y-5">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#251b17] to-[#130d0a] border border-orange-500/30 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-orange-200">Estado de Sesión</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  classStatus === "activa" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300" :
                  classStatus === "amenaza" ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 animate-pulse" :
                  "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}>
                  {classStatus === "activa" ? "Confirmada" : classStatus === "amenaza" ? "Riesgo Cancelación" : "Suspendida"}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase italic">Clase HIIT Hoy 7:00 PM</h3>
                <p className="text-xs text-[#e2bdc6]">
                  Contamos con <strong className="text-white">{registeredCount} alumnas confirmadas</strong> de un quórum indispensable de 5.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {classStatus === "amenaza" && (
                  <>
                    <button
                      onClick={() => {
                        setRegisteredCount(5);
                        setClassStatus("activa");
                        onShowToast("¡Se ha completado el quórum mínimo de 5 alumnas!");
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center"
                    >
                      Simular Registro Alumna (Elevar a 5)
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center"
                    >
                      Suspender Sesión por Insuficiencia
                    </button>
                  </>
                )}

                {classStatus === "activa" && (
                  <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-center">
                    <p className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider mb-2">
                      ✓ ¡Quórum Garantizado de 5/5 Atletas!
                    </p>
                    <button
                      onClick={() => {
                        setClassStatus("amenaza");
                        setRegisteredCount(4);
                      }}
                      className="text-[9px] px-2 py-1 bg-white/5 border border-white/5 rounded text-white uppercase font-black"
                    >
                      Reiniciar Estado
                    </button>
                  </div>
                )}

                {classStatus === "cancelada" && (
                  <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/20 text-center space-y-2">
                    <p className="text-[11px] text-rose-300 font-bold uppercase tracking-wider">
                      La clase ha sido suspendida
                    </p>
                    <button
                      onClick={() => {
                        setClassStatus("amenaza");
                        setRegisteredCount(4);
                      }}
                      className="py-1 px-3 bg-white/5 border border-white/10 rounded text-[9px] text-white hover:bg-white/10 font-bold uppercase tracking-widest cursor-pointer"
                    >
                      Restablecer Simulación
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISCIPLINE & COMPLIANCE REVIEW */}
        {activeTab === "accountability" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-rose-500/20 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[11px] text-[#e2bdc6] leading-relaxed">
                Toma acción sobre atletas con un <strong className="text-white">Nivel de Confianza menor al 80%</strong>. Envía alertas para incentivar el cumplimiento de su palabra empeñada.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">
                Alumnas bajo Evaluación
              </h3>

              {suspects.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-black text-white">{student.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                        Confianza: {student.rate}
                      </span>
                      <span className="text-[9px] text-[#e2bdc6]/60">
                        {student.cancelCount} cancelaciones
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={student.warningSent}
                    onClick={() => handleSendWarning(student.id, student.name)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all cursor-pointer ${
                      student.warningSent
                        ? "bg-white/5 text-white/30 border border-white/5"
                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    {student.warningSent ? "Enviado" : "Alertar"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
