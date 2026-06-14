import { motion } from "motion/react";
import { Users, Lock, ChevronRight, UserCircle } from "lucide-react";
import { ScreenId, TransitionType } from "../types";
import React, { useState } from "react";


interface RoleSelectionProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onInstructorLogin: (password: string) => boolean;
  onShowToast: (message: string) => void;
}

export function RoleSelectionScreen({ onNavigate, onInstructorLogin, onShowToast }: RoleSelectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onInstructorLogin(password)) {
      onShowToast("Bienvenido al Panel de Instructor");
      onNavigate(ScreenId.PanelInstructor, "push");
    } else {
      onShowToast("Contraseña incorrecta");
      setPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center relative px-6 overflow-hidden"
    >
      {/* Subtle overlay to enhance text readability over global background */}
      <div className="absolute inset-0 bg-[#0B0B0F]/60 z-0" />

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic drop-shadow-[0_0_15px_rgba(0,162,255,0.5)]">
            Strong Nation
          </h1>
          <p className="text-sm font-medium text-[#F20F72] uppercase tracking-widest mt-2">
            Registro de Clases
          </p>
        </div>

        {!showPassword ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(ScreenId.Splash, "push")}
              className="w-full relative overflow-hidden group rounded-2xl bg-gradient-to-br from-[#F20F72]/20 to-[#F20F72]/5 border border-[#F20F72]/30 p-6 flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-[#F20F72]/20 flex items-center justify-center mb-2">
                <Users className="w-7 h-7 text-[#F20F72]" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Soy Alumno</h2>
              <p className="text-xs text-white/80 text-center">
                Registra tu asistencia, invita amigos y gestiona tus clases.
              </p>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-[#F20F72]" />
              </div>
            </motion.button>

            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPassword(true)}
                className="mx-auto flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Acceso Instructor</span>
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#0a1020]/80 border border-[#F20F72]/30 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F20F72] to-[#8E2DE2] flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-lg font-black text-center text-white uppercase tracking-widest mb-6">
              Acceso Instructor
            </h2>
            
            <form onSubmit={handleInstructorSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de acceso"
                  className="w-full bg-[#1e0f14]/80 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#F20F72] transition-colors"
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F20F72] to-[#8E2DE2] text-white font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
              >
                Ingresar
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowPassword(false);
                  setPassword("");
                }}
                className="w-full py-3 mt-2 rounded-xl bg-transparent border border-white/10 text-white/70 font-bold text-xs uppercase tracking-wider hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                Volver
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
