import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { Bell, Shield, Award, Users, Dumbbell, User, Flame, ArrowRight, Settings, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import React, { useState } from "react";

interface InicioProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  unreadNotificationsCount?: number;
}

export function InicioScreen({ onNavigate, unreadNotificationsCount = 2 }: InicioProps) {
  // We can let the user toggle scenario focus states directly inside the dashboard.
  // This simulates the exact visual styles previously scattered across 6 different screens!
  const [activeScenario, setActiveScenario] = useState<"standard" | "team" | "crew" | "comunidad" | "accountability">("standard");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <button
            onClick={() => onNavigate(ScreenId.Notificaciones, "push")}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer relative"
          >
            <Bell className="w-5 h-5 text-[#ffb1c7]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#1e0f14]" />
            )}
          </button>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-black text-rose-300 tracking-[0.2em] uppercase leading-none block mb-1">
            Sede Oficial
          </span>
          <h2 className="text-sm font-black text-white italic tracking-tight uppercase">
            Strong Iztacalco
          </h2>
        </div>

        <button
          onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <User className="w-5 h-5 text-[#d3bbff]" />
        </button>
      </div>

      {/* Interactive Scenario Selector (Integrated seamlessly to avoid redundant page paths) */}
      <div className="mb-6">
        <label className="block text-[8px] font-black uppercase text-[#ffb1c7] tracking-widest mb-1.5 opacity-80">
          🔍 Simulador de Estados y Enfoques
        </label>
        <div className="flex flex-wrap gap-1.5 bg-neutral-900/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveScenario("standard")}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
              activeScenario === "standard"
                ? "bg-[#ff4994]/25 text-[#ffb1c7] border border-[#ff4994]/30"
                : "text-white/40 hover:text-white/75"
            }`}
          >
            Estándar
          </button>
          <button
            onClick={() => setActiveScenario("team")}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
              activeScenario === "team"
                ? "bg-purple-500/20 text-[#d3bbff] border border-purple-500/30"
                : "text-white/40 hover:text-white/75"
            }`}
          >
            Socio-Equipo
          </button>
          <button
            onClick={() => setActiveScenario("crew")}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
              activeScenario === "crew"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                : "text-white/40 hover:text-white/75"
            }`}
          >
            Alerta Quórum
          </button>
          <button
            onClick={() => setActiveScenario("accountability")}
            className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
              activeScenario === "accountability"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-white/40 hover:text-white/75"
            }`}
          >
            Rendición
          </button>
        </div>
      </div>

      {/* Main Container Render based on active scenario */}
      <motion.div
        key={activeScenario}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Scenario 1: Standard Dashboard */}
        {activeScenario === "standard" && (
          <>
            <div className="relative rounded-3xl overflow-hidden p-6 border border-[#ff4994]/30 bg-gradient-to-tr from-[#301c3d] via-[#1a0c1f] to-[#1e0f14] shadow-xl">
              <div className="absolute top-0 right-0 p-3 opacity-25">
                <Dumbbell className="w-16 h-16 text-[#ff4994]" />
              </div>

              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-[#ff4994]/20 border border-[#ff4994]/50 text-[#ffb1c7] uppercase mb-4">
                Entrenamiento De Hoy
              </span>

              <h3 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mb-1">
                HIIT de Compromiso Completo
              </h3>
              <p className="text-xs text-[#e2bdc6] mb-6">
                Sede Iztacalco • Hoy 7:00 PM • Instructor Hugo
              </p>

              <button
                onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
                className="w-full py-3 px-4 rounded-xl bg-[#ff4994] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
              >
                UNIRME AHORA
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate(ScreenId.Leaderboard, "push")}
                className="p-4 rounded-2xl glass-card border border-white/5 text-left hover:border-[#ff4994]/30 active:scale-95 transition-all group cursor-pointer"
              >
                <Shield className="w-5 h-5 text-[#ff4994] mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black text-white uppercase">Leaderboard</h4>
                <p className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">Garantía de Confianza &rarr;</p>
              </button>

              <button
                onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
                className="p-4 rounded-2xl glass-card border border-white/5 text-left hover:border-purple-500/30 active:scale-95 transition-all group cursor-pointer"
              >
                <User className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black text-white uppercase">Mi Perfil</h4>
                <p className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">Logros & Rachas &rarr;</p>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <h4 className="text-xs font-black text-[#ffb1c7] uppercase">¿Qué es el Pacto de Honor?</h4>
              <p className="text-[10px] text-[#e2bdc6] mt-1 leading-relaxed">
                Es nuestra regla inquebrantable de asistencia. Una vez registrado, tu palabra es ley. Si faltas o cancelas a últimas, perjudicas a tus compañeras.
              </p>
            </div>
          </>
        )}

        {/* Scenario 2: Strong Team (Asistencia Colectiva/Grupal) */}
        {activeScenario === "team" && (
          <>
            <div className="relative rounded-3xl overflow-hidden p-6 border border-purple-500/30 bg-gradient-to-tr from-[#251535] to-[#13071c] shadow-xl">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-purple-500/20 border border-purple-500/50 text-[#d3bbff] uppercase mb-4">
                Pacto Colectivo
              </span>

              <h3 className="text-xl font-black italic tracking-tight text-white uppercase leading-none mb-1">
                Reto Comunidad Perfecta
              </h3>
              <p className="text-xs text-[#e2bdc6] mb-6">
                Aseguremos juntas la asistencia para que la sesión de las 7:00 PM alcance el quórum sin fricción.
              </p>

              <button
                onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff4994] to-[#582ea2] text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                RESERVAR MI LUGAR EN EL GRUPO
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate(ScreenId.Leaderboard, "push")}
                className="p-4 rounded-2xl glass-card border border-white/5 text-left hover:border-purple-400/30 active:scale-95 transition-all group cursor-pointer"
              >
                <Flame className="w-5 h-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform animate-pulse" />
                <h4 className="text-xs font-black text-white uppercase">Tablas de Fuego</h4>
                <p className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">Compromiso racha &rarr;</p>
              </button>

              <button
                onClick={() => onNavigate(ScreenId.InvitarAmiga, "push")}
                className="p-4 rounded-2xl glass-card border border-white/5 text-left hover:border-[#ff4994]/30 active:scale-95 transition-all group cursor-pointer"
              >
                <Users className="w-5 h-5 text-[#ff4994] mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-black text-white uppercase">Pase de Amigas</h4>
                <p className="text-[9px] text-[#e2bdc6] mt-1 font-semibold">Reto Meta 5 &rarr;</p>
              </button>
            </div>
          </>
        )}

        {/* Scenario 3: Strong Crew (Alerta Quórum urgente) */}
        {activeScenario === "crew" && (
          <>
            <div className="relative rounded-3xl overflow-hidden p-6 border border-rose-500/40 bg-gradient-to-br from-rose-950/20 to-neutral-900 shadow-xl text-center">
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-rose-500/20 border border-rose-500/50 text-rose-300 uppercase mb-4 animate-pulse">
                S.O.S. QUÓRUM BAJO
              </span>

              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                ¡Protege la Clase Hoy!
              </h3>
              <p className="text-xs text-[#e2bdc6] mb-5 max-w-sm mx-auto leading-relaxed">
                La sesión de hoy cuenta con <strong className="text-rose-400">solo 3 personas confirmadas</strong>. Si no sumamos 5 para las 10:00 PM, el sistema cancelará la clase de forma definitiva.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate(ScreenId.RegistroDeClase, "slide_up")}
                  className="py-3 px-2 rounded-xl bg-white text-[#1e0f14] font-black text-[10px] uppercase tracking-wider cursor-pointer active:scale-95 transition-all text-center"
                >
                  Confirmar Lugar
                </button>
                <button
                  onClick={() => onNavigate(ScreenId.InvitarAmiga, "slide_up")}
                  className="py-3 px-2 rounded-xl bg-[#ff4994] text-white font-black text-[10px] uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer active:scale-95 transition-all text-center animate-bounce"
                >
                  Compartir Enlace
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/10 border border-rose-500/10 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wide">Paso de Penalización</p>
                <p className="text-[10px] text-[#e2bdc6] mt-0.5 leading-relaxed">
                  Evitemos congelar los puntajes de confiabilidad. Recomienda el link con tu grupo o invita amigas para proteger el entrenamiento.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Scenario 4: Accountability Focus (Rendición de Cuentas) */}
        {activeScenario === "accountability" && (
          <>
            <div className="rounded-3xl p-6 bg-gradient-to-tr from-[#121c25] to-[#12050c] border border-cyan-500/30 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[8px] font-black uppercase tracking-wider">
                  Rendimiento Disciplinario
                </span>
                <span className="text-xs font-black text-white font-mono">ID: SN-84</span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-full border-4 border-cyan-500 flex items-center justify-center font-black text-white text-lg bg-cyan-900/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  7🔥
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none uppercase tracking-wide">Asistencia Impecable</p>
                  <p className="text-[10px] text-[#e2bdc6] mt-1">¡Has acumulado una racha récord de 7 entrenamientos consecutivas!</p>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigate(ScreenId.Leaderboard, "push")}
                  className="py-2.5 px-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white hover:bg-white/10 cursor-pointer text-center"
                >
                  Ver Mi Racha
                </button>
                <button
                  onClick={() => onNavigate(ScreenId.MiPerfil, "push")}
                  className="py-2.5 px-2 rounded-xl bg-cyan-500 text-[#12050c] text-[10px] font-black uppercase hover:brightness-110 cursor-pointer text-center"
                >
                  Ver Mi Confianza
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold opacity-80">Cumplimiento Grupal</span>
                <span className="text-cyan-400 font-black font-mono">94%</span>
              </div>
              <div className="w-full bg-[#1e0f14] h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Persistent Shortcut bottom banner for fast instructor views */}
      <div className="mt-8 border-t border-white/5 pt-6 text-center">
        <button
          onClick={() => onNavigate(ScreenId.PanelInstructor, "push")}
          className="text-[10px] font-black uppercase tracking-widest text-[#ffb1c7] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>🛠️ CONTROL DE INSTRUCTOR</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
