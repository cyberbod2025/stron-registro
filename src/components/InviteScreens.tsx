import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Users, Copy, Sparkles, MessageCircle, Check, Flame } from "lucide-react";
import React, { useState } from "react";

interface InviteProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onShowToast: (message: string) => void;
}

export function InviteScreen({ onNavigate, onShowToast }: InviteProps) {
  const [activeTab, setActiveTab] = useState<"quorum" | "meta5">("quorum");
  const [copied, setCopied] = useState(false);
  const [meta5Progress, setMeta5Progress] = useState(3);

  const handleCopy = () => {
    setCopied(true);
    onShowToast("¡Enlace copiado! Compártelo por WhatsApp");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMeta5Invite = (name: string) => {
    if (meta5Progress < 5) {
      const nextProgress = meta5Progress + 1;
      setMeta5Progress(nextProgress);
      onShowToast(`¡Invitación enviada con éxito a ${name}!`);

      if (nextProgress === 5) {
        setTimeout(() => {
          onNavigate(ScreenId.SuccessClassConfirmed, "slide_up");
        }, 1200);
      }
    } else {
      onNavigate(ScreenId.SuccessClassConfirmed, "slide_up");
    }
  };

  const quorumFriends = [
    { name: "Sofía Martínez", status: "Frecuente", phone: "+52 55 1234 5678" },
    { name: "Valeria Gómez", status: "Ausente", phone: "+52 55 9876 5432" },
    { name: "Camila Ruiz", status: "Frecuente", phone: "+52 55 4567 8901" },
  ];

  const meta5Candidates = [
    { name: "Jessica Rivas", label: "Nueva Invitada", icon: "👩‍🦰" },
    { name: "Tatiana Orozco", label: "Colega", icon: "👱‍♀️" },
    { name: "Mariana del Valle", label: "Vecina", icon: "👩" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black text-rose-300 tracking-widest uppercase mb-0.5">Invitar Amigas</span>
          <h1 className="text-base font-black text-white uppercase tracking-tight">Comunidad Strong</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Segmented Controller Toggles */}
      <div className="flex bg-[#12050c] border border-white/5 p-1 rounded-xl mb-6 shadow-md">
        <button
          onClick={() => setActiveTab("quorum")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "quorum" ? "bg-[#ff4994] text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Salvar Quórum
        </button>
        <button
          onClick={() => setActiveTab("meta5")}
          className={`flex-1 py-1.5 text-xs font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === "meta5" ? "bg-[#ff4994] text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Reto Meta 5
        </button>
      </div>

      {activeTab === "quorum" ? (
        <div className="space-y-6">
          {/* S.O.S Crisis Alert Widget Card */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-rose-950/20 to-[#14050c] border border-rose-500/40 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">Urgencia de Asistencia</p>
            </div>

            <h2 className="text-base font-black text-white uppercase leading-tight italic">
              Falta <span className="text-[#ff4994] font-black">1 alumna</span> para confirmar la sesión hoy
            </h2>

            <p className="text-[11px] text-[#e2bdc6] leading-relaxed">
              La regla de Sede estipula un quórum de 5 atletas confirmadas para las 10:00 PM o se cancelará la clase. ¡Salva el entrenamiento compartiendo el enlace!
            </p>
          </div>

          {/* Core Link Sharing box */}
          <div className="glass-card rounded-2xl p-4 space-y-3 border border-white/5">
            <label className="text-[9px] font-black uppercase text-[#ffb1c7] tracking-widest leading-none">Enlace Compartible</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="https://strong.iztacalco.fit/invite/hugo-watson"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-[#ff4994] text-white hover:bg-[#ff4994]/90 transition-all flex items-center justify-center cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick lists */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Enviar por WhatsApp</h3>
            <div className="space-y-3">
              {quorumFriends.map((friend, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-colors"
                >
                  <div>
                    <p className="text-xs font-black text-white">{friend.name}</p>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      {friend.status}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onShowToast(`Abriendo chat con ${friend.name}...`);
                      setTimeout(() => {
                        onNavigate(ScreenId.Confirmada, "push");
                      }, 1200);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Invitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goal Progress Card */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-[#2a173c] to-[#12051c] border border-purple-500/40 space-y-3 shadow-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> Meta 5: Pase VIP Activo
              </span>
              <span className="font-mono font-bold text-white">{meta5Progress} / 5</span>
            </div>

            <div className="w-full bg-[#1e0f14] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#ff4994] h-full rounded-full transition-all duration-500"
                style={{ width: `${(meta5Progress / 5) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-[#e2bdc6] leading-relaxed">
              Invita a 5 amigas nuevas a registrarse en Strong Nation Iztacalco. Al completarse, desbloquearás un cupón de un <strong className="text-white">Pase VIP con 3 entrenamientos gratis</strong>.
            </p>
          </div>

          {/* Meta 5 direct candidate invites */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Amigas Recomendadas</h3>
            <div className="space-y-3">
              {meta5Candidates.map((friend, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{friend.icon}</span>
                    <div>
                      <p className="text-xs font-black text-white leading-none">{friend.name}</p>
                      <p className="text-[9px] text-[#e2bdc6]/70 mt-1">{friend.label}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMeta5Invite(friend.name)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
                  >
                    Invitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
