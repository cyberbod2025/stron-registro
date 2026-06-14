import { ScreenId, TransitionType, AlertNotification } from "../types";
import { motion } from "motion/react";
import { ArrowLeft, Bell, Trash2, ShieldAlert, CheckCircle, Flame, CalendarX, ArrowUpRight } from "lucide-react";

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
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#8E2DE214]/90 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => onNavigate(ScreenId.Inicio, "push_back")}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#C93CFF]" />
          <h1 className="text-sm font-black text-white uppercase tracking-wider">Alertas</h1>
        </div>
        <button
          onClick={onClear}
          className="p-2 rounded-xl text-xs text-white/40 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pt-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Bell className="w-16 h-16 text-white/10 mb-4" strokeWidth={1} />
            <p className="text-sm text-white/30 font-bold">No tienes alertas pendientes</p>
            <p className="text-xs text-white/15 mt-1">Las notificaciones aparecerán aquí</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = notif.unread;
            return (
              <motion.div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`relative rounded-2xl p-4 transition-all duration-300 border cursor-pointer ${
                  isUnread
                    ? "bg-[#F20F72]/8 border-[#F20F72]/30"
                    : "bg-white/[0.03] border-white/5"
                }`}
              >
                {isUnread && (
                  <span className="absolute top-4 right-4 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F20F72] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F20F72]"></span>
                  </span>
                )}

                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {notif.type === "error" && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                    {notif.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {notif.type === "warning" && <Flame className="w-5 h-5 text-[#F20F72] animate-pulse" />}
                    {notif.type === "info" && <CalendarX className="w-5 h-5 text-amber-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black uppercase tracking-wide ${isUnread ? "text-[#C93CFF]" : "text-white"}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[9px] text-white/30 font-mono">{notif.time}</span>
                    </div>
                    <p className="text-xs text-[#e2bdc6] mt-1 leading-relaxed">{notif.message}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {notif.id === "alert-iztacalco-crisis" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(notif.id);
                            onNavigate(ScreenId.InvitarAmiga, "slide_up");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#F20F72] text-white text-[10px] font-black tracking-widest uppercase flex items-center gap-1 active:scale-95 cursor-pointer"
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
                          className="px-3 py-1.5 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-200 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                          Ver Detalles
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
    </motion.div>
  );
}
