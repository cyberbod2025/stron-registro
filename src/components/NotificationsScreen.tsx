import { ScreenId, TransitionType, AlertNotification } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Bell, Trash2, ShieldAlert, CheckCircle, Flame, CalendarX, ArrowUpRight } from "lucide-react";
import React from 'react';

interface NotificationsProps {
  notifications: AlertNotification[];
  onNavigate: (screen: ScreenId, transition: TransitionType) => void;
  onClear: () => void;
  onMarkRead: (id: string) => void;
}

export function NotificationsScreen({
  notifications,
  onNavigate,
  onClear,
  onMarkRead,
}: NotificationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 md:p-6 max-w-lg mx-auto pb-24"
    >
      {/* Upper header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#ffb1c7]" />
          <h1 className="text-base font-black text-white uppercase tracking-tight">Centro de Alertas</h1>
        </div>
        <button
          onClick={onClear}
          className="p-2 rounded-lg text-xs font-bold text-white/50 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
          title="Limpiar alertas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4 bg-white/5 border border-white/5">
            <Bell className="w-12 h-12 text-white/20 mx-auto animate-pulse" strokeWidth={1} />
            <p className="text-[#e2bdc6] text-xs font-bold uppercase tracking-wider">No tienes alertas pendientes</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = notif.unread;
            return (
              <motion.div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`relative rounded-2xl p-4 transition-all duration-300 border ${
                  isUnread
                    ? "bg-[#ff4994]/10 border-[#ff4994]/40 hover:bg-[#ff4994]/15"
                    : "bg-white/5 border-white/10 hover:bg-white/8"
                }`}
              >
                {isUnread && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4994] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4994]"></span>
                  </span>
                )}

                <div className="flex gap-3">
                  <div className="mt-1">
                    {notif.type === "error" && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                    {notif.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {notif.type === "warning" && <Flame className="w-5 h-5 text-[#ff4994] animate-pulse" />}
                    {notif.type === "info" && <CalendarX className="w-5 h-5 text-amber-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black uppercase tracking-wide ${isUnread ? "text-[#ffb1c7]" : "text-white"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[9px] text-[#e2bdc6] font-mono">{notif.time}</span>
                    </div>
                    <p className="text-xs text-[#e2bdc6] mt-1 leading-relaxed">{notif.message}</p>

                    {/* Interactive actions linked dynamically */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {notif.id === "alert-iztacalco-crisis" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notif.id);
                            onNavigate(ScreenId.InvitarAmiga, "slide_up");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#ff4994] text-white text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-md hover:brightness-115 active:scale-95 cursor-pointer"
                        >
                          Invitar Amiga
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}

                      {notif.id === "alert-iztacalco-cancelada" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notif.id);
                            onNavigate(ScreenId.ClaseCancelada, "push");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-orange-600/30 border border-orange-500/50 text-orange-200 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-md hover:bg-orange-600/50 active:scale-95 cursor-pointer"
                        >
                          Ver Detalles de Cancelación
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}

                      {notif.id === "alert-meta-5" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notif.id);
                            onNavigate(ScreenId.InvitarAmiga, "slide_up");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#582ea2] text-[#d3bbff] border border-[#d3bbff]/30 text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-md hover:brightness-115 active:scale-95 cursor-pointer"
                        >
                          Completar Meta 5
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="mt-8 text-center bg-white/5 border border-white/10 rounded-2xl p-4">
        <p className="text-xs text-white/80 font-black uppercase tracking-wider mb-2">💡 Tips de Rendición de Cuentas</p>
        <p className="text-[10px] text-[#e2bdc6] leading-relaxed">
          Las clases con menos de <strong className="text-white">5 alumnas confirmadas</strong> a las 8:00 p.m. del día anterior se cancelan automáticamente en la red Strong. ¡Trabaja junto a tu equipo para evitarlo!
        </p>
      </div>
    </motion.div>
  );
}
