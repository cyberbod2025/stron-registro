import React, { useState } from "react";
import { ScreenId, TransitionType, ClassSession } from "../types";
import { motion } from "motion/react";
import { MapPin, Search } from "lucide-react";
import { formatDisplayDate } from "../lib/utils";

interface MisRegistrosProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  classes: ClassSession[];
  onSelectClass: (classId: string) => void;
}

type TabFilter = "proximas" | "pasadas" | "historial";

export function MisRegistrosScreen({ onNavigate, classes, onSelectClass }: MisRegistrosProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("proximas");
  const [searchTerm, setSearchTerm] = useState("");
  const [myClassIds, setMyClassIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const tabs: { id: TabFilter; label: string }[] = [
    { id: "proximas", label: "Próximas" },
    { id: "pasadas", label: "Pasadas" },
    { id: "historial", label: "Historial" },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum": return "CONFIRMADA";
      case "confirmada_manual": return "ACTIVA (MANUAL)";
      case "cancelada": return "CANCELADA";
      case "finalizada": return "FINALIZADA";
      default: return "PENDIENTE";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmada_por_quorum":
      case "confirmada_manual": return "status-confirmed";
      case "cancelada": return "status-cancelled";
      case "finalizada": return "bg-slate-500/10 border-slate-500/30 text-slate-400";
      default: return "status-pending";
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const normalizedTerm = searchTerm.trim().toLowerCase();
      const mobileTerm = normalizedTerm.replace(/[\s-]/g, '');
      
      const orQuery = mobileTerm 
        ? `email.eq.${normalizedTerm},mobile.eq.${mobileTerm}`
        : `email.eq.${normalizedTerm}`;

      const { data: students, error: err1 } = await supabase
        .from('students')
        .select('id')
        .or(orQuery);

      if (err1) throw err1;

      if (!students || students.length === 0) {
        setMyClassIds([]);
        setHasSearched(true);
        return;
      }

      const studentIds = students.map((s: any) => s.id);
      
      const { data: regs, error: err2 } = await supabase
        .from('registrations')
        .select('class_id')
        .in('student_id', studentIds);

      if (err2) throw err2;

      setMyClassIds(regs.map((r: any) => r.class_id));
      setHasSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const myClasses = classes.filter(c => myClassIds.includes(c.id));

  const filteredClasses = myClasses.filter(c => {
    if (activeTab === "proximas") return c.status !== "cancelada" && c.status !== "finalizada";
    if (activeTab === "pasadas") return c.status === "finalizada" || c.status === "cancelada";
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
                  ? "bg-[#F20F72] text-white shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search form if no classes yet */}
      {(!hasSearched || myClassIds.length === 0) && (
        <div className="px-5 mb-6">
          <div className="glass-panel p-4 border border-[#F20F72]/30">
            <p className="text-sm text-white/80 font-bold mb-3">No encontramos registros en este dispositivo.</p>
            <p className="text-[11px] text-[#e2bdc6] mb-4 leading-relaxed">
              Si ya te registraste, escribe el mismo correo o teléfono que usaste para buscar tus clases.
            </p>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ej. ana@gmail.com o 5512345678"
                  className="w-full bg-[#030712]/80 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/40"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all cursor-pointer"
              >
                {isSearching ? "BUSCANDO..." : "BUSCAR MIS CLASES"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Registration List */}
      {(hasSearched && myClassIds.length > 0) && (
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
                  onNavigate(ScreenId.YaRegistrada, "push");
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full text-left rounded-2xl p-4 glass-card hover:border-[#F20F72]/40 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F20F72]/10 border border-[#F20F72]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#F20F72] text-lg">event</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      {formatDisplayDate(c)} {c.timeStr}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-[#e2bdc6]">{c.location}</span>
                      {c.mapsUrl && (
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(c.mapsUrl, '_blank'); }}
                          className="ml-1 text-[9px] font-black text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          Maps
                        </button>
                      )}
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
      )}

      {/* Register new button */}
      <div className="px-5 mt-8">
        <button
          onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F20F72] to-[#8E2DE2] text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(242,15,114,0.3)] active:scale-[0.97] transition-all cursor-pointer"
        >
          REGISTRAR NUEVA CLASE
        </button>
      </div>
    </motion.div>
  );
}
