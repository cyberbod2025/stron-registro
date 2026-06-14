import { ScreenId, TransitionType } from "../types";
import { motion } from "motion/react";

interface ReglasProps {
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
}

export function ReglasScreen({ onNavigate }: ReglasProps) {
  const rules = [
    {
      icon: "groups",
      text: "Para que la clase se confirme necesitamos mínimo",
      highlight: "5 personas",
      suffix: "."
    },
    {
      icon: "schedule",
      text: "Fecha límite:",
      highlight: "un día antes",
      suffix: " a las 8:00 PM."
    },
    {
      icon: "how_to_reg",
      text: "Tu registro cuenta como",
      highlight: "compromiso de asistencia",
      suffix: "."
    },
    {
      icon: "cancel",
      text: "Si no puedes asistir, cancela",
      highlight: "antes del cierre",
      suffix: " por favor."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-5 pt-14 pb-28"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00a2ff] to-[#00e5ff] mb-4 shadow-[0_0_30px_rgba(255,73,148,0.3)]"
        >
          <span className="text-2xl">💪</span>
        </motion.div>
        <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">
          Compromiso{" "}
          <span className="text-[#00a2ff]">STRONG</span>
          {" "}💪
        </h1>
      </div>

      {/* Rules List */}
      <div className="space-y-4 mb-10">
        {rules.map((rule, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-4 p-4 rounded-2xl glass-card"
          >
            <div className="w-10 h-10 rounded-xl bg-[#00a2ff]/10 border border-[#00a2ff]/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[#00a2ff] text-xl">{rule.icon}</span>
            </div>
            <p className="text-sm text-[#e2bdc6] leading-relaxed pt-2">
              {rule.text}{" "}
              <strong className="text-[#00a2ff] font-extrabold">{rule.highlight}</strong>
              {rule.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#00a2ff]/10 to-purple-900/10 border border-[#00a2ff]/20"
      >
        <p className="text-lg font-black italic text-white uppercase tracking-tight mb-1">
          ¡Es por respeto a todas! 🙏
        </p>
        <p className="text-xs text-[#e2bdc6]">
          Estas reglas nos ayudan a mantener la comunidad fuerte y organizada.
        </p>
      </motion.div>
    </motion.div>
  );
}
