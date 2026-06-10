import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Award, Calendar, Shield, Users, Verified, CheckCircle, Flame } from "lucide-react";
import React, { useState } from "react";

interface ProfileProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  userEmail: string;
}

export function ProfileScreen({ onNavigate, userEmail }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<"perfil" | "historial">("perfil");

  // Mock student registration records
  const [history] = useState([
    { id: 1, name: "HIIT - Fuerza & Cardio", venue: "Iztacalco Domo", date: "Hoy, 7:00 PM", status: "Confirmado", color: "text-emerald-400" },
    { id: 2, name: "HIIT - Strong Crew", venue: "Sede Centro", date: "Ayer", status: "Asistido", color: "text-white/60" },
    { id: 3, name: "HIIT - Fuerza & Resistencia", venue: "Iztacalco Domo", date: "Hace 4 días", status: "Cancelado", color: "text-rose-400" },
    { id: 4, name: "HIIT - Strong Nation", venue: "Iztacalco Domo", date: "Hace 1 semana", status: "Asistido", color: "text-white/60" },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-black text-[#ffb1c7] tracking-widest uppercase">Mi Perfil Strong</span>
        <div className="w-9" />
      </div>

      {/* Profile / History Switching Segmented Slider */}
      <div className="flex bg-[#12050c] border border-white/5 p-1 rounded-xl mb-6 shadow-md">
        <button
          onClick={() => setActiveTab("perfil")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "perfil"
              ? "bg-[#ff4994] text-white shadow-md font-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Mi Perfil
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "historial"
              ? "bg-[#ff4994] text-white shadow-md font-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Mis Registros
        </button>
      </div>

      {activeTab === "perfil" ? (
        <div className="space-y-6">
          {/* User Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2b1633] via-[#10081e] to-[#240a1b] border border-[#ff4994]/30 p-6 shadow-xl">
            <div className="absolute top-0 right-0 p-3">
              <Verified className="w-6 h-6 text-[#ff4994] drop-shadow-[0_0_8px_rgba(255,73,148,0.5)]" />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff4994] to-[#582ea2] p-1 flex items-center justify-center font-black text-2xl text-white shadow-md">
                  H
                </div>
                <span className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full text-[9px] border-2 border-[#1e0f14] font-black">
                  LIVE
                </span>
              </div>

              <div>
                <h2 className="text-base font-black text-white leading-tight">Hugo Watson Primero</h2>
                <p className="text-xs text-[#e2bdc6] font-mono truncate max-w-[200px]">
                  {userEmail || "hugo.watson.primero@gmail.com"}
                </p>
                <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-[#ff4994]/20 border border-[#ff4994]/50 text-[#ffb1c7] uppercase">
                  Atleta Elite
                </span>
              </div>
            </div>

            {/* Level of Trust Interactive Indicator */}
            <div
              onClick={() => onNavigate(ScreenId.Leaderboard, "push")}
              className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ff4994]/50 hover:bg-white/10 transition-all cursor-pointer group"
              role="button"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#e2bdc6] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary-container" />
                  Nivel de Confianza
                </span>
                <span className="text-xs font-black text-white group-hover:text-primary transition-colors">
                  98% (Excelente)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#ff4994] h-full rounded-full transition-all" style={{ width: "98%" }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-white/50 mt-1 font-semibold">
                <span>Rendición de Cuentas: Estricta</span>
                <span className="text-primary tracking-wider uppercase font-black">Ver Tabla &rarr;</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate(ScreenId.InvitarAmiga, "slide_up")}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-white/5 hover:border-[#ffb1c7]/40 text-center active:scale-95 transition-all cursor-pointer group"
            >
              <Users className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-white uppercase tracking-wider">Invitar Amiga</span>
              <span className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">Meta 5 Activa</span>
            </button>

            <button
              onClick={() => setActiveTab("historial")}
              className="flex flex-col items-center justify-center p-4 rounded-2xl glass-card border border-white/5 hover:border-[#ffb1c7]/40 text-center active:scale-95 transition-all cursor-pointer group"
            >
              <Calendar className="w-6 h-6 text-[#ff4994] mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-white uppercase tracking-wider">Registros</span>
              <span className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">4 Entrenamientos</span>
            </button>
          </div>

          {/* Badges and Log */}
          <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#ff4994]" /> Logros de Comunidad Strong
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Súper Compromiso</p>
                    <p className="text-[10px] text-[#e2bdc6]">Sostén asistencia 5 clases seguidas</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Asignado</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤝</span>
                  <div>
                    <p className="text-xs font-black text-white uppercase">Líder de Confianza</p>
                    <p className="text-[10px] text-[#e2bdc6]">0 cancelaciones no justificadas</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">98% Elite</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="glass-card rounded-2xl p-4 border border-white/5 space-y-2 bg-[#2a1723]/10">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-black text-white uppercase tracking-wide">{item.name}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${item.color}`}>
                    ● {item.status}
                  </span>
                </div>
                <p className="text-xs text-[#e2bdc6]">{item.venue}</p>
                <p className="text-[9px] text-white/50 font-mono">{item.date}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
              className="w-full py-3 rounded-xl bg-[#ff4994] text-white font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
            >
              REGISTRAR NUEVA CLASE
            </button>
          </div>
        </div>
      )}

      {/* Log out option to demo starting over */}
      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate(ScreenId.Splash, "none")}
          className="text-[10px] font-black uppercase tracking-widest text-[#ffb1c7] hover:text-white bg-[#1e0f14] px-4 py-2 rounded-full border border-white/5 hover:bg-[#12050c] cursor-pointer"
        >
          Cerrar Sesión & Reiniciar
        </button>
      </div>
    </motion.div>
  );
}
