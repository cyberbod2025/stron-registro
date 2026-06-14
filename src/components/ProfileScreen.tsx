import { ScreenId, TransitionType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, KeyRound, X, ShieldCheck, Eye, EyeOff, BellRing, BellOff } from "lucide-react";
import React, { useState } from "react";
import { useOneSignal } from "../hooks/useOneSignal";

interface ProfileProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  isInstructor: boolean;
  onInstructorLogin: (password: string) => boolean;
  onInstructorLogout: () => void;
  onShowToast?: (message: string) => void;
}

export function ProfileScreen({
  onNavigate,
  userEmail,
  userName,
  userPhone,
  isInstructor,
  onInstructorLogin,
  onInstructorLogout,
  onShowToast
}: ProfileProps) {
  const displayName = isInstructor ? "Profe Hugo" : (userName || "Alumna Nueva");
  const displayEmail = isInstructor ? "Instructor Principal" : (userEmail || "Sin correo registrado");
  const displayPhone = isInstructor ? "Modo Administrador" : (userPhone || "Sin teléfono");
  const initial = isInstructor ? "H" : displayName.charAt(0).toUpperCase();

  const { status: pushStatus, requestPermission, debugInfo } = useOneSignal();

  const menuItems = isInstructor ? [] : [
    { icon: "person", label: "Mis datos", screen: null },
    { icon: "fact_check", label: "Historial de asistencia", screen: null },
    { icon: "bar_chart", label: "Mis estadísticas", screen: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-28 relative"
    >
      {/* Header with branding */}
      <div className="relative px-5 pt-14 pb-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a2ff]/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-black italic text-white uppercase tracking-tight">Mi perfil</h1>
          {isInstructor && (
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              Profe
            </span>
          )}
        </div>

        {/* Profile Card */}
        <div className="relative rounded-3xl p-6 glass-card border border-[#00a2ff]/30 shadow-xl overflow-hidden">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#00a2ff] to-[#00e5ff] p-[3px]">
                <div className="w-full h-full rounded-full bg-[#1e0f14] flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{initial}</span>
                </div>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#1e0f14]"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-white leading-tight truncate">{displayName}</h2>
              <p className="text-xs text-[#e2bdc6] font-mono truncate mt-0.5">{displayEmail}</p>
              <p className="text-xs text-white/40 mt-0.5">📱 {displayPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      {!isInstructor && (
        <div className="px-5 mb-8">
          <h3 className="text-[10px] font-black text-[#00a2ff] uppercase tracking-widest mb-3 px-2">Recordatorios</h3>
          
          <div className="rounded-2xl p-4 glass-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                pushStatus === "subscribed" ? "bg-emerald-500/10" : "bg-white/5"
              }`}>
                {pushStatus === "subscribed" ? (
                  <BellRing className="w-5 h-5 text-emerald-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-white/40" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">Avisos de clases</p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {pushStatus === "loading" && "Verificando estado..."}
                  {pushStatus === "unsubscribed" && "No activadas"}
                  {pushStatus === "subscribed" && "Recordatorios activados"}
                  {pushStatus === "blocked" && "Permisos bloqueados"}
                  {pushStatus === "unconfigured" && "Falta configurar"}
                  {pushStatus === "unsupported" && "No soportado en este dispositivo"}
                  {pushStatus === "error" && "Error al cargar"}
                </p>
              </div>
            </div>



            {pushStatus === "unsubscribed" && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 rounded-xl bg-[#00a2ff] text-white text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                Activar
              </button>
            )}
            {pushStatus === "subscribed" && (
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            )}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-5 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => item.screen && onNavigate(item.screen, "push")}
            className="w-full flex items-center justify-between p-4 rounded-2xl glass-card hover:border-[#00a2ff]/40 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a2ff]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#00a2ff] text-xl">{item.icon}</span>
              </div>
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#00a2ff] transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Access Buttons */}
      <div className="mt-8 px-5 space-y-3">
        {isInstructor && (
          <button
            onClick={() => {
              onInstructorLogout();
              onShowToast?.("Sesión de instructor cerrada.");
              onNavigate(ScreenId.RoleSelection, "push_back");
            }}
            className="w-full py-4 rounded-2xl bg-purple-900/25 border border-purple-500/40 text-purple-200 font-black text-xs uppercase tracking-widest hover:bg-purple-900/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Salir de Modo Instructor
          </button>
        )}
      </div>

      {/* Strong Nation branding footer */}
      <div className="mt-10 px-5">
        <div className="flex flex-col items-center opacity-40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a2ff] to-[#00e5ff] flex items-center justify-center">
              <span className="text-xs font-black italic text-white">S</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">STRONG</p>
              <p className="text-[10px] font-black text-[#00a2ff] uppercase tracking-wider leading-none">NATION</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 px-5 text-center">
        <button
          onClick={() => onNavigate(ScreenId.RoleSelection, "push_back")}
          className="text-xs font-bold text-white/20 hover:text-white/40 transition-colors cursor-pointer py-2 px-4"
        >
          Cerrar sesión / Cambiar Rol
        </button>
      </div>

    </motion.div>
  );
}
