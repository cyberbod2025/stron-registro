import { useState } from "react";
import { ScreenId, TransitionType, AlertNotification, ClassRegistration, ClassSession } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Command, RefreshCw } from "lucide-react";

// Import consolidated components
import { Splash } from "./components/SplashScreens";
import { ProfileScreen } from "./components/ProfileScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { InviteScreen } from "./components/InviteScreens";
import {
  RegistroDeClaseScreen,
  ConfirmadaScreen,
  ClaseCanceladaIztacalcoScreen
} from "./components/ClassScreens";
import { InicioScreen } from "./components/InicioScreens";
import { PanelInstructor } from "./components/InstructorScreens";

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(ScreenId.Splash);
  const [transition, setTransition] = useState<TransitionType>("none");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dev mode drawer toggle
  const [showDevBar, setShowDevBar] = useState(true);

  // Mock Classes State
  const [classes, setClasses] = useState<ClassSession[]>([
    {
      id: "c1",
      title: "Strong Nation",
      dateStr: "Martes",
      timeStr: "9:00 a.m.",
      location: "Casa de Viri",
      status: "confirmada",
      confirmedCount: 6,
      minRequired: 5,
      deadlineStr: "lunes 8:00 p.m.",
    },
    {
      id: "c2",
      title: "Strong Nation",
      dateStr: "Jueves",
      timeStr: "9:00 a.m.",
      location: "Casa de Viri",
      status: "pendiente",
      confirmedCount: 3,
      minRequired: 5,
      deadlineStr: "miércoles 8:00 p.m.",
    },
    {
      id: "c3",
      title: "Strong Nation",
      dateStr: "Domingo",
      timeStr: "8:30 a.m.",
      location: "Day Cardio",
      status: "suspendida",
      confirmedCount: 3,
      minRequired: 5,
      deadlineStr: "sábado 8:00 p.m.",
    }
  ]);

  // Registration data state
  const [registration, setRegistration] = useState<ClassRegistration>({
    classId: "c2",
    fullName: "Valeria Gómez",
    email: "valeria@example.com",
    mobile: "55 1234 5678",
    isCommitted: false,
    understandsGoal: false,
    willCancelInTime: false,
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  // Toggle user role
  const [isInstructor, setIsInstructor] = useState(false);

  const onShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleNavigate = (nextScreen: ScreenId, transitionType: TransitionType) => {
    setTransition(transitionType);
    setCurrentScreen(nextScreen);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    onShowToast("Notificaciones vaciadas.");
  };

  // Screen description lookup dictionary for the user/developer picker
  const screenDescriptions: Record<ScreenId, string> = {
    [ScreenId.Splash]: "1. Pantalla de Bienvenida (Intro)",
    [ScreenId.Inicio]: "2. Inicio / Próxima Clase (Quórum)",
    [ScreenId.RegistroDeClase]: "3. Formulario de Inscripción",
    [ScreenId.Confirmada]: "4. Estado: Clase Confirmada",
    [ScreenId.ClaseCancelada]: "5. Estado: Clase Suspendida",
    [ScreenId.InvitarAmiga]: "6. Salvar Quórum (Compartir)",
    [ScreenId.MisRegistros]: "7. Mis Registros",
    [ScreenId.MiPerfil]: "8. Mi Perfil y Nivel de Confianza",
    [ScreenId.Notificaciones]: "9. Notificaciones",
    [ScreenId.PanelInstructor]: "10. Panel de Instructor"
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case ScreenId.Splash:
        return <Splash onNavigate={handleNavigate} />;
      case ScreenId.Inicio:
        return <InicioScreen onNavigate={handleNavigate} classes={classes} />;
      case ScreenId.RegistroDeClase:
        return (
          <RegistroDeClaseScreen
            onNavigate={handleNavigate}
            onShowToast={onShowToast}
            registration={registration}
            onChangeRegistration={setRegistration}
            classes={classes}
          />
        );
      case ScreenId.Confirmada:
        return (
          <ConfirmadaScreen
            onNavigate={handleNavigate}
            classSession={classes.find(c => c.status === "confirmada") || classes[0]}
          />
        );
      case ScreenId.ClaseCancelada:
        return <ClaseCanceladaIztacalcoScreen onNavigate={handleNavigate} classSession={classes.find(c => c.status === "suspendida") || classes[0]} />;
      case ScreenId.Notificaciones:
        return (
          <NotificationsScreen
            notifications={notifications}
            onNavigate={handleNavigate}
            onClear={handleClearNotifications}
            onMarkRead={handleMarkAsRead}
          />
        );
      case ScreenId.MiPerfil:
        return <ProfileScreen onNavigate={handleNavigate} userEmail={registration.email} />;
      case ScreenId.InvitarAmiga:
        return <InviteScreen onNavigate={handleNavigate} onShowToast={onShowToast} classSession={classes.find(c => c.status === "pendiente") || classes[0]} />;
      case ScreenId.PanelInstructor:
        return (
          <PanelInstructor
            onNavigate={handleNavigate}
            onShowToast={onShowToast}
            classes={classes}
          />
        );
      case ScreenId.MisRegistros:
        // Temporal fallback to Inicio if MisRegistros is not fully built yet
        return <InicioScreen onNavigate={handleNavigate} classes={classes} />;
      default:
        return <Splash onNavigate={handleNavigate} />;
    }
  };

  // Classify transition style
  const getTransitionStyle = () => {
    if (transition === "slide_up") {
      return { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "-100%", opacity: 0 } };
    }
    if (transition === "push") {
      return { initial: { x: "100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "-100%", opacity: 0 } };
    }
    if (transition === "push_back") {
      return { initial: { x: "-100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } };
    }
    return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  };

  const animStyle = getTransitionStyle();

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-start md:items-stretch bg-neutral-950 font-sans antialiased overflow-x-hidden md:p-6 lg:p-10 gap-6">
      
      {/* Decorative ambient spots */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ff4994]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Dev Navigation Sidebar (Visible of Desktop, expandable on mobile) */}
      <div className={`w-full md:w-80 shrink-0 bg-neutral-900/90 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 self-start relative z-20 ${showDevBar ? "block" : "hidden md:block"}`}>
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-white">
            <Command className="w-4 h-4 text-[#ff4994]" />
            <h2 className="text-xs font-black tracking-widest uppercase">Mapeo de Pantallas (V1)</h2>
          </div>
          <button
            onClick={() => setShowDevBar(false)}
            className="md:hidden text-xs text-[#e2bdc6] border border-white/10 px-2 py-0.5 rounded uppercase cursor-pointer"
          >
            Ocultar ✕
          </button>
        </div>

        <p className="text-[10px] text-[#e2bdc6] leading-relaxed">
          Navegación centrada en el sistema de Quórum. Rankigns ocultos para V2.
        </p>

        {/* List of screens */}
        <div className="flex-1 max-h-[420px] md:max-h-[580px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {Object.values(ScreenId).map((scrName) => {
            const isActive = currentScreen === scrName;
            return (
              <button
                key={scrName}
                onClick={() => {
                  setTransition("none");
                  setCurrentScreen(scrName);
                }}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-[#ff4994]/25 text-[#ffb1c7] border border-[#ff4994]/50 font-black"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <span className="truncate">{screenDescriptions[scrName as ScreenId] || scrName}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#ff4994]"></span>}
              </button>
            );
          })}
        </div>

        <div className="border-t border-white/5 pt-3 space-y-2">
          <button
            onClick={() => setIsInstructor(!isInstructor)}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-900/20 border border-purple-500/30 text-[10px] text-purple-200 hover:text-white hover:bg-purple-900/40 font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            Rol actual: {isInstructor ? "INSTRUCTOR" : "ALUMNA"}
          </button>
          <button
            onClick={() => {
              setTransition("none");
              setCurrentScreen(ScreenId.Splash);
              onShowToast("Flujo Restablecido.");
            }}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/80 hover:text-white hover:bg-white/10 font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reiniciar Flujo
          </button>
        </div>
      </div>

      {/* Main Simulation Sandbox */}
      <div className="flex-1 max-w-sm sm:max-w-md w-full mx-auto relative z-10 flex flex-col items-center">
        {/* Toggle dev bar button on mobile */}
        <button
          onClick={() => setShowDevBar(!showDevBar)}
          className="md:hidden mb-4 px-4 py-2 border border-white/10 rounded-full text-[10px] font-black text-[#ffb1c7] bg-neutral-900 uppercase tracking-widest flex items-center gap-1.5 self-center shadow cursor-pointer"
        >
          <Command className="w-3.5 h-3.5" />
          {showDevBar ? "Ocultar Mando Dev" : "Mostrar Mando Dev"}
        </button>

        {/* Mock SmartPhone Container Frame */}
        <div className="relative w-full max-w-sm sm:max-w-md bg-[#1e0f14] border-[7px] border-neutral-800 rounded-[35px] shadow-[0_0_60px_rgba(255,73,148,0.15)] overflow-hidden flex flex-col justify-between" style={{ minHeight: "840px" }}>
          
          {/* Phone Top Speaker/Camera notch cut */}
          <div className="absolute top-0 inset-x-0 h-5 bg-neutral-800 rounded-b-xl z-50 flex justify-center items-center">
            <div className="w-16 h-3.5 bg-neutral-950 rounded-full flex items-center justify-center">
              <span className="block w-2.5 h-2.5 rounded-full bg-blue-900/40"></span>
            </div>
          </div>

          {/* Core App View Stage with AnimatePresence */}
          <div className="flex-1 pt-6 pb-4 overflow-y-auto px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={animStyle.initial}
                animate={animStyle.animate}
                exit={animStyle.exit}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full h-full"
              >
                {renderActiveScreen()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dynamic Floating Toast */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-6 inset-x-6 z-50 p-3.5 rounded-xl bg-neutral-900 border border-[#ff4994]/30 text-xs text-white shadow-xl flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active bottom navigation strip indicator */}
          <div className="py-2.5 bg-[#150a0e] flex justify-around border-t border-white/5 relative z-40">
            {isInstructor ? (
              <>
                <button
                  onClick={() => handleNavigate(ScreenId.PanelInstructor, "none")}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] cursor-pointer ${
                    currentScreen === ScreenId.PanelInstructor ? "text-[#ffb1c7] font-extrabold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate(ScreenId.Inicio, "none")}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] cursor-pointer ${
                    currentScreen === ScreenId.Inicio ? "text-[#ffb1c7] font-extrabold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span>🏠</span>
                  <span>Inicio</span>
                </button>
                <button
                  onClick={() => handleNavigate(ScreenId.RegistroDeClase, "none")}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] cursor-pointer ${
                    currentScreen === ScreenId.RegistroDeClase ? "text-[#ffb1c7] font-extrabold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span>📝</span>
                  <span>Registrarme</span>
                </button>
                <button
                  onClick={() => handleNavigate(ScreenId.MisRegistros, "none")}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] cursor-pointer ${
                    currentScreen === ScreenId.MisRegistros ? "text-[#ffb1c7] font-extrabold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span>📅</span>
                  <span>Registros</span>
                </button>
                <button
                  onClick={() => handleNavigate(ScreenId.MiPerfil, "none")}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] cursor-pointer ${
                    currentScreen === ScreenId.MiPerfil ? "text-[#ffb1c7] font-extrabold" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  <span>👤</span>
                  <span>Perfil</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
