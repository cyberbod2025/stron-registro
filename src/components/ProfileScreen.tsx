import { ScreenId, TransitionType } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, KeyRound, X, ShieldCheck, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

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
  const displayName = userName || "Viridiana López";
  const displayEmail = userEmail || "viri.lopez@gmail.com";
  const displayPhone = userPhone || "55 1234 5678";
  const initial = displayName.charAt(0).toUpperCase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const menuItems = [
    { icon: "person", label: "Mis datos", screen: null },
    { icon: "event_note", label: "Mis registros", screen: ScreenId.MisRegistros },
    { icon: "fact_check", label: "Historial de asistencia", screen: null },
    { icon: "bar_chart", label: "Mis estadísticas", screen: null },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    const success = onInstructorLogin(password);
    if (success) {
      onShowToast?.("Acceso de instructor concedido 👑");
      setIsModalOpen(false);
      setPassword("");
      setErrorMsg("");
      onNavigate(ScreenId.PanelInstructor, "push");
    } else {
      setErrorMsg("Contraseña incorrecta");
    }
  };

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
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4994]/5 rounded-full blur-3xl"></div>
        
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
        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#2b1633]/80 via-[#1a0c1f]/60 to-[#240a1b]/80 border border-[#ff4994]/20 shadow-xl">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#ff4994] to-[#582ea2] p-[3px]">
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

      {/* Menu Items */}
      <div className="px-5 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => item.screen && onNavigate(item.screen, "push")}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#2a1520]/30 border border-white/5 hover:border-[#ff4994]/20 transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff4994]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ff4994] text-xl">{item.icon}</span>
              </div>
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#ff4994] transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Access Buttons */}
      <div className="mt-8 px-5 space-y-3">
        {isInstructor ? (
          <button
            onClick={() => {
              onInstructorLogout();
              onShowToast?.("Sesión de instructor cerrada.");
              onNavigate(ScreenId.Splash, "none");
            }}
            className="w-full py-4 rounded-2xl bg-purple-900/25 border border-purple-500/40 text-purple-200 font-black text-xs uppercase tracking-widest hover:bg-purple-900/40 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Salir de Modo Instructor
          </button>
        ) : (
          <button
            onClick={() => {
              setErrorMsg("");
              setIsModalOpen(true);
            }}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-black text-xs uppercase tracking-widest hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-[#ff4994]" />
            Acceso Instructor
          </button>
        )}
      </div>

      {/* Strong Nation branding footer */}
      <div className="mt-10 px-5">
        <div className="flex flex-col items-center opacity-40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4994] to-[#582ea2] flex items-center justify-center">
              <span className="text-xs font-black italic text-white">S</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">STRONG</p>
              <p className="text-[10px] font-black text-[#ff4994] uppercase tracking-wider leading-none">NATION</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-6 px-5 text-center">
        <button
          onClick={() => onNavigate(ScreenId.Splash, "none")}
          className="text-xs font-bold text-white/20 hover:text-white/40 transition-colors cursor-pointer py-2 px-4"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Dynamic Password Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0c0407]/80 backdrop-blur-md"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-[#2b1633] to-[#1a0c1f] border border-[#ff4994]/30 shadow-2xl z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-[#ff4994]/15 border border-[#ff4994]/30 mb-3 text-[#ff4994]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Acceso Instructor</h3>
                <p className="text-xs text-white/50 mt-1">Introduce la contraseña para ingresar al panel administrador.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoFocus
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#12080c] border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-center text-white placeholder-white/20 tracking-widest focus:border-[#ff4994]/45 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errorMsg && (
                    <p className="text-[10px] font-bold text-rose-400 mt-1.5 text-center uppercase tracking-wide">
                      ⚠️ {errorMsg}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#ff4994] text-white font-black text-xs uppercase tracking-widest shadow-[0_4px_15px_rgba(255,73,148,0.25)] hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
                >
                  INGRESAR
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
