import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { formatDisplayDate } from "../lib/utils";

interface MisRegistrosProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
  onSelectClass: (classId: string) => void;
}

type TabFilter = "proximas" | "pasadas" | "historial";

export function MisRegistrosScreen({ onNavigate, classes, onSelectClass }: MisRegistrosProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("proximas");

  const tabs: { id: TabFilter; label: string }[] = [
    { id: "proximas", label: "Próximas" },
    { id: "pasadas", label: "Pasadas" },
    { id: "historial", label: "Historial" },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada": return "CONFIRMADA";
      case "suspendida": return "CANCELADA";
      default: return "Pendiente";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmada": return "status-confirmed";
      case "suspendida": return "status-cancelled";
      default: return "status-pending";
    }
  };

  // Simple filtering based on status
  const filteredClasses = classes.filter(c => {
    if (activeTab === "proximas") return c.status !== "suspendida";
    if (activeTab === "pasadas") return c.status === "suspendida";
    return true; // historial shows all
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-xl font-black italic text-white uppercase tracking-tight mb-1">
          Mis registros
        </h1>
        <p className="text-xs text-[#e2bdc6]">Tu historial de clases</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-6">
        <div className="flex bg-[#12080c] border border-white/5 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#00a2ff] text-white shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registration List */}
      <div className="px-5 space-y-3">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-white/30 text-5xl mb-3 block">event_busy</span>
            <p className="text-sm text-white/80 font-bold">No hay registros en esta categoría</p>
          </div>
        ) : (
          filteredClasses.map((c, index) => (
            <motion.button
              key={c.id}
              onClick={() => {
                onSelectClass(c.id);
                onNavigate(ScreenId.Confirmada, "push");
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full text-left rounded-2xl p-4 glass-card hover:border-[#00a2ff]/40 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00a2ff]/10 border border-[#00a2ff]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00a2ff] text-lg">event</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">
                    {formatDisplayDate(c)} {c.timeStr}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-[#e2bdc6]">{c.location}</span>
                  </div>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusClass(c.status)}`}>
                {getStatusLabel(c.status)}
              </span>
            </motion.button>
          ))
        )}
      </div>

      {/* Register new button */}
      <div className="px-5 mt-8">
        <button
          onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00a2ff] to-[#0077ff] text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(255,73,148,0.3)] active:scale-[0.97] transition-all cursor-pointer"
        >
          REGISTRAR NUEVA CLASE
        </button>
      </div>
    </motion.div>
  );
}
