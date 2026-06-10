import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Shield, Flame, Trophy, Star } from "lucide-react";
import React, { useState } from "react";

interface LeaderboardProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
}

export function Leaderboard({ onNavigate }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"confianza" | "compromiso">("confianza");

  // Mock trustworthy ranking
  const ranking = [
    { rank: 1, name: "María Fernanda G.", score: "100%", classes: 42, active: true },
    { rank: 2, name: "Hugo Watson Primero", score: "98%", classes: 38, isUser: true, active: true },
    { rank: 3, name: "Ana Isabel Domínguez", score: "96%", classes: 31, active: true },
    { rank: 4, name: "Lorena Beltrán", score: "94%", classes: 28, active: true },
    { rank: 5, name: "Gabriela S. Ruiz", score: "92%", classes: 24, active: false },
    { rank: 6, name: "Priscila Mendoza", score: "88%", classes: 19, active: false },
  ];

  // Mock consecutive attendance streaks
  const commitmentRanking = [
    { rank: 1, name: "María Fernanda G.", streak: "12 Clases", trend: "up", reward: "Fuego" },
    { rank: 2, name: "Lorena Beltrán", streak: "9 Clases", trend: "up", reward: "Plata" },
    { rank: 3, name: "Ana Isabel Domínguez", streak: "8 Clases", trend: "up", reward: "Comprometido" },
    { rank: 4, name: "Hugo Watson Primero", streak: "5 Clases", trend: "up", isUser: true, reward: "Comprometido" },
    { rank: 5, name: "Priscila Mendoza", streak: "4 Clases", trend: "down" },
    { rank: 6, name: "Gabriela S. Ruiz", streak: "2 Clases", trend: "none" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Upper Unified Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black text-rose-300 tracking-widest uppercase mb-0.5">Sede Iztacalco</p>
          <h1 className="text-base font-black text-white uppercase tracking-tight">Rendimiento y Ranking</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Info Warning Banner dynamically updating depending on selected metrics */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4 border border-white/5 mb-6 flex gap-3 items-start"
      >
        {activeTab === "confianza" ? (
          <>
            <Shield className="w-5 h-5 text-[#ff4994] shrink-0 mt-0.5" />
            <p className="text-xs text-[#e2bdc6] leading-relaxed">
              El <strong className="text-white">Nivel de Confianza</strong> valora tu puntualidad y penaliza las faltas sin justificación. ¡El compromiso de cada una protege la permanencia de la sede!
            </p>
          </>
        ) : (
          <>
            <Flame className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-[#e2bdc6] leading-relaxed">
              La racha de <strong className="text-white">Compromiso</strong> premia tu constancia consecutiva semanal. ¡Suma sesiones completadas consecutivamente para ganar insignias exclusivas!
            </p>
          </>
        )}
      </motion.div>

      {/* Navigation Tabs - Switch Ranking type inline to eliminate duplicates */}
      <div className="flex bg-neutral-900 border border-white/5 p-1 rounded-xl mb-6 shadow-md">
        <button
          onClick={() => setActiveTab("confianza")}
          className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "confianza"
              ? "bg-[#ff4994] text-white shadow-md font-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Confianza
        </button>
        <button
          onClick={() => setActiveTab("compromiso")}
          className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "compromiso"
              ? "bg-purple-600 text-white shadow-md font-black"
              : "text-white/50 hover:text-white"
          }`}
        >
          Compromiso
        </button>
      </div>

      {/* Table List */}
      <div className="space-y-3">
        {activeTab === "confianza" ? (
          ranking.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                player.isUser
                  ? "bg-gradient-to-r from-[#2b1736] to-[#451034] border-[#ff4994] shadow-md shadow-[#ff4994]/10"
                  : "bg-white/5 border-white/5 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-sm text-[#ff4994]">
                  {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : `#${player.rank}`}
                </span>
                <div>
                  <p className={`text-sm font-black ${player.isUser ? "text-white" : "text-white/90"}`}>
                    {player.name} {player.isUser && "⭐(TÚ)"}
                  </p>
                  <p className="text-[10px] text-[#e2bdc6] font-semibold uppercase tracking-wider">
                    {player.classes} Clases Completadas
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-sm font-black text-[#ffb1c7] font-mono">
                  {player.score}
                </span>
                <p className="text-[9px] text-[#53e047] font-bold uppercase tracking-widest block">Elite</p>
              </div>
            </div>
          ))
        ) : (
          commitmentRanking.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                player.isUser
                  ? "bg-gradient-to-r from-[#1d102e] to-[#3a205a] border-purple-500 shadow-md shadow-purple-500/10"
                  : "bg-white/5 border-white/5 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-sm text-[#ffb1c7]">
                  {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : `#${player.rank}`}
                </span>
                <div>
                  <p className={`text-sm font-black ${player.isUser ? "text-white" : "text-white/90"}`}>
                    {player.name} {player.isUser && "🔥(TÚ)"}
                  </p>
                  {player.reward && (
                    <span className="inline-flex mt-1 items-center gap-0.5 px-2 py-0.5 rounded px-2 py-0.5 text-[8px] font-black tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                      Insignia: {player.reward}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-sm font-black text-purple-300 font-mono">
                  {player.streak}
                </span>
                <p className="text-[9px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-0.5 justify-end">
                  <span>🔥</span> Activa
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
