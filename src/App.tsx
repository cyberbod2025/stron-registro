import { useState, useEffect } from "react";
import { ScreenId, TransitionType, AlertNotification, ClassRegistration, ClassSession } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import bgImage from "./assets/app_background.png";

// Import components
import { RoleSelectionScreen } from "./components/RoleSelectionScreen";
import { Splash, HomeScreen } from "./components/SplashScreens";
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
import { ReglasScreen } from "./components/ReglasScreen";
import { MisRegistrosScreen } from "./components/MisRegistrosScreen";

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    // Si ya tiene sesión de instructor, puede ir directo al panel, de lo contrario a selección
    const isInstr = window.location.search.includes('admin=true') || localStorage.getItem('isInstructor') === 'true';
    return isInstr ? ScreenId.PanelInstructor : ScreenId.RoleSelection;
  });
  const [transition, setTransition] = useState<TransitionType>("none");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Classes State
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Registration State
  const [registration, setRegistration] = useState<ClassRegistration>({
    classId: "",
    fullName: "",
    email: "",
    mobile: "",
    isCommitted: false,
    understandsGoal: false,
    willCancelInTime: false,
  });

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import('./lib/supabase');
      
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('starts_at', { ascending: true, nullsFirst: false });

      if (classesError) throw classesError;

      const { data: regData, error: regError } = await supabase
        .from('registrations')
        .select('class_id');

      if (regError) throw regError;

      const regCounts = (regData || []).reduce((acc: Record<string, number>, reg: any) => {
        acc[reg.class_id] = (acc[reg.class_id] || 0) + 1;
        return acc;
      }, {});

      const loadedClasses: ClassSession[] = (classesData || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        dateStr: c.date_str,
        timeStr: c.time_str,
        startsAt: c.starts_at,
        location: c.location,
        address: c.address,
        isPrivateLocation: c.is_private_location,
        status: c.status === 'cancelled' ? 'suspendida' : ((regCounts[c.id] || 0) >= c.min_required ? 'confirmada' : 'pendiente'),
        confirmedCount: regCounts[c.id] || 0,
        minRequired: c.min_required,
        deadlineStr: c.deadline_str,
        mapsUrl: c.maps_url,
        wazeUrl: c.waze_url,
        calendarUrl: c.calendar_url,
        cancelledAt: c.cancelled_at,
        cancellationReason: c.cancellation_reason
      }));

      setClasses(loadedClasses);
      if (loadedClasses.length > 0) {
        setRegistration(prev => ({ ...prev, classId: loadedClasses[0].id }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  // Toggle user role
  const [isInstructor, setIsInstructor] = useState(() => {
    return window.location.search.includes('admin=true') || localStorage.getItem('isInstructor') === 'true';
  });

  const handleInstructorLogin = (password: string) => {
    if (password === import.meta.env.VITE_INSTRUCTOR_PIN) {
      setIsInstructor(true);
      localStorage.setItem('isInstructor', 'true');
      return true;
    }
    return false;
  };

  const handleInstructorLogout = () => {
    setIsInstructor(false);
    localStorage.removeItem('isInstructor');
    if (window.location.search.includes('admin=true')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

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

  // Determine which tab is active for bottom nav highlighting
  const getActiveTab = (): string => {
    switch (currentScreen) {
      case ScreenId.RoleSelection:
        return "none";
      case ScreenId.Splash:
      case ScreenId.Inicio:
        return "inicio";
      case ScreenId.RegistroDeClase:
      case ScreenId.Confirmada:
      case ScreenId.ClaseCancelada:
      case ScreenId.MisRegistros:
        return "clases";
      case ScreenId.Reglas:
        return "reglas";
      case ScreenId.MiPerfil:
        return "perfil";
      case ScreenId.PanelInstructor:
        return "dashboard";
      default:
        return "inicio";
    }
  };

  const activeTab = getActiveTab();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case ScreenId.RoleSelection:
        return <RoleSelectionScreen onNavigate={handleNavigate} onInstructorLogin={handleInstructorLogin} onShowToast={onShowToast} />;
      case ScreenId.Splash:
        return <HomeScreen onNavigate={handleNavigate} classes={classes} isLoading={isLoading} onSelectClass={(id) => setRegistration(prev => ({ ...prev, classId: id }))} />;
      case ScreenId.Inicio:
        return <InicioScreen onNavigate={handleNavigate} classes={classes} onSelectClass={(id) => setRegistration(prev => ({ ...prev, classId: id }))} />;
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
            onShowToast={onShowToast}
            classSession={classes.find(c => c.status === "confirmada") || classes[0]}
            registration={registration}
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
        return (
          <ProfileScreen
            onNavigate={handleNavigate}
            userEmail={registration.email}
            userName={registration.fullName}
            userPhone={registration.mobile}
            isInstructor={isInstructor}
            onInstructorLogin={handleInstructorLogin}
            onInstructorLogout={handleInstructorLogout}
            onShowToast={onShowToast}
          />
        );
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
        return <MisRegistrosScreen onNavigate={handleNavigate} classes={classes} />;
      case ScreenId.Reglas:
        return <ReglasScreen onNavigate={handleNavigate} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} classes={classes} isLoading={isLoading} onSelectClass={(id) => setRegistration(prev => ({ ...prev, classId: id }))} />;
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

  // Bottom nav items
  const navItems = isInstructor
    ? [
        { id: "dashboard", icon: "dashboard", label: "Dashboard", screen: ScreenId.PanelInstructor },
        { id: "perfil", icon: "person", label: "Perfil", screen: ScreenId.MiPerfil },
      ]
    : [
        { id: "inicio", icon: "home", label: "Inicio", screen: ScreenId.Splash },
        { id: "clases", icon: "event_note", label: "Mis clases", screen: ScreenId.MisRegistros },
        { id: "reglas", icon: "gavel", label: "Reglas", screen: ScreenId.Reglas },
        { id: "perfil", icon: "person", label: "Perfil", screen: ScreenId.MiPerfil },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1e0f14] font-sans antialiased overflow-x-hidden relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      ></div>
      {/* Decorative ambient spots */}
      <div className="fixed top-[-15%] left-[-15%] w-[55%] h-[55%] bg-[#00a2ff]/8 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-purple-950/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto relative z-10 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={animStyle.initial}
          animate={animStyle.animate}
          exit={animStyle.exit}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 w-full relative z-10"
        >
          {renderActiveScreen()}
        </motion.div>
      </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {currentScreen !== ScreenId.RoleSelection && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#150a0e]/95 backdrop-blur-xl border-t border-white/5 safe-bottom">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.screen, "none")}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === item.id
                  ? "text-[#00a2ff]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${activeTab === item.id ? 'font-bold' : ''}`} style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold tracking-wide ${activeTab === item.id ? 'font-extrabold' : ''}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="w-1 h-1 rounded-full bg-[#00a2ff]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
          </div>
        </nav>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-[60] max-w-lg mx-auto p-3.5 rounded-xl bg-neutral-900/95 backdrop-blur-lg border border-[#00a2ff]/30 text-xs text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
